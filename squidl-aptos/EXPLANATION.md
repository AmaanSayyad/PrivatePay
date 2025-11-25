# 🦑 SQUIDL Aptos - Explanation

## 📋 About the Project

This project contains smart contracts that enable **completely private payments** on the Aptos blockchain. As your client requested, payment source and destination cannot be identified on-chain.

## 🎯 Problem

In normal blockchain payments:
- Sender address is visible to everyone
- Recipient address is visible to everyone
- Payment amount is visible to everyone
- All transactions are visible on blockchain explorers

This creates problems in situations requiring privacy.

## ✅ Solution: Stealth Addresses

With the stealth address system:
- ✅ A **unique stealth address** is created for each payment
- ✅ **No link** can be established between sender and recipient
- ✅ Only the recipient can detect payments using their viewing key
- ✅ Only the stealth address appears on blockchain explorers, not the real recipient

## 🔑 How It Works?

### 1. Meta Address System

Each user has a **meta address**:
- **Spend Public Key**: Used to withdraw funds
- **Viewing Public Key**: Used to detect payments

### 2. Stealth Address Creation

When a payment is sent:

1. **Sender** uses the recipient's viewing public key
2. Creates an **ephemeral (temporary) key**
3. Computes shared secret using **ECDH**
4. Derives **stealth address** from this secret
5. Sends payment to this stealth address

### 3. Payment Detection

The recipient, using their viewing private key:

1. Scans all ephemeral public keys on the blockchain
2. Computes shared secret for each
3. Performs fast filtering with **view hint** (256x faster)
4. Computes stealth address
5. If this address has balance, detects the payment

### 4. Withdrawing Funds

The recipient, using their spend private key:

1. Derives the stealth address's private key
2. Withdraws funds using this key
3. Transfers to main wallet

## 📦 Project Structure

### Move Modules

1. **stealth_address.move**
   - Meta address registration system
   - Stealth address validation
   - View hint calculation

2. **stealth_payment.move**
   - Token transfer functions
   - Payment tracking
   - Withdrawal operations

3. **payment_manager.move**
   - High-level API
   - User-friendly functions
   - Payment management

### Off-chain Helper

**offchain_helper.py** script:
- Stealth address calculation
- ECDH cryptography
- View hint calculation

## 🚀 Usage Scenario

### Scenario: Private Payment from A to B

1. **B registers their meta address:**
```move
payment_manager::register_for_payments(
    b_account,
    b_spend_pub_key,
    b_viewing_pub_key,
);
```

2. **A wants to send payment to B:**
   - Computes stealth address off-chain
   - Sends payment to stealth address
   - Only stealth address appears on blockchain

3. **B detects the payment:**
   - Scans blockchain with viewing key
   - Finds stealth address
   - Sees balance

4. **B withdraws funds:**
   - Withdraws from stealth address using spend key
   - Transfers to main wallet

## 🔒 Security

### Strengths

- ✅ Stealth addresses are deterministic (same input = same address)
- ✅ Fast filtering with view hint
- ✅ ECDH cryptography is secure
- ✅ Private keys are not stored on-chain

### Considerations

- ⚠️ Stealth address calculations must be done off-chain
- ⚠️ Proper ECDH library should be used in production
- ⚠️ Private keys must be stored securely
- ⚠️ Account registration must be done in advance

## 📝 Important Notes

1. **Address Computation**: Direct address derivation is not possible in Move. Stealth addresses must be computed off-chain.

2. **Account Registration**: In Aptos, an address must register its coin store before it can receive coins. This creates a challenge for stealth addresses.

3. **ECDH Implementation**: Proper secp256k1 ECDH cryptography should be used in production. Current code is a simplified example.

## 🛠️ Development

### Testing

```bash
aptos move test --named-addresses squidl_aptos=0xYOUR_ADDRESS
```

### Deployment

```bash
aptos move publish \
    --named-addresses squidl_aptos=0xYOUR_ADDRESS \
    --profile testnet
```

### Using Off-chain Helper

```python
python scripts/offchain_helper.py
```

## 🎓 Learning Resources

- [Aptos Move Documentation](https://aptos.dev/move/move-on-aptos/)
- [Stealth Addresses (ERC-5564)](https://eips.ethereum.org/EIPS/eip-5564)
- [ECDH Cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman)

## 💡 Future Improvements

- [ ] Proper secp256k1 ECDH implementation
- [ ] Account creation automation
- [ ] Batch payment support
- [ ] Mobile SDK
- [ ] Web wallet integration

## ❓ Frequently Asked Questions

**Q: Are stealth addresses really private?**
A: Yes, no on-chain link can be established between sender and recipient. Only the person with the viewing key can detect payments.

**Q: Is a new address created for each payment?**
A: Yes, a unique stealth address is created for each payment.

**Q: Is it difficult to withdraw from stealth addresses?**
A: No, funds can be withdrawn automatically using the spend private key.

**Q: Is this system gas expensive?**
A: No, scanning is very fast thanks to view hint. Gas costs are the same as normal transfers.

## 📞 Contact

You can open an issue for questions or refer to the documentation.

---

**Note**: This project was developed for hackathon purposes. Security audit is required for production use.



