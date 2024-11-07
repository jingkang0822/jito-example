# Jito Example

This repository demonstrates how to use Jito bundles on the Solana blockchain to send multiple SPL token transactions in one atomic bundle. The example uses TypeScript to construct and send transactions, making use of Jito's infrastructure for bundled transactions.

## Overview

The goal of this project is to showcase the creation of bundled transactions, particularly for transferring USDC tokens on Solana using Jito's relayer infrastructure. Jito bundles help to ensure that multiple transactions are executed together in the same block, adding efficiency and reliability.

## Features

- Sending multiple SPL token transactions in a bundle.
- Integration with Jito relayer to leverage bundle efficiency.
- Priority fees with Jito to incentivize validators.
- Example usage of SPL Token transfer with associated token accounts.

## Prerequisites

To run this project, you'll need the following:

- Node.js installed (v16+ recommended)
- npm or yarn
- A Solana wallet (private key in a secure format)
- A Solana RPC endpoint (e.g., mainnet-beta)

### Libraries

- `@solana/web3.js` - Solana web3 library for interacting with the blockchain.
- `@solana/spl-token` - SPL token library for token operations.
- `node-fetch` - To interact with the Jito relayer endpoints.

## Setup

1. **Clone the Repository**

   ```sh
   git clone https://github.com/jingkang0822/jito-example.git
   cd jito-example
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Add Environment Variables**
   Create a `.env` file with the following details:

   ```
   PRIVATE_KEY=[Your Private Key Here]
   ```

4. **Run the Script**
   Use `ts-node` to run the script:
   ```sh
   npx ts-node run-jito.ts
   ```

## Explanation

The script initializes a connection to the Solana network and interacts with the Jito relayer to send bundled transactions. The `run-jito.ts` script performs the following steps:

1. **Setup Connection and Signer**: Establishes a connection to the Solana blockchain and initializes the sender's keypair.
2. **Get Jito Tip Account**: Fetches a Jito tip account to incentivize validators to prioritize the transaction.
3. **Create Transactions**: Constructs SPL token transactions for USDC transfer, including the priority fee.
4. **Simulate the Bundle**: Simulates the transaction bundle to ensure it will succeed.
5. **Send Bundle**: Sends the bundle to the Jito relayer.
6. **Verify the Bundle Landed**: Verifies that the bundle has been included in the blockchain.

## Important Notes

- **Tip Account**: Ensure the tip account is fetched properly; without the tip, validators may not prioritize your bundle.
- **Private Key**: Securely manage your private keys. Never expose them publicly.
- **Network Fees**: Ensure you have enough SOL for network fees when sending the bundle.

## Example Output

If everything runs correctly, you should see output similar to:

```
Initializing Jito Bundles demo. Sending transactions from DiWzW6UpNEbRnRnnWoiwJPEa1i11j9K4h6Du7mFXQxum.
✅ - Established connection to QuickNode.
✅ - My SOL balance: 0.01
✅ - My USDC balance: 0.03
✅ - Using the following Jito Tip account: DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL
✅ - Latest blockhash: HXxJE9ctnKScNdgGhHvMTqb3GBqg6wJTni2gGLzErmPz
✅ - Transactions assembled and encoded.
✅ - Simulation Succeeded.
✅ - Bundle sent with ID: 6c470851c76a8a80b19a95141f4700ec1aee02041e8ee1c132421e1e738a2584
Bundle status: Landed, Landed slot: 299929769
✅ - Bundle confirmed on-chain at slot 299929769
✅ - Bundle Explorer URL: https://explorer.jito.wtf/bundle/6c470851c76a8a80b19a95141f4700ec1aee02041e8ee1c132421e1e738a2584
Transaction URLs (3 transactions):
Transaction 1: https://solscan.io/tx/3i6V9X9CucpKGs5KFiVCJPvJSkevTfDx4SFEfJ5PNorwVjSn94tfHAF659n3z31iU3BqERMDXN8QPBg82kFVyCgm
Transaction 2: https://solscan.io/tx/3q6b5ArDAHgUU3QE5CUxWczQKhJ4gQzo4aFeykNvZ97bks3qx4THZgQhTaeY9bTazUAFbt8rL8dTkRkyLQvY7t87
Transaction 3: https://solscan.io/tx/2gGkEWHkEWmec9Vq7fBedceBYUYEbd2Kc6ZD6PzrU7jZfpBp4iaXr2pD4Ut2dY4hiLEYhqtAi3itaEKinrECrdDG
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or raise an issue for any bug or feature request.

## Contact

For any questions, feel free to contact the repository owner through GitHub.
