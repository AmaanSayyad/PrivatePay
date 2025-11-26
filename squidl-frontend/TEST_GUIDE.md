# 🧪 PrivatePay Aptos Test Guide

This guide contains all the steps and inputs needed to test the Aptos stealth payment system.

## 📋 Prerequisites

### 1. Aptos Wallet Setup
- Install **Petra Wallet**: https://petra.app/
- Switch to Testnet (network selection in Petra wallet)
- Get Testnet APT: https://faucet.aptoslabs.com/

### 2. Prepare Two Different Wallets (Recommended)
- **Wallet 1 (Recipient)**: Will register meta address and receive payments
- **Wallet 2 (Sender)**: Will send stealth payments

**Note**: You can also test with a single wallet (sending payment to yourself)

---

## 🔑 Public Key Generation

You need **spend** and **viewing** public keys to register a meta address.

### ✅ Automatic Key Generation in Frontend (Recommended)

You can now generate keys automatically in the frontend:

1. Connect your wallet in the **"Receive" tab**
2. Click the **"Generate Keys"** button
3. A modal will open showing you:
   - **Spend Private Key** (save securely!)
   - **Spend Public Key** (automatically filled in the input)
   - **Viewing Private Key** (save securely!)
   - **Viewing Public Key** (automatically filled in the input)
4. **Make sure to save the private keys!** (Required to receive stealth payments)
5. Public keys are automatically filled in the inputs
6. Close the modal and proceed with "Register Meta Address"

**IMPORTANT**: Store private keys in a secure location! If you lose them, you won't be able to access funds sent to your stealth addresses.

### Alternative: Using Python Script

You can also generate keys using a Python script:

```bash
cd squidl-aptos
pip install coincurve  # or secp256k1
python scripts/offchain_helper.py
```

---

## 📝 Test Scenario 1: Meta Address Registration (Receive)

### Steps:

1. **Open the frontend**: `http://localhost:5173` (or deployed URL)

2. **Go to the "Receive" tab** (open by default)

3. **Click "Connect Aptos Wallet"**
   - Petra wallet popup will open
   - Connect and approve the wallet
   - Connected wallet address will be displayed

4. **Generate keys**:
   - Click the **"Generate Keys"** button
   - View the private keys in the modal and **make sure to save them**
   - Public keys are automatically filled in the inputs
   - Close the modal

   **OR** enter keys manually:
   - Enter your key in the **Spend Public Key** input (must start with 0x, 66 characters)
   - Enter your key in the **Viewing Public Key** input (must start with 0x, 66 characters)

5. **Click "Register Meta Address"**
   - Petra wallet popup will open for transaction confirmation
   - Transaction fee will be paid (testnet APT)
   - If successful, a green message will appear
   - Explorer link will appear in the toast message

### Expected Result:
- ✅ "Meta address registered successfully!" message
- ✅ Transaction hash and explorer link
- ✅ Meta address registered on blockchain

---

## 📝 Test Scenario 2: Sending Stealth Payment (Send)

### Prerequisites:
- Recipient's meta address must be registered
- You must know the recipient's **spend** and **viewing** public keys

### Steps:

1. **Go to the "Send" tab**

2. **If wallet is not connected**, click "Connect Aptos Wallet"

3. **Enter the recipient's Aptos address** in the Recipient Address input:
   ```
   Format: 0x + 64 characters
   Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   ```

4. **Enter the amount you want to send** in the Amount (APT) input:
   ```
   Example: 0.01 (1 APT = 100,000,000 octas)
   ```

5. **Click "Generate Stealth Address"**

6. **Enter the recipient's spend public key** in the Recipient Spend Public Key input:
   ```
   Format: 0x + 66 characters
   Example: 0x02a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
   ```

7. **Enter the recipient's viewing public key** in the Recipient Viewing Public Key input:
   ```
   Format: 0x + 66 characters
   Example: 0x03f1e2d3c4b5a6978098765432109876543210987654321098765432109876543210
   ```

8. **Click "Generate"**
   - Stealth address will be automatically generated
   - Ephemeral public key will be automatically generated
   - Form fields will be filled

9. **Click "Send Stealth Payment"**
   - Petra wallet popup will open for transaction confirmation
   - Transaction fee + sent amount will be paid
   - If successful, a green message will appear
   - Explorer link will appear in the toast message

### Expected Result:
- ✅ "Payment sent successfully!" message
- ✅ Transaction hash and explorer link
- ✅ Stealth payment registered on blockchain
- ✅ Funds sent to stealth address

---

## 🔄 Complete Test Scenario (With Two Wallets)

### Setup:
- **Wallet A** (Recipient): Will register meta address
- **Wallet B** (Sender): Will send payment

### Step 1: Wallet A - Meta Address Registration

1. Connect with Wallet A
2. In the Receive tab:
   - **Spend Public Key**: `0x02...` (generate using frontend or Python script)
   - **Viewing Public Key**: `0x03...` (generate using frontend or Python script)
3. Click "Register Meta Address"
4. **Note the keys** (you'll use them elsewhere)
5. **Note Wallet A's address**

### Step 2: Wallet B - Sending Stealth Payment

1. Connect with Wallet B (or disconnect Wallet A and connect Wallet B)
2. In the Send tab:
   - **Recipient Address**: Wallet A's address
   - **Amount**: `0.01` APT
   - **Recipient Spend Public Key**: Wallet A's spend public key
   - **Recipient Viewing Public Key**: Wallet A's viewing public key
3. Click "Generate Stealth Address"
4. Click "Send Stealth Payment"

### Step 3: Verification

1. Check the transaction in Explorer
2. Verify that the stealth address was created
3. Verify that funds were sent to the stealth address

---

## 🧪 Single Wallet Test (Self Payment)

### Steps:

1. **Connect with wallet** (Receive tab)
2. **Register meta address** (with spend and viewing keys)
3. **Copy the keys** (spend and viewing public keys)
4. **Go to Send tab**
5. **With the same wallet** (already connected):
   - Recipient Address: Your own wallet address
   - Amount: `0.01` APT
   - Recipient Spend Public Key: The spend key you just registered
   - Recipient Viewing Public Key: The viewing key you just registered
6. **Generate and Send**

---

## 📊 Input Formats and Examples

### Public Key Format
```
- Start: 0x (required)
- Length: 66 characters total (including 0x)
- Format: 0x + 64 hex characters
- First character: 02 or 03 (compressed secp256k1)
- Example: 0x02a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890
```

### Aptos Address Format
```
- Start: 0x (required)
- Length: 66 characters total (including 0x)
- Format: 0x + 64 hex characters
- Example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Amount Format
```
- Format: Decimal number (in APT)
- Examples:
  - 0.01 APT
  - 1 APT
  - 0.001 APT
- System automatically converts to octas (1 APT = 100,000,000 octas)
```

---

## ⚠️ Common Errors and Solutions

### Error: "Aptos wallet not found"
**Solution**: Install Petra wallet extension and refresh the page

### Error: "Invalid spend public key"
**Solution**: 
- Make sure the public key starts with `0x`
- Make sure it's 66 characters long (including 0x)
- Make sure the first character is `02` or `03`

### Error: "Transaction failed"
**Solution**:
- Make sure you have sufficient APT balance (for transaction fee)
- Make sure you're on testnet
- Check your network connection

### Error: "Meta address not found"
**Solution**:
- Make sure the recipient has registered their meta address
- Make sure you're using the correct recipient address
- Check the meta address index (default: 0)

---

## 🔍 Verification Steps

### 1. Checking Meta Address Registration

Open the transaction in Explorer:
```
https://explorer.aptoslabs.com/txn/[TRANSACTION_HASH]?network=testnet
```

You should see that the `register_for_payments` function was called in the transaction.

### 2. Checking Stealth Payment

Open the transaction in Explorer:
```
https://explorer.aptoslabs.com/txn/[TRANSACTION_HASH]?network=testnet
```

In the transaction, you should see:
- The `send_private_payment` function was called
- The stealth address was created
- Funds were transferred

### 3. Checking Stealth Address

Search for the stealth address in Aptos Explorer:
```
https://explorer.aptoslabs.com/account/[STEALTH_ADDRESS]?network=testnet
```

You should see that the stealth address has funds.

---

## 📚 Additional Resources

- **Aptos Explorer**: https://explorer.aptoslabs.com/?network=testnet
- **Petra Wallet**: https://petra.app/
- **Aptos Testnet Faucet**: https://faucet.aptoslabs.com/
- **Aptos Documentation**: https://aptos.dev/

---

## 💡 Tips

1. **Use small amounts for testing**: 0.01 APT is sufficient
2. **Store keys securely**: Never share private keys in real usage
3. **Use Explorer**: Check all transactions in Explorer
4. **Check network**: Always make sure you're on testnet
5. **Don't forget transaction fees**: A small fee is paid for each transaction

---

## ✅ Test Checklist

- [ ] Petra wallet installed and connected to testnet
- [ ] Testnet APT balance available
- [ ] Spend and viewing public keys generated
- [ ] Meta address successfully registered
- [ ] Stealth address successfully generated
- [ ] Stealth payment successfully sent
- [ ] Transactions visible in Explorer
- [ ] Funds in stealth address

---

**For questions**: Click the Help button (question mark icon in the bottom right corner) to access the detailed usage guide.
