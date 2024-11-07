import { Connection, Transaction, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { JitoJsonRpcClient } from './jitoClient';
import fetch from 'node-fetch';
import * as fs from 'fs';
import bs58 from 'bs58';

const MINIMUM_JITO_TIP = 1_000; // lamports
const ENDPOINT = 'https://api.mainnet-beta.solana.com';
const JITO_RPC_URL = 'https://mainnet.block-engine.jito.wtf/api/v1';
const JITO_CLIENT = new JitoJsonRpcClient(JITO_RPC_URL, "");
const TOKEN_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint acc
const RECEIVER_ADDRESS = new PublicKey('2QPAGadWocRV5Veqd4LBFann6FUqfNEq7of67Rqckkxs');


(async () => {
    // Step 1 - Setup
    const keypairPath = `${process.cwd()}/my-keypair.json`;
    const secretKey = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(secretKey));
    console.log(`Initializing Jito Bundles demo. Sending transactions from ${signer.publicKey.toBase58()}.`);

    const solanaRpc = new Connection(ENDPOINT, 'confirmed');
    console.log(`✅ - Established connection to QuickNode.`);
    
    // Step 1.1 - Check my SOL balance
    const myBalance = await solanaRpc.getBalance(signer.publicKey);
    console.log(`✅ - My SOL balance: ${myBalance / LAMPORTS_PER_SOL}`);

    // Step 1.2 - Check my USDC balance
    const myATA = await getAssociatedTokenAddress(TOKEN_MINT, signer.publicKey);
    const myUSDCBalance = await solanaRpc.getTokenAccountBalance(myATA);
    console.log(`✅ - My USDC balance: ${myUSDCBalance.value.uiAmount}`);

    // Step 2 - Get a Jitotip account
    const jitoTipAddress = await JITO_CLIENT.getRandomTipAccount();
    console.log(`✅ - Using the following Jito Tip account: ${jitoTipAddress}`);

    // Step 3 - Get Recent Blockhash
    const { blockhash } = await solanaRpc.getLatestBlockhash();
    console.log(`✅ - Latest blockhash: ${blockhash}`);

    // Step 4 - Create Transactions
    const transaction1 = await createTransferTransaction(signer, RECEIVER_ADDRESS, 0.01 * Math.pow(10, 6), blockhash);
    const transaction2 = await createTransferTransaction(signer, RECEIVER_ADDRESS, 0.02 * Math.pow(10, 6), blockhash, jitoTipAddress);
    
    const signedTransactions = [...transaction1, ...transaction2];

    const base58EncodedTransactions = signedTransactions.map((transaction) => {
        return bs58.encode(transaction.serialize({ verifySignatures: false }));
    });
    console.log(`✅ - Transactions assembled and encoded.`);

    try {
        // Step 5 - Simulate Bundle
        // Simulate first
        // const simulation = await JITO_CLIENT.simulateBundle([base58EncodedTransactions]);
        // if (!simulation.result.success) {
        //     throw new Error('Bundle simulation failed');
        // }
        // console.log(`✅ - Simulation Succeeded.`);

        // if (SIMULATE_ONLY) {
        //     console.log("🏁 - Simulation Only Mode - Exiting script.");
        //     return;
        // }

        // Step 6 - Send and Confirm Bundle
        const result = await JITO_CLIENT.sendBundle([base58EncodedTransactions]);
        const bundleId = result.result;
        console.log(`✅ - Bundle sent with ID: ${bundleId}`);

        // Wait for confirmation
        const inflightStatus = await JITO_CLIENT.confirmInflightBundle(bundleId, 120000);
        console.log('Bundle status:', JSON.stringify(inflightStatus, null, 2));

        if (inflightStatus.confirmation_status === "confirmed") {
            console.log(`✅ - Bundle confirmed on-chain at slot ${inflightStatus.slot}`);

            // Get final bundle status
            const finalStatus = await JITO_CLIENT.getBundleStatuses([[bundleId]]);
            
            if (finalStatus.result?.value?.[0]) {
                const status = finalStatus.result.value[0];
                console.log(`✅ - Bundle Explorer URL: https://explorer.jito.wtf/bundle/${bundleId}`);
                
                if (status.transactions?.length > 0) {
                    console.log(`Transaction URLs (${status.transactions.length} transactions):`);
                    status.transactions.forEach((txId: string, index: any) => {
                        console.log(`Transaction ${index + 1}: https://solscan.io/tx/${txId}`);
                    });
                }
            }
        } else if (inflightStatus.err) {
            throw new Error(`Bundle processing failed: ${inflightStatus.err}`);
        }

    } catch (error: any) {
        console.error("❌ - Error processing bundle:", error);
        if (error.response?.data) {
            console.error("Server response:", error.response.data);
        }
        throw error;
    }
})();

async function createKeyPairSignerFromBytes(bytes: Uint8Array): Promise<Keypair> {
    return Keypair.fromSecretKey(bytes);
}

async function createTransferTransaction(
    sender: Keypair,
    receiver: PublicKey,
    amount: number,
    latestBlockhash: string,
    includeTip?: PublicKey
): Promise<Transaction[]> {
    const senderATA = await getAssociatedTokenAddress(TOKEN_MINT, sender.publicKey);
    const receiverATA = await getAssociatedTokenAddress(TOKEN_MINT, receiver);

    // Create token transfer transaction
    const tokenTransferTx = new Transaction();
    tokenTransferTx.add(
        createTransferInstruction(
            senderATA,
            receiverATA,
            sender.publicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID
        )
    );
    tokenTransferTx.recentBlockhash = latestBlockhash;
    tokenTransferTx.feePayer = sender.publicKey;
    tokenTransferTx.partialSign(sender);

    let transactions = [tokenTransferTx];

    // Create tip transaction if needed
    if (includeTip) {
        const tipTx = new Transaction();
        tipTx.add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: includeTip,
                lamports: MINIMUM_JITO_TIP,
            })
        );
        tipTx.recentBlockhash = latestBlockhash;
        tipTx.feePayer = sender.publicKey;
        tipTx.partialSign(sender);
        
        transactions.push(tipTx);
    }

    return transactions;
}
