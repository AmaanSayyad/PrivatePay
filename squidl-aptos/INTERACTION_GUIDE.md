# 🚀 SQUIDL Aptos - Interaction Guide

## ✅ Completed Steps

### 1. Off-chain Helper Tested ✅
```bash
pip install coincurve
python scripts/offchain_helper.py
```

**Result**: Successfully generating stealth addresses with proper ECDH cryptography!

### 2. Contract Functions Called ✅
```bash
aptos move run \
  --function-id 0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c::payment_manager::initialize \
  --profile testnet
```

**Transaction**: https://explorer.aptoslabs.com/txn/0x86675d9278e7a49433d1996a91a456a029025e1589dbabbc1109045b1495cda9?network=testnet

### 3. Explorer Links

**Module Address**: https://explorer.aptoslabs.com/account/0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c?network=testnet

**Deployment Transaction**: https://explorer.aptoslabs.com/txn/0x254f01be38a6d7802a7a9bff80ee9db05195b89d8fa63e27eddcbbe8ae20f69c?network=testnet

## 📝 How to Use

### Step 1: Generate Stealth Address

```bash
python scripts/offchain_helper.py
```

This will output:
- Stealth Address
- View Hint
- Ephemeral Public Key

### Step 2: Register Meta Address

```bash
aptos move run \
  --function-id 0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c::payment_manager::register_for_payments \
  --args vector:0x[SPEND_PUB_KEY] vector:0x[VIEWING_PUB_KEY] \
  --profile testnet
```

### Step 3: Send Stealth Payment

```bash
aptos move run \
  --function-id 0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c::payment_manager::send_private_payment \
  --type-args 0x1::aptos_coin::AptosCoin \
  --args \
    address:0x[RECIPIENT_ADDRESS] \
    u64:0 \
    u64:1000000 \
    u32:0 \
    vector:0x[EPHEMERAL_PUB_KEY] \
    address:0x[STEALTH_ADDRESS] \
  --profile testnet
```

## 🔍 Available Functions

### payment_manager Module

1. **initialize(account: &signer)**
   - Initialize payment registry

2. **register_for_payments(account: &signer, spend_pub_key, viewing_pub_key)**
   - Register meta address for receiving payments

3. **send_private_payment<CoinType>(...)**
   - Send payment to stealth address

4. **withdraw_from_stealth<CoinType>(...)**
   - Withdraw funds from stealth address

### stealth_address Module

1. **get_meta_address_count(owner: address): u64**
   - Get number of registered meta addresses

2. **get_meta_address(owner: address, index: u64)**
   - Get meta address at index

## 📊 Example Workflow

### Complete Payment Flow

1. **Recipient**: Register meta address
   ```bash
   # Generate keys
   python scripts/offchain_helper.py
   
   # Register
   aptos move run --function-id ...::register_for_payments ...
   ```

2. **Sender**: Generate stealth address and send payment
   ```bash
   # Generate stealth address (using recipient's viewing pub key)
   python scripts/offchain_helper.py
   
   # Send payment
   aptos move run --function-id ...::send_private_payment ...
   ```

3. **Recipient**: Detect and withdraw payment
   ```bash
   # Scan for payments (off-chain)
   # Withdraw when detected
   aptos move run --function-id ...::withdraw_from_stealth ...
   ```

## 🔗 Useful Links

- **Explorer**: https://explorer.aptoslabs.com/?network=testnet
- **Module**: https://explorer.aptoslabs.com/account/0x86c46b435a128d6344d42e832ef22066133d39a8a1f8e42b02107b8b246e280c?network=testnet
- **Aptos Docs**: https://aptos.dev/

## ⚠️ Important Notes

1. **Account Registration**: Stealth addresses must register their coin store before receiving payments
2. **Off-chain Computation**: Stealth addresses must be computed off-chain
3. **Private Keys**: Never share or commit private keys
4. **Testnet Only**: Current deployment is on testnet

