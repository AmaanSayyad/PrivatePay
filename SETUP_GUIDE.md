# 🚀 SQUIDL - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Project](#running-the-project)
7. [Environment Variables Explained](#environment-variables-explained)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **PostgreSQL** database (v14 or higher)
- **Git**

### Required API Keys & Services

1. **Dynamic.xyz Account** - For wallet authentication
   - Sign up at: https://dynamic.xyz
   - Create a new project
   - Get your Environment ID

2. **Infura Account** - For blockchain RPC access
   - Sign up at: https://infura.io
   - Create a new project
   - Get your API key

3. **Moralis Account** - For blockchain data
   - Sign up at: https://moralis.io
   - Get your API key

4. **1inch Developer Portal** - For token prices and swaps
   - Sign up at: https://portal.1inch.dev
   - Get your API key

5. **Cloudinary Account** - For image uploads
   - Sign up at: https://cloudinary.com
   - Get your cloud name, API key, and secret

6. **Oasis Sapphire Testnet** - For deploying contracts
   - Get TEST tokens from: https://faucet.testnet.oasis.io/

---

## Environment Setup

### 1. Clone and Setup Structure

```bash
cd /Users/amaan/Downloads/Github2/PrivatePay
```

### 2. Setup Environment Variables

#### Backend (.env)

```bash
cd squidl-backend
cp .env.example .env
# Edit .env with your actual values
```

#### Frontend (.env)

```bash
cd ../squidl-frontend
cp .env.example .env
# Edit .env with your actual values
```

#### Hardhat (.env)

```bash
cd ../squidl-hardhat
cp .env.example .env
# Edit .env with your deployment private key
```

---

## Smart Contract Deployment

### 1. Install Dependencies

```bash
cd squidl-hardhat
npm install
# or
bun install
```

### 2. Deploy StealthSigner Contract

```bash
# Deploy to Oasis Sapphire Testnet
npx hardhat run scripts/deploy.ts --network sapphire-testnet
```

**Important**: Copy the deployed contract address and update:
- `squidl-backend/.env` → `SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS`
- `squidl-frontend/.env` → `VITE_SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS`

---

## Backend Setup

### 1. Install Dependencies

```bash
cd squidl-backend
npm install
```

### 2. Setup PostgreSQL Database

```bash
# Create database
createdb squidl_db

# Or using psql
psql -U postgres
CREATE DATABASE squidl_db;
```

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/squidl_db"
```

### 3. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed initial data
npm run db:seed
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd squidl-frontend
npm install
```

### 2. Verify Configuration

Ensure your `.env` file has:
- Backend URL pointing to `http://localhost:3205`
- Same Dynamic Environment ID as backend
- Same contract address as backend

---

## Running the Project

### Option 1: Run All Services Separately

#### Terminal 1 - Backend

```bash
cd squidl-backend
npm run dev
# Backend will start on http://localhost:3205
```

#### Terminal 2 - Frontend

```bash
cd squidl-frontend
npm run dev
# Frontend will start on http://localhost:5173 (or another port)
```

### Option 2: Production Build

#### Backend

```bash
cd squidl-backend
npm start
```

#### Frontend

```bash
cd squidl-frontend
npm run build
npm run preview
```

---

## Environment Variables Explained

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `APP_PORT` | No | Server port (default: 3205) |
| `WORKERS` | No | Enable background workers (true/false) |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT token generation |
| `DYNAMIC_ENV_ID` | ✅ Yes | Dynamic.xyz environment ID |
| `INFURA_API_KEY` | ✅ Yes | Infura API key for RPC access |
| `MORALIS_API_KEY` | ✅ Yes | Moralis API key |
| `ONE_INCH_DEV_PORTAL_API_KEY` | ✅ Yes | 1inch API key |
| `SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS` | ✅ Yes | Deployed StealthSigner contract address |
| `PAYMASTER_PK` | ✅ Yes | Private key for gas sponsorship |
| `ENS_RESOLVER_PK` | No | Private key for ENS operations |
| `RESOLVER_CONTRACT_ADDRESS` | No | ENS resolver contract address |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | No | Cloudinary upload preset |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | ✅ Yes | Backend API URL |
| `VITE_APP_ENVIRONMENT` | ✅ Yes | Environment (dev/production) |
| `VITE_DYNAMIC_ENV_ID` | ✅ Yes | Dynamic.xyz environment ID (same as backend) |
| `VITE_SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS` | ✅ Yes | StealthSigner contract address (same as backend) |
| `VITE_PAYMASTER_PK` | ✅ Yes | Paymaster private key (same as backend) |
| `VITE_INFURA_API_KEY` | ✅ Yes | Infura API key (same as backend) |
| `VITE_WEBSITE_HOST` | No | Custom domain (default: squidl.me) |

### Hardhat Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | ✅ Yes | Private key with TEST tokens for deployment |

---

## Testing the Application

1. **Access Frontend**: Open browser to `http://localhost:5173`
2. **Connect Wallet**: Click "Connect Wallet" and authenticate via Dynamic.xyz
3. **Create Alias**: Create a payment alias (e.g., `john`)
4. **Generate Stealth Address**: System generates unique stealth address
5. **Test Payment**: Send test tokens to the stealth address
6. **Monitor Transaction**: Backend workers will detect and process the transaction

---

## Troubleshooting

### Database Issues

```bash
# Reset database
npm run db:reset

# Regenerate Prisma client
npm run db:generate
```

### Port Conflicts

If ports are already in use:
- Backend: Change `APP_PORT` in `.env`
- Frontend: Vite will automatically suggest another port

### Contract Connection Issues

Verify:
- Contract address is correct in both frontend and backend
- You're connected to Oasis Sapphire Testnet
- Contract is deployed and verified

### API Rate Limits

If you hit API rate limits:
- Use your own API keys (not shared ones)
- Implement caching in backend
- Reduce worker polling frequency

---

## Additional Resources

- **Oasis Sapphire Docs**: https://docs.oasis.io/dapp/sapphire/
- **Dynamic.xyz Docs**: https://docs.dynamic.xyz/
- **Project Excalidraw**: https://excalidraw.com/#json=FtV1YyZ2JTzPphmrEw1mG,a_D2Fsds3p8W2OJWlRmk6Q

---

## Security Notes

⚠️ **IMPORTANT**:
- **Never commit `.env` files** to version control
- **Keep private keys secure** and never share them
- **Use different keys** for development and production
- **Rotate API keys regularly**
- **Use environment-specific paymasters**

---

## Need Help?

This project is a submission for the **Privacy4Web3 Hackathon** by Oasis Protocol.

For issues or questions, refer to the project documentation or create an issue in the repository.

