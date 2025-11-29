# 💼 Wallet Usage Explanation

## 🔑 Two Separate Wallets

Your PrivatePay app uses **TWO different wallets** for different purposes:

---

## 1️⃣ **Petra Wallet (Aptos)** - For Transactions

**What it's for:**
- ✅ **All blockchain transactions** (sending/receiving APT)
- ✅ **Stealth payments**
- ✅ **Withdrawals**
- ✅ **Payment links**
- ✅ **Signing transactions on Aptos blockchain**

**How it works:**
- You connect via **Petra wallet browser extension**
- This is your **main wallet** for all Aptos transactions
- Address format: `0x...` (Aptos address)

**Example:**
```javascript
// All transactions use your Petra wallet
const { account } = useAptos(); // This is your Petra wallet address
await sendAptTransfer({
  accountAddress: account, // Uses Petra wallet
  recipientAddress: "...",
  amount: 10
});
```

---

## 2️⃣ **Photon Wallet** - For Rewards Only

**What it's for:**
- ✅ **Receiving PAT token rewards**
- ✅ **Tracking your reward balance**
- ✅ **Event tracking and analytics**
- ❌ **NOT for blockchain transactions**

**How it works:**
- Created automatically when you connect to Photon
- This is an **embedded wallet** managed by Photon
- Used **only** for PAT token rewards
- Address format: `0x...` (separate from your Petra wallet)

**Example:**
```javascript
// Photon wallet is separate
const { walletAddress } = usePhoton(); // This is your Photon wallet address
// This address is ONLY for receiving PAT rewards
```

---

## 📊 How They Work Together

```
┌─────────────────────────────────────────┐
│         Your Transaction Flow           │
├─────────────────────────────────────────┤
│                                         │
│  1. Connect Petra Wallet (Aptos)       │
│     ↓                                   │
│  2. Make Transaction (uses Petra)       │
│     ↓                                   │
│  3. Photon Tracks Event                 │
│     ↓                                   │
│  4. PAT Rewards → Photon Wallet         │
│                                         │
└─────────────────────────────────────────┘
```

### Example Flow:

1. **You send 10 APT** using your **Petra wallet**
2. Transaction is signed by **Petra wallet**
3. Photon tracks the event: `trackRewardedEvent("transfer_completed")`
4. Photon awards **5 PAT tokens** to your **Photon wallet**
5. Your **Petra wallet** still has your APT
6. Your **Photon wallet** now has 5 PAT

---

## ❓ Common Questions

### Q: Do I need to use Photon wallet for transactions?
**A: NO!** All transactions use your **Petra wallet**. Photon wallet is only for PAT rewards.

### Q: Can I send APT from Photon wallet?
**A: NO!** Photon wallet is managed by Photon and is only for PAT tokens. You cannot use it for Aptos transactions.

### Q: Where do my APT tokens go?
**A: Your APT stays in your Petra wallet** (the one you connected). Photon wallet only receives PAT rewards.

### Q: Can I transfer PAT from Photon wallet?
**A: PAT tokens are in your Photon embedded wallet.** You may be able to transfer them depending on Photon's features, but this is separate from your Aptos transactions.

---

## 🎯 Summary

| Wallet | Purpose | Used For |
|--------|---------|----------|
| **Petra (Aptos)** | Main transactions | Sending/receiving APT, stealth payments, withdrawals |
| **Photon** | Rewards only | Receiving PAT tokens, tracking rewards balance |

**Bottom Line:**
- ✅ **Use your Petra wallet** for all Aptos transactions
- ✅ **Photon wallet** automatically receives PAT rewards
- ✅ **Both wallets work together** - you don't need to choose

---

## 💡 Technical Details

### Transaction Flow:
```javascript
// 1. Transaction uses Petra wallet
const { account } = useAptos(); // Petra wallet address
await sendAptTransfer({
  accountAddress: account, // ← Petra wallet
  ...
});

// 2. After transaction, track event
await trackRewardedEvent("transfer_completed", {
  amount: 10,
  token: "APT"
});

// 3. Photon awards PAT to Photon wallet
// PAT goes to: photonUser.walletAddress (Photon wallet)
// APT stays in: account (Petra wallet)
```

### Balance Display:
- **Aptos Balance**: Shows APT in your Petra wallet
- **Photon Balance**: Shows PAT in your Photon wallet
- **They are separate!**

---

**You only need to connect your Petra wallet - Photon connects automatically!** 🚀

