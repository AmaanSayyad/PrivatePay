import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function treasuryRoutes(fastify, options) {
  // Register user with username
  fastify.post("/register", async (request, reply) => {
    try {
      const { wallet_address, username } = request.body;

      if (!wallet_address || !username) {
        return reply.status(400).send({
          error: "wallet_address and username are required",
        });
      }

      // Check if username already exists
      const existingUser = await prisma.treasury_users.findUnique({
        where: { username },
      });

      if (existingUser) {
        return reply.status(409).send({
          error: "Username already taken",
        });
      }

      // Create user
      const user = await prisma.treasury_users.create({
        data: {
          wallet_address,
          username,
        },
      });

      // Create initial balance record
      await prisma.treasury_balances.create({
        data: {
          username,
          wallet_address,
          available_balance: 0,
        },
      });

      return reply.status(201).send({
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return reply.status(500).send({
        error: "Failed to register user",
      });
    }
  });

  // Record incoming payment to treasury
  fastify.post("/payment", async (request, reply) => {
    try {
      const { sender_address, recipient_username, amount, tx_hash } = request.body;

      if (!sender_address || !recipient_username || !amount || !tx_hash) {
        return reply.status(400).send({
          error: "All fields are required",
        });
      }

      // Check if recipient exists
      const recipient = await prisma.treasury_users.findUnique({
        where: { username: recipient_username },
      });

      if (!recipient) {
        return reply.status(404).send({
          error: "Recipient username not found",
        });
      }

      // Record payment
      const payment = await prisma.treasury_payments.create({
        data: {
          sender_address,
          recipient_username,
          amount: parseFloat(amount),
          tx_hash,
          status: "received",
        },
      });

      // Update balance
      await prisma.treasury_balances.update({
        where: { username: recipient_username },
        data: {
          available_balance: {
            increment: parseFloat(amount),
          },
        },
      });

      return reply.status(201).send({
        message: "Payment recorded successfully",
        data: payment,
      });
    } catch (error) {
      console.error("Error recording payment:", error);
      return reply.status(500).send({
        error: "Failed to record payment",
      });
    }
  });

  // Get user balance
  fastify.get("/balance/:username", async (request, reply) => {
    try {
      const { username } = request.params;

      const balance = await prisma.treasury_balances.findUnique({
        where: { username },
      });

      if (!balance) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      return reply.status(200).send({
        data: balance,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      return reply.status(500).send({
        error: "Failed to fetch balance",
      });
    }
  });

  // Get user payments
  fastify.get("/payments/:username", async (request, reply) => {
    try {
      const { username } = request.params;

      const payments = await prisma.treasury_payments.findMany({
        where: { recipient_username: username },
        orderBy: { created_at: "desc" },
      });

      return reply.status(200).send({
        data: payments,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      return reply.status(500).send({
        error: "Failed to fetch payments",
      });
    }
  });

  // Record withdrawal
  fastify.post("/withdraw", async (request, reply) => {
    try {
      const { username, destination_address, amount, tx_hash } = request.body;

      if (!username || !destination_address || !amount || !tx_hash) {
        return reply.status(400).send({
          error: "All fields are required",
        });
      }

      // Check balance
      const balance = await prisma.treasury_balances.findUnique({
        where: { username },
      });

      if (!balance || balance.available_balance < parseFloat(amount)) {
        return reply.status(400).send({
          error: "Insufficient balance",
        });
      }

      // Record withdrawal as payment
      const withdrawal = await prisma.treasury_payments.create({
        data: {
          sender_address: "treasury",
          recipient_username: username,
          amount: -parseFloat(amount),
          tx_hash,
          status: "withdrawn",
        },
      });

      // Update balance
      await prisma.treasury_balances.update({
        where: { username },
        data: {
          available_balance: {
            decrement: parseFloat(amount),
          },
        },
      });

      return reply.status(201).send({
        message: "Withdrawal recorded successfully",
        data: withdrawal,
      });
    } catch (error) {
      console.error("Error recording withdrawal:", error);
      return reply.status(500).send({
        error: "Failed to record withdrawal",
      });
    }
  });
}
