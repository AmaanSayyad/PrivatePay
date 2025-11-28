import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

export async function aptosWithdrawRoutes(fastify, options) {
  // Withdraw endpoint - sends APT from treasury to user wallet
  fastify.post("/withdraw", async (request, reply) => {
    try {
      const { username, destinationAddress, amount } = request.body;

      if (!username || !destinationAddress || !amount) {
        return reply.status(400).send({
          error: "username, destinationAddress and amount are required",
        });
      }

      if (amount <= 0) {
        return reply.status(400).send({
          error: "Amount must be greater than 0",
        });
      }

      // Get treasury private key from env
      const treasuryPrivateKey = process.env.APTOS_TREASURY_PRIVATE_KEY;
      if (!treasuryPrivateKey) {
        console.error("APTOS_TREASURY_PRIVATE_KEY not configured");
        return reply.status(500).send({
          error: "Treasury wallet not configured",
        });
      }

      // Initialize Aptos client
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);

      // Create treasury account from private key
      const privateKey = new Ed25519PrivateKey(treasuryPrivateKey);
      const treasuryAccount = Account.fromPrivateKey({ privateKey });

      console.log(`Treasury address: ${treasuryAccount.accountAddress.toString()}`);
      console.log(`Withdrawing ${amount} APT to ${destinationAddress} for user ${username}`);

      // Convert APT to Octas (1 APT = 100,000,000 Octas)
      const amountInOctas = Math.floor(amount * 100_000_000);

      // Build transfer transaction
      const transaction = await aptos.transaction.build.simple({
        sender: treasuryAccount.accountAddress,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [destinationAddress, amountInOctas],
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: treasuryAccount,
        transaction,
      });

      // Wait for transaction to be confirmed
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      console.log(`Withdrawal successful: ${committedTxn.hash}`);

      return reply.status(200).send({
        success: true,
        txHash: committedTxn.hash,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`,
        amount,
        destinationAddress,
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      return reply.status(500).send({
        error: error.message || "Failed to process withdrawal",
      });
    }
  });

  // Get treasury balance
  fastify.get("/treasury/balance", async (request, reply) => {
    try {
      const treasuryPrivateKey = process.env.APTOS_TREASURY_PRIVATE_KEY;
      if (!treasuryPrivateKey) {
        return reply.status(500).send({
          error: "Treasury wallet not configured",
        });
      }

      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);

      const privateKey = new Ed25519PrivateKey(treasuryPrivateKey);
      const treasuryAccount = Account.fromPrivateKey({ privateKey });

      const balance = await aptos.getAccountAPTAmount({
        accountAddress: treasuryAccount.accountAddress,
      });

      const balanceInAPT = balance / 100_000_000;

      return reply.status(200).send({
        address: treasuryAccount.accountAddress.toString(),
        balance: balanceInAPT,
        balanceInOctas: balance,
      });
    } catch (error) {
      console.error("Error fetching treasury balance:", error);
      return reply.status(500).send({
        error: "Failed to fetch treasury balance",
      });
    }
  });
}
