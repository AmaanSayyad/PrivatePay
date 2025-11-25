import { Contract, ethers, JsonRpcProvider } from "ethers";
import { CHAINS } from "../../config.js";
import { prismaClient } from "../../lib/db/prisma.js";
import { erc20Abi } from "viem";
import { getTokenMetadata } from "../../utils/tokenUtils.js";

export function aggregateBalances(data) {
  const aggregatedBalances = {
    native: {},
    erc20: {},
  };

  // Remove wallets without balances in either native or ERC20
  data = data.filter(
    (wallet) =>
      wallet.nativeBalances.length > 0 || wallet.erc20Balances.length > 0
  );

  // Filter out undefined entries in native and ERC20 balances
  data.forEach((wallet) => {
    wallet.nativeBalances = wallet.nativeBalances.filter(
      (native) => native !== undefined
    );
    wallet.erc20Balances = wallet.erc20Balances.filter(
      (erc20) => erc20 !== undefined
    );
  });

  data.forEach((wallet) => {
    // Process native token balances
    wallet.nativeBalances.forEach((native) => {
      const {
        chainId,
        nativeToken,
        logo,
        balance,
        priceUSD,
        chainName,
        chainLogo,
      } = native;
      const key = `${chainId}_${nativeToken.symbol}`;

      if (!aggregatedBalances.native[key]) {
        aggregatedBalances.native[key] = {
          chainId,
          chainName,
          chainLogo,
          nativeToken,
          logo,
          balance: 0,
          priceUSD: 0,
        };
      }

      // Accumulate balance and calculate priceUSD as balance * priceUSD
      aggregatedBalances.native[key].balance += balance;
      aggregatedBalances.native[key].priceUSD += priceUSD;
      aggregatedBalances.native[key].balanceUSD += priceUSD;
    });

    // Process ERC20 token balances
    wallet.erc20Balances.forEach((erc20) => {
      const {
        chainId,
        address,
        balance,
        token: { name, symbol, decimals, priceUSD, logo },
        chainName,
        chainLogo,
      } = erc20;
      const key = `${chainId}_${address}`;

      if (!aggregatedBalances.erc20[key]) {
        aggregatedBalances.erc20[key] = {
          chainId,
          chainLogo,
          chainName,
          address,
          balance: 0,
          token: {
            address,
            decimals,
            logo,
            name,
            symbol,
            priceUSD,
          },
          priceUSD: 0,
        };
      }

      // Accumulate balance and calculate priceUSD as balance * priceUSD
      aggregatedBalances.erc20[key].balance += balance;
      aggregatedBalances.erc20[key].priceUSD += balance * priceUSD;
    });
  });

  const nativeResult = Object.values(aggregatedBalances.native);
  const erc20Result = Object.values(aggregatedBalances.erc20);

  console.log("Native result: ", nativeResult);

  const totalBalanceUSD =
    nativeResult.reduce((acc, { priceUSD }) => acc + priceUSD, 0) +
    erc20Result.reduce((acc, { priceUSD }) => acc + priceUSD, 0);

  // Sort nativeResult and erc20Result by priceUSD
  nativeResult.sort((a, b) => b.priceUSD - a.priceUSD);
  erc20Result.sort((a, b) => b.priceUSD - a.priceUSD);

  return {
    aggregatedBalances: {
      native: nativeResult,
      erc20: erc20Result,
    },
    totalBalanceUSD,
  };
}

export async function getAliasTotalBalanceUSD(alias, username) {
  const aliasData = await prismaClient.userAlias.findFirst({
    where: { alias, user: { username } },
    include: {
      stealthAddresses: {
        where: { isTransacted: true },
        select: {
          address: true,
          transactions: {
            select: {
              chainId: true,
              isNative: true,
              token: { select: { address: true } },
            },
          },
        },
      },
    },
  });

  if (!aliasData) throw new Error("Alias not found");

  let totalBalanceUSD = 0;

  const stealthAddressesData = aliasData.stealthAddresses;

  let stealthAddressWithAssets = stealthAddressesData.map((stealthAddress) => {
    const nativeTokens = new Set();
    const erc20Tokens = new Map();

    stealthAddress.transactions.forEach(({ chainId, isNative, token }) => {
      if (isNative) nativeTokens.add(chainId);
      else if (token?.address)
        erc20Tokens.set(`${chainId}_${token.address}`, {
          chainId,
          address: token.address,
        });
    });

    return {
      ...stealthAddress,
      nativeTokens: [...nativeTokens],
      erc20Tokens: [...erc20Tokens.values()],
    };
  });

  // console.dir(stealthAddressWithAssets, {
  //   depth: 12,
  // });

  for (const stealthAddress of stealthAddressWithAssets) {
    for (const chainId of stealthAddress.nativeTokens) {
      const network = CHAINS.find((chain) => chain.id === chainId);
      const provider = new JsonRpcProvider(network.rpcUrl);
      const balance = await provider.getBalance(stealthAddress.address);
      const formattedBalance = parseFloat(ethers.formatEther(balance));

      const nativeToken = await prismaClient.nativeToken.findFirst({
        where: { chainId },
        select: { priceUSD: true },
      });

      totalBalanceUSD += (nativeToken.priceUSD || 0) * formattedBalance;
    }

    for (const erc20Token of stealthAddress.erc20Tokens) {
      const { chainId, address } = erc20Token;
      const network = CHAINS.find((chain) => chain.id === chainId);
      if (!network) continue;

      const provider = new JsonRpcProvider(network.rpcUrl);
      const contract = new Contract(address, erc20Abi, provider);
      const balance = await contract.balanceOf(stealthAddress.address);

      const tokenMetadata = await getTokenMetadata({
        tokenAddress: address,
        chainId,
      });

      const formattedBalance = parseFloat(
        ethers.formatUnits(balance, tokenMetadata.decimals)
      );

      const tokenPrice = await prismaClient.token.findFirst({
        where: { address },
        select: { stats: { select: { priceUSD: true } } },
      });

      totalBalanceUSD += (tokenPrice.stats.priceUSD || 0) * formattedBalance;
    }
  }

  return totalBalanceUSD;
}

export function getAliasesList({ stealthAddresses = [], aliasesList = [] }) {
  const aliasBalances = {};

  // if aliases list stealth address is empty add the alias to the alias balance with default values
  if (aliasesList.length > 0) {
    aliasesList.forEach((alias) => {
      if (!alias.stealthAddresses || alias.stealthAddresses.length === 0) {
        aliasBalances[alias.id] = {
          id: alias.id,
          alias: alias.alias,
          balanceUSD: 0,
          createdAt: alias.createdAt,
        };
      }
    });
  }

  stealthAddresses.forEach((addressData) => {
    // Calculate the total balance in USD by summing native and ERC20 balances
    const totalBalanceUSD = [
      ...(addressData.nativeBalances || []),
      ...(addressData.erc20Balances || []),
    ].reduce(
      (total, balance) => total + (balance.balanceUSD),
      0
    );

    const { id, alias, createdAt } = addressData.alias;

    if (aliasBalances[id]) {
      // If the id already exists, add the balance and keep the earliest createdAt date
      aliasBalances[id].balanceUSD += totalBalanceUSD;
      aliasBalances[id].createdAt = new Date(
        Math.min(new Date(aliasBalances[id].createdAt), new Date(createdAt))
      ).toISOString();
    } else {
      aliasBalances[id] = {
        id,
        alias: alias || "",
        balanceUSD: totalBalanceUSD,
        createdAt,
      };
    }
  });

  // Convert to array, format balanceUSD, and sort by createdAt in ascending order
  const aliases = Object.values(aliasBalances)
    .map((item) => ({
      ...item,
      balanceUSD: item.balanceUSD.toFixed(2), // Format to 2 decimal places
    }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  console.log(aliases);

  return aliases;
}
