# 🔐 SQUIDL - Environment Variables Guide

## 📋 Overview

This document lists all required environment variables for running the SQUIDL project.

---

## 🗄️ Backend Environment Variables

Create a `.env` file in `squidl-backend/` with these variables:

```bash
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/squidl_db"

# ===========================================
# SERVER CONFIGURATION
# ===========================================
APP_PORT=3205
WORKERS=true

# ===========================================
# AUTHENTICATION & JWT
# ===========================================
JWT_SECRET="your-super-secret-jwt-key-change-this"
DYNAMIC_ENV_ID="your-dynamic-environment-id-from-dynamic.xyz"

# ===========================================
# BLOCKCHAIN APIs
# ===========================================
# Get from: https://infura.io
INFURA_API_KEY="your-infura-api-key"

# Get from: https://moralis.io
MORALIS_API_KEY="your-moralis-api-key"

# Get from: https://portal.1inch.dev
ONE_INCH_DEV_PORTAL_API_KEY="your-1inch-api-key"

# ===========================================
# SMART CONTRACTS
# ===========================================
# Deploy StealthSigner.sol first, then add address here
SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS="0xYourStealthSignerContractAddress"

# Private key for paymaster (used to sponsor transactions)
PAYMASTER_PK="0xYourPaymasterPrivateKey"

# ===========================================
# ENS RESOLVER (Optional)
# ===========================================
RESOLVER_CONTRACT_ADDRESS="0xYourResolverContractAddress"
ENS_RESOLVER_PK="0xYourENSResolverPrivateKey"

# ===========================================
# CLOUDINARY (Optional - for image uploads)
# ===========================================
# Get from: https://cloudinary.com
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
```

---

## 🌐 Frontend Environment Variables

Create a `.env` file in `squidl-frontend/` with these variables:

```bash
# ===========================================
# BACKEND API
# ===========================================
VITE_BACKEND_URL="http://localhost:3205"

# ===========================================
# ENVIRONMENT
# ===========================================
# Options: "dev" or "production"
VITE_APP_ENVIRONMENT="dev"

# ===========================================
# DYNAMIC WALLET AUTHENTICATION
# ===========================================
# Get from: https://dynamic.xyz (MUST match backend)
VITE_DYNAMIC_ENV_ID="your-dynamic-environment-id-from-dynamic.xyz"

# ===========================================
# SMART CONTRACT
# ===========================================
# Deploy StealthSigner.sol first, then add address here (MUST match backend)
VITE_SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS="0xYourStealthSignerContractAddress"

# Private key for paymaster (MUST match backend)
VITE_PAYMASTER_PK="0xYourPaymasterPrivateKey"

# ===========================================
# BLOCKCHAIN API
# ===========================================
# Get from: https://infura.io (MUST match backend)
VITE_INFURA_API_KEY="your-infura-api-key"

# ===========================================
# DOMAIN CONFIGURATION
# ===========================================
VITE_WEBSITE_HOST="squidl.me"
```

---

## ⛓️ Hardhat Environment Variables

Create a `.env` file in `squidl-hardhat/` with these variables:

```bash
# ===========================================
# DEPLOYMENT
# ===========================================
# Private key for deploying contracts (needs TEST tokens on Oasis Sapphire Testnet)
# Get TEST tokens from: https://faucet.testnet.oasis.io/
PRIVATE_KEY="0xYourDeploymentPrivateKey"
```

---

## 📝 Variable Details & How to Obtain

### Required Services & API Keys

| Service | URL | Purpose | Cost |
|---------|-----|---------|------|
| **Dynamic.xyz** | https://dynamic.xyz | Wallet authentication | Free tier available |
| **Infura** | https://infura.io | Blockchain RPC access | Free tier: 100k requests/day |
| **Moralis** | https://moralis.io | Blockchain data APIs | Free tier available |
| **1inch** | https://portal.1inch.dev | Token prices & swaps | Free tier available |
| **Cloudinary** | https://cloudinary.com | Image uploads (optional) | Free tier: 25GB |
| **PostgreSQL** | Local or cloud | Database | Free (local) |
| **Oasis Faucet** | https://faucet.testnet.oasis.io/ | Get TEST tokens | Free |

---

## ✅ Minimum Required Variables to Run

### Backend (Minimum to Start)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/squidl_db"
APP_PORT=3205
JWT_SECRET="change-this-secret-key"
DYNAMIC_ENV_ID="your-dynamic-env-id"
INFURA_API_KEY="your-infura-key"
SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS="deployed-contract-address"
PAYMASTER_PK="0xprivate-key-with-test-tokens"
```

### Frontend (Minimum to Start)
```bash
VITE_BACKEND_URL="http://localhost:3205"
VITE_APP_ENVIRONMENT="dev"
VITE_DYNAMIC_ENV_ID="same-as-backend"
VITE_SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS="same-as-backend"
VITE_INFURA_API_KEY="same-as-backend"
```

### Optional Variables
- `MORALIS_API_KEY` - Only needed if using Moralis features
- `ONE_INCH_DEV_PORTAL_API_KEY` - Only needed for token price workers
- `CLOUDINARY_*` - Only needed for image upload features
- `ENS_RESOLVER_*` - Only needed for ENS integration
- `WORKERS=true` - Set to false to disable background workers

---

## 🚨 Important Security Notes

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Keep private keys secure** - they control funds
4. **Rotate API keys** regularly
5. **Use environment-specific wallets** for paymaster

---

## 🔧 Setup Order

1. **Get API Keys** - Sign up for all required services
2. **Setup Database** - Install PostgreSQL and create database
3. **Deploy Contract** - Deploy StealthSigner.sol to Oasis Sapphire Testnet
4. **Configure Backend** - Create `.env` with all variables
5. **Configure Frontend** - Create `.env` matching backend values
6. **Run Migrations** - Setup database schema
7. **Start Services** - Run backend and frontend

---

## 📞 Need Help?

If you're missing API keys or having issues:
- Check service documentation links above
- Ensure you've completed signup/verification for each service
- Verify your API keys are active and have sufficient quota
- Check that contract is deployed before starting backend

---

## 🎯 Quick Start Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js v18+ installed
- [ ] Created Dynamic.xyz account and got Environment ID
- [ ] Created Infura account and got API key
- [ ] Got TEST tokens from Oasis faucet
- [ ] Deployed StealthSigner contract to Oasis Sapphire Testnet
- [ ] Created backend `.env` file
- [ ] Created frontend `.env` file
- [ ] Created hardhat `.env` file
- [ ] Ran `npm install` in all folders
- [ ] Ran database migrations
- [ ] Started backend server
- [ ] Started frontend dev server


