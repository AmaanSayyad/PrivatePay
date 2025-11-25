# 🦑 SQUIDL - Complete Project Summary

## 📊 Executive Summary

**SQUIDL** is a privacy-focused payment platform that enables untraceable cryptocurrency transactions using stealth addresses. Built on **Oasis Protocol's Sapphire** network, it provides enterprise-grade privacy for freelancers, businesses, and individuals.

**Hackathon**: Privacy4Web3 by Oasis Protocol  
**Tech Stack**: React, Node.js, Solidity, Rust (ROFL), PostgreSQL, Oasis Sapphire  
**Key Innovation**: Improved ERC-5564 implementation with optimized privacy and lower gas costs

---

## 🏗️ Architecture Overview

The project consists of **4 main components**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        SQUIDL ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │ ───► │   Backend    │ ───► │  PostgreSQL  │  │
│  │  (React/JS)  │      │ (Node.js API)│      │   Database   │  │
│  └──────┬───────┘      └──────┬───────┘      └──────────────┘  │
│         │                     │                                  │
│         │                     │                                  │
│         └─────────┬───────────┘                                  │
│                   │                                              │
│                   ▼                                              │
│         ┌─────────────────────┐                                 │
│         │  StealthSigner.sol  │                                 │
│         │  (Oasis Sapphire)   │                                 │
│         └──────────┬──────────┘                                 │
│                    │                                             │
│                    │ monitors                                    │
│                    │                                             │
│         ┌──────────▼──────────┐                                 │
│         │   ROFL Worker       │                                 │
│         │  (Rust Off-chain)   │                                 │
│         └─────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Component Breakdown

### 1️⃣ squidl-frontend (React Web App)

**Location**: `/squidl-frontend/`  
**Tech Stack**: React 18, Vite, TailwindCSS, Ethers.js v6, Dynamic.xyz  
**Lines of Code**: ~15,000

#### Key Features:
- 🔐 **Wallet Authentication**: Dynamic.xyz integration for seamless wallet connection
- 💼 **Alias Management**: Create custom payment links (e.g., `john.squidl.me`)
- 📊 **Dashboard**: Unified view of all transactions and balances
- 🌉 **Multi-chain Support**: Ethereum, BSC, Oasis Sapphire
- 💰 **Balance Tracking**: Main wallet and private (stealth) balances
- 📜 **Transaction History**: Complete audit trail of payments
- 🎨 **Modern UI**: NextUI components with responsive design

#### Key Files:
- `src/config.js` - Chain configurations and contract addresses
- `src/providers/DynamicProvider.jsx` - Wallet authentication
- `src/api/squidl.js` - Backend API client
- `src/pages/` - Main application pages
- `src/components/` - Reusable UI components

#### Environment Variables:
```bash
VITE_BACKEND_URL
VITE_APP_ENVIRONMENT
VITE_DYNAMIC_ENV_ID
VITE_SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS
VITE_PAYMASTER_PK
VITE_INFURA_API_KEY
VITE_WEBSITE_HOST
```

---

### 2️⃣ squidl-backend (Node.js API Server)

**Location**: `/squidl-backend/`  
**Tech Stack**: Fastify, Prisma ORM, PostgreSQL, Ethers.js v6  
**Lines of Code**: ~8,000

#### Key Features:
- 🔑 **Authentication**: JWT-based auth with Dynamic.xyz verification
- 🏦 **User Management**: Create and manage user accounts
- 🔐 **Stealth Address Generation**: Interface with Sapphire smart contract
- 📡 **API Endpoints**: RESTful API for frontend
- ⚙️ **Background Workers**: Monitor transactions and update prices
- 💾 **Database Management**: Prisma ORM with PostgreSQL
- 🌐 **External APIs**: Moralis, 1inch, Cloudinary integrations

#### API Routes:
- `/auth/login` - User authentication
- `/stealth-address/*` - Stealth address operations
- `/user/*` - User profile management
- `/stealth-signer/*` - Contract interactions

#### Key Files:
- `index.js` - Server entry point
- `app/routes/` - API route handlers
- `app/lib/contracts/oasis/oasisContract.js` - Sapphire contract interface
- `app/workers/` - Background job workers
- `prisma/schema.prisma` - Database schema

#### Database Schema:
- **User** - User accounts
- **UserWallet** - EOA or social wallet addresses
- **UserAlias** - Payment link aliases
- **StealthAddress** - Generated stealth addresses
- **Transaction** - Payment history
- **Token** - Supported tokens
- **Chain** - Blockchain configurations

#### Environment Variables:
```bash
DATABASE_URL
APP_PORT
WORKERS
JWT_SECRET
DYNAMIC_ENV_ID
INFURA_API_KEY
MORALIS_API_KEY
ONE_INCH_DEV_PORTAL_API_KEY
SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS
PAYMASTER_PK
ENS_RESOLVER_PK
RESOLVER_CONTRACT_ADDRESS
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_UPLOAD_PRESET
```

---

### 3️⃣ squidl-hardhat (Smart Contracts)

**Location**: `/squidl-hardhat/`  
**Tech Stack**: Hardhat, Solidity 0.8.27, Oasis Sapphire SDK  
**Lines of Code**: ~600 (contracts)

#### Main Contract: StealthSigner.sol

**Purpose**: Generate and manage stealth addresses with confidential computing

**Key Functions**:

1. **`register(SignIn auth)`**
   - Creates meta address for user
   - Generates viewing and spending key pairs
   - Stores keys in confidential storage

2. **`generateStealthAddress(string metaAddress, uint32 k)`**
   - Creates unique stealth address
   - Returns: address, ephemeralPub, viewHint
   - Uses ECDH for shared secret generation

3. **`checkStealthAddress(...)`**
   - Verifies if stealth address belongs to user
   - Uses viewing key to check ownership
   - Returns stealth address if valid

4. **`computeStealthKey(...)`**
   - Derives private key for stealth address
   - Requires authentication
   - Returns signing key for spending

5. **`announce(uint32 k, bytes ephemeralPub, bytes1 viewHint)`**
   - Called by ROFL worker
   - Logs transaction metadata on-chain
   - Provides backup in case of backend failure

**Security Features**:
- ✅ Confidential key storage in TEE
- ✅ EIP-712 signature authentication
- ✅ One-time ephemeral key usage
- ✅ View hint optimization (reduces scanning by 256x)
- ✅ ROFL-only announce function

#### Supporting Contracts:
- `Secp256k1.sol` - Elliptic curve operations
- `StealthResolverSdk.sol` - ENS integration
- `Vigil.sol` - Additional utilities

#### Deployment:
```bash
npx hardhat run scripts/deploy.ts --network sapphire-testnet
```

#### Environment Variables:
```bash
PRIVATE_KEY
```

---

### 4️⃣ squidl-rofl (Rust Worker)

**Location**: `/squidl-rofl/squidl-rofl/`  
**Tech Stack**: Rust, Oasis ROFL SDK  
**Lines of Code**: ~200

#### Purpose:
Automated off-chain worker that monitors stealth addresses and creates on-chain backups

#### How It Works:

1. **Periodic Monitoring**:
   - Polls `https://api.squidl.me/stealth-address/recent` every block
   - Fetches recently created stealth addresses

2. **Transaction Detection**:
   - Checks `isTransacted` flag for each address
   - Identifies addresses that received payments

3. **Announcement**:
   - Calls `StealthSigner.announce()` on-chain
   - Logs ephemeralPub and viewHint
   - Creates backup metadata

4. **Deduplication**:
   - Checks if already announced via `checkAnnounce()`
   - Prevents duplicate on-chain events

#### Key Functions:
- `run_oracle()` - Main worker loop
- `check_ephemeral_pub_used()` - Verify announcement status

#### Configuration:
```rust
const STEALTH_SIGNER_CONTRACT_ADDRESS: &str = "0xYourAddress";
fn id() -> AppId { "rofl1qqn9xndja7e2pnxhttktmecvwzz0yqwxsquqyxdf".into() }
```

---

## 🔄 Complete User Flow

### Flow 1: User Registration

```
1. User opens app → 2. Connects wallet (Dynamic.xyz) →
3. Frontend calls /auth/login → 4. Backend creates user →
5. Backend calls StealthSigner.register() →
6. Contract generates meta address → 7. Stores in database →
8. Returns to frontend
```

### Flow 2: Creating Payment Link

```
1. User creates alias ("john") → 2. Frontend calls /stealth-address/create →
3. Backend generates stealth address from contract →
4. Stores: alias → stealth address mapping →
5. Returns payment link: john.squidl.me
```

### Flow 3: Receiving Payment

```
1. Sender sends funds to stealth address →
2. Transaction worker detects payment →
3. Updates isTransacted flag in database →
4. ROFL worker sees change →
5. ROFL calls announce() on-chain →
6. Event emitted for backup
```

### Flow 4: Accessing Funds

```
1. User views balance in dashboard →
2. Clicks "Transfer to Main Wallet" →
3. Frontend calls computeStealthKey() →
4. Contract returns private key →
5. Frontend signs transaction →
6. Funds moved to main wallet
```

---

## 🔐 Privacy Features

### What's Private:
- ✅ **Stealth Address Ownership**: No on-chain link to user
- ✅ **Meta Address**: Never revealed on-chain
- ✅ **Private Keys**: Stored in Sapphire TEE
- ✅ **Viewing Keys**: Required to detect payments
- ✅ **Spending Keys**: Required to access funds

### What's Public:
- ⚠️ **Stealth Address**: Visible on-chain (but not linkable to user)
- ⚠️ **Transaction Amounts**: Standard blockchain visibility
- ⚠️ **Ephemeral Public Key Hash**: Logged by ROFL (minimal info)

### Privacy Improvements Over ERC-5564:
1. **Reduced Events**: Only announce when needed (ROFL)
2. **View Hints**: 256x faster scanning
3. **No On-chain Meta Address**: Never exposed
4. **TEE Key Storage**: Hardware-level security
5. **Optional Announcements**: User choice

---

## 🚀 Technology Highlights

### Oasis Sapphire Integration:

1. **Confidential Computing**:
   - Private key generation in TEE
   - Encrypted contract state
   - No key exposure

2. **ROFL (Runtime Off-chain Logic)**:
   - Automated transaction monitoring
   - Trustless backup mechanism
   - Resilient to backend failures

3. **Low Gas Costs**:
   - Optimized announcement events
   - Minimal on-chain data
   - Batch operations support

### Dynamic.xyz Integration:

1. **Wallet Authentication**:
   - Social login support
   - Multiple wallet providers
   - Seamless UX

2. **EIP-712 Signatures**:
   - Secure session management
   - Type-safe signing
   - User-friendly prompts

---

## 📊 Database Schema

### Core Tables:

```sql
User (id, username, metaAddress, spendPublicKey, viewingPublicKey)
  ├─ UserWallet (address, type: EOA/SOCIAL)
  └─ UserAlias (key, alias)
       └─ StealthAddress (address, ephemeralPub, viewHint, isTransacted)
            └─ Transaction (from, to, value, txHash)

Chain (id, name, rpcUrl, isTestnet)
  ├─ NativeToken (symbol, priceUSD)
  └─ Token (address, symbol, decimals)
       └─ TokenStats (priceUSD)
```

---

## 🔧 Development Setup

### Prerequisites:
- Node.js 18+
- PostgreSQL 14+
- Bun or npm
- Git

### Quick Start:

```bash
# 1. Clone repository
cd /Users/amaan/Downloads/Github2/PrivatePay

# 2. Setup environment variables (see ENV_VARIABLES_GUIDE.md)
# Create .env files in each directory

# 3. Deploy contracts
cd squidl-hardhat
npm install
npx hardhat run scripts/deploy.ts --network sapphire-testnet

# 4. Setup backend
cd ../squidl-backend
npm install
npm run db:push
npm run dev

# 5. Setup frontend
cd ../squidl-frontend
npm install
npm run dev
```

---

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| Total Lines of Code | ~23,000 |
| Solidity Contracts | 6 files |
| Backend API Routes | 4 modules |
| Frontend Components | 30+ components |
| Database Tables | 11 tables |
| Supported Chains | 6 networks |
| External APIs | 5 integrations |

---

## 🎯 Use Cases

1. **Freelancers**: Receive payments without revealing wallet history
2. **Businesses**: Accept payments with enhanced privacy
3. **DAOs**: Distribute funds to members privately
4. **Privacy-Conscious Users**: Regular payments without tracking
5. **Cross-chain Payments**: Bridge assets privately

---

## 🔮 Future Enhancements

- [ ] Multi-signature stealth addresses
- [ ] Hardware wallet support
- [ ] Mobile app (React Native)
- [ ] Payment request system
- [ ] Recurring payment subscriptions
- [ ] Invoice generation
- [ ] Tax reporting tools
- [ ] Analytics dashboard

---

## 📚 Documentation Links

- **Technical Flow**: [Excalidraw Diagram](https://excalidraw.com/#json=FtV1YyZ2JTzPphmrEw1mG,a_D2Fsds3p8W2OJWlRmk6Q)
- **Oasis Sapphire**: https://docs.oasis.io/dapp/sapphire/
- **Dynamic.xyz**: https://docs.dynamic.xyz/
- **Hackathon**: https://dorahacks.io/hackathon/p4w3/buidl

---

## ⚠️ Important Notes

### This is a Hackathon Project:
- ✅ Proof of concept implementation
- ⚠️ Not audited for production use
- ⚠️ Use testnet tokens only
- ⚠️ Keep private keys secure

### Security Considerations:
- Backend database should be encrypted
- API rate limiting should be implemented
- HTTPS required for production
- Regular security audits needed

---

## 🏆 Key Innovations

1. **Improved ERC-5564**: More efficient and private
2. **ROFL Integration**: Automated backup system
3. **Oasis Sapphire**: First major stealth address implementation on Sapphire
4. **User-Friendly**: Simple payment links (john.squidl.me)
5. **Multi-chain Ready**: Deploy SDK to any EVM chain

---

## 👥 For Developers

### Project Structure:
```
PrivatePay/
├── squidl-frontend/      # React web app
├── squidl-backend/       # Node.js API
├── squidl-hardhat/       # Smart contracts
├── squidl-rofl/          # Rust worker
├── ENV_VARIABLES_GUIDE.md
├── SETUP_GUIDE.md
└── PROJECT_SUMMARY.md
```

### Getting Help:
1. Check `SETUP_GUIDE.md` for setup instructions
2. Check `ENV_VARIABLES_GUIDE.md` for configuration
3. Read inline code comments
4. Check console logs for debugging

---

## 🎉 Conclusion

SQUIDL demonstrates how **Oasis Protocol's Sapphire** and **ROFL** can enable truly private payments on blockchain. By combining confidential computing with optimized stealth addresses, it provides a practical solution for privacy-preserving cryptocurrency transactions.

**Built for**: Privacy4Web3 Hackathon  
**By**: SQUIDL Team  
**Status**: Hackathon Submission / Proof of Concept


