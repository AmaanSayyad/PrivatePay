import { PrismaClient } from "@prisma/client";
import { CHAINS } from "../../app/config.js";

const prisma = new PrismaClient();

async function main() {
  // Upsert chains (Testnet and Mainnet)
  for (const chain of CHAINS) {
    await prisma.chain.upsert({
      where: {
        id: chain.id,
      },
      create: {
        id: chain.id,
        name: chain.name,
        chainlistUrl: chain.chainlistUrl,
        rpcUrl: chain.rpcUrl,
        blockExplorerUrl: chain.blockExplorerUrl,
        isTestnet: chain.isTestnet,
        imageUrl: chain.imageUrl,
      },
      update: {
        name: chain.name,
        chainlistUrl: chain.chainlistUrl,
        rpcUrl: chain.rpcUrl,
        blockExplorerUrl: chain.blockExplorerUrl,
        isTestnet: chain.isTestnet,
        imageUrl: chain.imageUrl,
      },
    });

    // Upsert Native Token
    await prisma.nativeToken.upsert({
      where: {
        chainId: chain.id,
      },
      create: {
        chainId: chain.id,
        name: chain.nativeTokenData.name,
        symbol: chain.nativeTokenData.symbol,
        logo: chain.nativeTokenData.logo,
      },
      update: {
        name: chain.nativeTokenData.name,
        symbol: chain.nativeTokenData.symbol,
        logo: chain.nativeTokenData.logo,
      },
    });
  }

  // Seed USDC token
  const usdcToken = {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC address on Ethereum Mainnet
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  };

  // Insert USDC for each relevant chain (mainnet or testnet)
  for (const chain of [...CHAINS]) {
    await prisma.token.upsert({
      where: {
        chainId_address: {
          chainId: chain.id,
          address: usdcToken.address,
        },
      },
      create: {
        chainId: chain.id,
        address: usdcToken.address,
        name: usdcToken.name,
        symbol: usdcToken.symbol,
        decimals: usdcToken.decimals,
        logo: usdcToken.logo,
      },
      update: {
        name: usdcToken.name,
        symbol: usdcToken.symbol,
        decimals: usdcToken.decimals,
        logo: usdcToken.logo,
      },
    });
  }

  await prisma.$disconnect();
  console.log("Initial seed with USDC completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
