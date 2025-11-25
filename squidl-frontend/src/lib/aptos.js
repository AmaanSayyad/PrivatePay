/**
 * Aptos Integration Library
 * Handles Aptos wallet connections and transactions
 */

import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

// Aptos Module Address
export const APTOS_MODULE_ADDRESS = import.meta.env.VITE_APTOS_MODULE_ADDRESS || 
  "0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c";

// Initialize Aptos client
export const getAptosClient = (isTestnet = true) => {
  const config = new AptosConfig({
    network: isTestnet ? Network.TESTNET : Network.MAINNET,
  });
  return new Aptos(config);
};

/**
 * Connect to Aptos wallet (Petra, Martian, etc.)
 * Returns account address
 */
export const connectAptosWallet = async () => {
  try {
    if (typeof window === "undefined" || !window.aptos) {
      throw new Error("Aptos wallet not found. Please install Petra wallet.");
    }

    const response = await window.aptos.connect();
    return response.address;
  } catch (error) {
    console.error("Error connecting Aptos wallet:", error);
    throw error;
  }
};

/**
 * Disconnect Aptos wallet
 */
export const disconnectAptosWallet = async () => {
  try {
    if (typeof window !== "undefined" && window.aptos) {
      await window.aptos.disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting Aptos wallet:", error);
  }
};

/**
 * Get Aptos account address
 */
export const getAptosAccountAddress = async () => {
  try {
    if (typeof window === "undefined" || !window.aptos) {
      return null;
    }

    const account = await window.aptos.account();
    return account.address;
  } catch (error) {
    console.error("Error getting Aptos account:", error);
    return null;
  }
};

/**
 * Sign and submit transaction
 */
export const signAndSubmitTransaction = async ({
  accountAddress,
  functionName,
  functionArguments,
  isTestnet = true,
}) => {
  try {
    if (typeof window === "undefined" || !window.aptos) {
      throw new Error("Aptos wallet not found");
    }

    // Handle type arguments for coin types
    const typeArgs = functionName.includes("send_private_payment") 
      ? ["0x1::aptos_coin::AptosCoin"]
      : [];

    const transaction = {
      type: "entry_function_payload",
      function: `${APTOS_MODULE_ADDRESS}::${functionName}`,
      arguments: functionArguments,
      type_arguments: typeArgs,
    };

    const response = await window.aptos.signAndSubmitTransaction(transaction);
    
    // Wait for transaction
    const aptos = getAptosClient(isTestnet);
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    return {
      hash: response.hash,
      success: executedTxn.success,
      explorerUrl: `https://explorer.aptoslabs.com/txn/${response.hash}?network=${isTestnet ? "testnet" : "mainnet"}`,
    };
  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  }
};

/**
 * Register meta address on Aptos
 */
export const registerAptosMetaAddress = async ({
  accountAddress,
  spendPubKey,
  viewingPubKey,
  isTestnet = true,
}) => {
  // Convert hex strings to Uint8Array
  const spendPubKeyBytes = hexToBytes(spendPubKey);
  const viewingPubKeyBytes = hexToBytes(viewingPubKey);

  return await signAndSubmitTransaction({
    accountAddress,
    functionName: "payment_manager::register_for_payments",
    functionArguments: [spendPubKeyBytes, viewingPubKeyBytes],
    isTestnet,
  });
};

/**
 * Send stealth payment on Aptos
 */
export const sendAptosStealthPayment = async ({
  accountAddress,
  recipientAddress,
  recipientMetaIndex,
  amount,
  k,
  ephemeralPubKey,
  stealthAddress,
  isTestnet = true,
}) => {
  const ephemeralPubKeyBytes = hexToBytes(ephemeralPubKey);
  const stealthAddressBytes = hexToBytes(stealthAddress.replace("0x", ""));

  return await signAndSubmitTransaction({
    accountAddress,
    functionName: "payment_manager::send_private_payment",
    functionArguments: [
      recipientAddress,
      recipientMetaIndex,
      amount,
      k,
      ephemeralPubKeyBytes,
      stealthAddressBytes,
    ],
    typeArguments: ["0x1::aptos_coin::AptosCoin"],
    isTestnet,
  });
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
 * Get account balance
 */
export const getAptosBalance = async (accountAddress, isTestnet = true) => {
  try {
    const aptos = getAptosClient(isTestnet);
    const balance = await aptos.getAccountAPTAmount({ accountAddress });
    return balance;
  } catch (error) {
    console.error("Error getting Aptos balance:", error);
    return 0;
  }
};

