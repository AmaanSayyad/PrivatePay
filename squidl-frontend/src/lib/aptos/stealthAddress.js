/**
 * Stealth Address Generation for Aptos
 * JavaScript implementation of the off-chain helper
 */

import { getPublicKey as secp256k1GetPublicKey, utils, Point } from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha2.js";
import { sha3_256 } from "@noble/hashes/sha3.js";
import { bytesToHex } from "@noble/hashes/utils.js";

/**
 * Generate a random private key (32 bytes)
 */
export const generatePrivateKey = () => {
  return utils.randomPrivateKey();
};

/**
 * Get public key from private key (compressed, 33 bytes)
 */
export const getPublicKey = (privateKey) => {
  const pubKey = secp256k1GetPublicKey(privateKey, true); // compressed
  return pubKey;
};

/**
 * Convert public key to hex string
 */
export const publicKeyToHex = (publicKey) => {
  return bytesToHex(publicKey);
};

/**
 * Convert hex string to bytes
 */
const hexToBytes = (hex) => {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
};

// Export for use in components
export { hexToBytes };

/**
 * ECDH: Compute shared secret between private key and public key
 */
export const computeSharedSecret = (privateKey, publicKey) => {
  const point = Point.fromHex(publicKey);
  const sharedPoint = point.multiply(privateKey);
  const sharedSecret = sharedPoint.toRawBytes(true); // compressed
  return sharedSecret;
};

/**
 * Derive stealth address from meta address and ephemeral key
 * @param {string} spendPubKeyHex - Spend public key (hex, 33 bytes compressed)
 * @param {string} viewingPubKeyHex - Viewing public key (hex, 33 bytes compressed)
 * @param {Uint8Array} ephemeralPrivKey - Ephemeral private key (32 bytes)
 * @param {number} k - Index (default 0)
 * @returns {Object} - { stealthAddress, ephemeralPubKey, viewHint, k }
 */
export const generateStealthAddress = (
  spendPubKeyHex,
  viewingPubKeyHex,
  ephemeralPrivKey,
  k = 0
) => {
  try {
    // Convert hex strings to bytes
    const spendPubKey = hexToBytes(spendPubKeyHex);
    const viewingPubKey = hexToBytes(viewingPubKeyHex);

    // Get ephemeral public key
    const ephemeralPubKey = getPublicKey(ephemeralPrivKey);
    const ephemeralPubKeyHex = bytesToHex(ephemeralPubKey);

    // Compute shared secret using ECDH (ephemeral_priv_key * viewing_pub_key)
    const sharedSecret = computeSharedSecret(ephemeralPrivKey, viewingPubKey);

    // Hash shared secret with k: tweak = hash(shared_secret || k)
    const kBytes = new Uint8Array(4);
    const kView = new DataView(kBytes.buffer);
    kView.setUint32(0, k, false); // big-endian
    
    const tweakInput = new Uint8Array(sharedSecret.length + 4);
    tweakInput.set(sharedSecret, 0);
    tweakInput.set(kBytes, sharedSecret.length);
    const tweak = sha256(tweakInput);

    // Compute stealth public key: stealth_pub = spend_pub + tweak * G
    // tweak * G: multiply generator point by tweak
    const tweakPoint = Point.BASE.multiply(tweak);
    const tweakPubKey = tweakPoint.toRawBytes(true); // compressed
    
    // Point addition: spend_pub + tweak_pub
    const spendPoint = Point.fromHex(spendPubKey);
    const tweakPubPoint = Point.fromHex(tweakPubKey);
    const stealthPubPoint = spendPoint.add(tweakPubPoint);
    const stealthPubKey = stealthPubPoint.toRawBytes(true); // compressed

    // Derive Aptos address from stealth public key using SHA3-256
    const addressHash = sha3_256(stealthPubKey);
    
    // Take first 16 bytes for Aptos address
    const addressBytes = addressHash.slice(0, 16);
    const stealthAddress = "0x" + bytesToHex(addressBytes);

    // View hint: first byte of shared secret
    const viewHint = bytesToHex(new Uint8Array([sharedSecret[0]]));

    return {
      stealthAddress,
      ephemeralPubKey: ephemeralPubKeyHex,
      viewHint,
      k,
    };
  } catch (error) {
    console.error("Error generating stealth address:", error);
    throw error;
  }
};

/**
 * Generate ephemeral key pair
 */
export const generateEphemeralKeyPair = () => {
  const privateKey = generatePrivateKey();
  const publicKey = getPublicKey(privateKey);
  return {
    privateKey: bytesToHex(privateKey),
    publicKey: bytesToHex(publicKey),
  };
};

/**
 * Validate public key format (33 bytes compressed)
 */
export const validatePublicKey = (pubKeyHex) => {
  try {
    const bytes = hexToBytes(pubKeyHex);
    if (bytes.length !== 33) {
      return { valid: false, error: "Public key must be 33 bytes (compressed)" };
    }
    if (bytes[0] !== 0x02 && bytes[0] !== 0x03) {
      return { valid: false, error: "Invalid compression flag" };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

