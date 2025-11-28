import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { prismaClient } from "../../db/prisma.js";

// Aptos Contract Configuration
export const APTOS_CONTRACT = {
  testnet: {
    address: process.env.APTOS_MODULE_ADDRESS || "0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c",
    explorerUrl: "https://explorer.aptoslabs.com",
    network: {
      id: 2, // Aptos Testnet
      name: "Aptos Testnet",
      nativeToken: "APT",
      rpcUrl: "https://fullnode.testnet.aptoslabs.com",
    }
  },
  mainnet: {
    address: process.env.APTOS_MODULE_ADDRESS_MAINNET || "",
    explorerUrl: "https://explorer.aptoslabs.com",
    network: {
      id: 1, // Aptos Mainnet
      name: "Aptos Mainnet",
      nativeToken: "APT",
      rpcUrl: "https://fullnode.mainnet.aptoslabs.com",
    }
  }
};

// Initialize Aptos client
const getAptosClient = (isTestnet = true) => {
  const config = new AptosConfig({
    network: isTestnet ? Network.TESTNET : Network.MAINNET,
  });
  return new Aptos(config);
};

/**
 * Register meta address for Aptos
 * @param {Object} params
 * @param {string} params.accountAddress - User's Aptos account address
 * @param {string} params.spendPubKey - Spend public key (hex)
 * @param {string} params.viewingPubKey - Viewing public key (hex)
 */
export const aptosRegisterMetaAddress = async ({
  accountAddress,
  spendPubKey,
  viewingPubKey,
  isTestnet = true,
}) => {
  try {
    const aptos = getAptosClient(isTestnet);
    const contract = APTOS_CONTRACT[isTestnet ? "testnet" : "mainnet"];
    
    // Convert hex strings to Uint8Array
    const spendPubKeyBytes = hexToBytes(spendPubKey);
    const viewingPubKeyBytes = hexToBytes(viewingPubKey);

    // Build transaction
    const transaction = await aptos.transaction.build.simple({
      sender: accountAddress,
      data: {
        function: `${contract.address}::payment_manager::register_for_payments`,
        functionArguments: [spendPubKeyBytes, viewingPubKeyBytes],
      },
    });

    return {
      transaction,
      explorerUrl: `${contract.explorerUrl}/txn/${transaction.hash}?network=${isTestnet ? "testnet" : "mainnet"}`,
    };
  } catch (error) {
    console.error("Error registering Aptos meta address:", error);
    throw error;
  }
};

/**
 * Get meta address count for user
 * @param {Object} params
 * @param {string} params.accountAddress - User's Aptos account address
 */
export const aptosGetMetaAddressCount = async ({
  accountAddress,
  isTestnet = true,
}) => {
  try {
    const aptos = getAptosClient(isTestnet);
    const contract = APTOS_CONTRACT[isTestnet ? "testnet" : "mainnet"];

    const resource = await aptos.getAccountResource({
      accountAddress,
      resourceType: `${contract.address}::stealth_address::PaymentRegistry`,
    });

    if (!resource) {
      return 0;
    }

    return resource.meta_addresses?.length || 0;
  } catch (error) {
    // Resource doesn't exist yet
    if (error.message?.includes("Resource not found")) {
      return 0;
    }
    console.error("Error getting Aptos meta address count:", error);
    throw error;
  }
};

/**
 * Get meta address at index
 * @param {Object} params
 * @param {string} params.accountAddress - User's Aptos account address
 * @param {number} params.index - Meta address index
 */
export const aptosGetMetaAddress = async ({
  accountAddress,
  index,
  isTestnet = true,
}) => {
  try {
    const aptos = getAptosClient(isTestnet);
    const contract = APTOS_CONTRACT[isTestnet ? "testnet" : "mainnet"];

    const resource = await aptos.getAccountResource({
      accountAddress,
      resourceType: `${contract.address}::stealth_address::PaymentRegistry`,
    });

    if (!resource || !resource.meta_addresses || index >= resource.meta_addresses.length) {
      throw new Error("Meta address not found");
    }

    const metaAddress = resource.meta_addresses[index];
    return {
      spendPubKey: bytesToHex(metaAddress.spend_pub_key),
      viewingPubKey: bytesToHex(metaAddress.viewing_pub_key),
    };
  } catch (error) {
    console.error("Error getting Aptos meta address:", error);
    throw error;
  }
};

/**
 * Helper: Convert hex string to Uint8Array
 */
const hexToBytes = (hex) => {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return Array.from(bytes);
};

/**
 * Helper: Convert Uint8Array to hex string
 */
const bytesToHex = (bytes) => {
  if (typeof bytes === "string") {
    return bytes;
  }
  return "0x" + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Initialize payment registry for user
 * @param {Object} params
 * @param {string} params.accountAddress - User's Aptos account address
 */
export const aptosInitializePaymentRegistry = async ({
  accountAddress,
  isTestnet = true,
}) => {
  try {
    const aptos = getAptosClient(isTestnet);
    const contract = APTOS_CONTRACT[isTestnet ? "testnet" : "mainnet"];

    const transaction = await aptos.transaction.build.simple({
      sender: accountAddress,
      data: {
        function: `${contract.address}::payment_manager::initialize`,
        functionArguments: [],
      },
    });

    return {
      transaction,
      explorerUrl: `${contract.explorerUrl}/txn/${transaction.hash}?network=${isTestnet ? "testnet" : "mainnet"}`,
    };
  } catch (error) {
    console.error("Error initializing Aptos payment registry:", error);
    throw error;
  }
};




