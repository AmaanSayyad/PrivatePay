/**
 * Aptos Stealth Address Helpers
 * Functions to interact with Aptos stealth payment contracts
 */

import {
  aptosRegisterMetaAddress,
  aptosGetMetaAddressCount,
  aptosGetMetaAddress,
  aptosInitializePaymentRegistry,
  APTOS_CONTRACT,
} from "../../../lib/contracts/aptos/aptosContract.js";
import { prismaClient } from "../../../lib/db/prisma.js";

/**
 * Register Aptos meta address for user
 */
export const registerAptosMetaAddress = async ({
  userId,
  accountAddress,
  spendPubKey,
  viewingPubKey,
  isTestnet = true,
}) => {
  try {
    // Check if user exists
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Initialize payment registry if needed
    try {
      await aptosInitializePaymentRegistry({ accountAddress, isTestnet });
    } catch (error) {
      // Already initialized, continue
      if (!error.message?.includes("already exists")) {
        console.warn("Payment registry initialization warning:", error.message);
      }
    }

    // Register meta address on-chain
    const { transaction } = await aptosRegisterMetaAddress({
      accountAddress,
      spendPubKey,
      viewingPubKey,
      isTestnet,
    });

    // Update user in database
    await prismaClient.user.update({
      where: { id: userId },
      data: {
        metaAddress: `${spendPubKey}:${viewingPubKey}`,
        spendPublicKey: spendPubKey,
        viewingPublicKey: viewingPubKey,
      },
    });

    return {
      success: true,
      transactionHash: transaction.hash,
      explorerUrl: `${APTOS_CONTRACT[isTestnet ? "testnet" : "mainnet"].explorerUrl}/txn/${transaction.hash}?network=${isTestnet ? "testnet" : "mainnet"}`,
    };
  } catch (error) {
    console.error("Error registering Aptos meta address:", error);
    throw error;
  }
};

/**
 * Get Aptos meta address count for user
 */
export const getAptosMetaAddressCount = async ({
  accountAddress,
  isTestnet = true,
}) => {
  try {
    return await aptosGetMetaAddressCount({ accountAddress, isTestnet });
  } catch (error) {
    console.error("Error getting Aptos meta address count:", error);
    return 0;
  }
};

/**
 * Get Aptos meta address at index
 */
export const getAptosMetaAddress = async ({
  accountAddress,
  index,
  isTestnet = true,
}) => {
  try {
    return await aptosGetMetaAddress({ accountAddress, index, isTestnet });
  } catch (error) {
    console.error("Error getting Aptos meta address:", error);
    throw error;
  }
};

/**
 * Generate stealth address for Aptos (off-chain computation)
 * This should be done client-side, but we provide a helper endpoint
 */
export const generateAptosStealthAddress = async ({
  spendPubKey,
  viewingPubKey,
  ephemeralPrivKey,
  k = 0,
}) => {
  // This is a placeholder - actual computation should be done client-side
  // using the offchain_helper.py script
  // We return the parameters needed for client-side computation
  return {
    spendPubKey,
    viewingPubKey,
    ephemeralPrivKey,
    k,
    note: "Stealth address must be computed client-side using offchain_helper.py",
  };
};

