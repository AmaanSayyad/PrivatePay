import Web3 from "web3";
import { CHAINS } from "../config.js";
import { erc20Abi } from "viem";
import { Contract, JsonRpcProvider } from "ethers";
import { prismaClient } from "../lib/db/prisma.js";
import { dexscreenerGetTokens } from "../lib/dexscreener/api.js";

export const getTokenMetadata = async ({
  tokenAddress,
  chainId
}) => {
  try {
    let existingToken = await prismaClient.token.findFirst({
      where: {
        chainId: chainId,
        address: tokenAddress
      }
    })

    if (existingToken) {
      return existingToken;
    }

    const network = CHAINS.find(
      (network) => network.id === chainId
    )

    const provider = new JsonRpcProvider(network.rpcUrl);
    const contract = new Contract(
      tokenAddress,
      erc20Abi,
      provider
    );

    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();

    // TODO: Handle the logo stuff

    const tokenData = {
      name,
      symbol,
      decimals: parseInt(decimals),
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' // Placeholder
    }

    existingToken = await prismaClient.token.upsert({
      where: {
        chainId_address: {
          chainId: chainId,
          address: tokenAddress
        }
      },
      update: {},
      create: {
        chainId: chainId,
        address: tokenAddress,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        logo: tokenData.logo
      }
    })

    // Get the pair data from dexscreener, if testnet, set the price to 1 USD
    let priceUSD;
    if (network.isTestnet) {
      priceUSD = 1;
      await prismaClient.tokenStats.upsert({
        where: {
          tokenId: existingToken.id
        },
        create: {
          tokenId: existingToken.id,
          priceUSD: 1.0
        },
        update: {}
      })
      existingToken.priceUSD = priceUSD;

      return existingToken;
    } else {
      try {
        const dexsResponse = await dexscreenerGetTokens({
          tokenAddresses: [tokenAddress]
        });
  
        const pair = dexsResponse.pairs[0];
        priceUSD = pair ? parseFloat(pair.priceUsd) : null;

        existingToken.priceUSD = priceUSD;
  
        await prismaClient.tokenStats.upsert({
          where: {
            tokenId: existingToken.id
          },
          update: {
            priceUSD: priceUSD
          },
          create: {
            tokenId: existingToken.id,
            priceUSD: priceUSD
          }
        });
      } catch (error) {
        console.log('Error fetching token price from dexscreener');
        // Set the price to 0 if there is an error
        await prismaClient.tokenStats.upsert({
          where: {
            tokenId: existingToken.id
          },
          update: {
            priceUSD: 0
          },
          create: {
            tokenId: existingToken.id,
            priceUSD: 0
          }
        });
      }
    }

    return existingToken;
  } catch (error) {
    console.log(error);
  }
}

// await getTokenMetadata({
//   tokenAddress: '0xc234cb1b59d12c0c2f0e984ee9112a6311b86223',
//   chainId: 1
// })