export const CHAINS = [
  /* --------------------------------- Testnet -------------------------------- */
  {
    id: 11155111,
    isTestnet: true,
    name: "Ethereum Sepolia",
    chainlistUrl: "https://chainlist.org/chain/11155111",
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    nativeToken: "ETH",
    blockExplorerUrl: "https://sepolia.etherscan.io/",
    imageUrl:
      "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
    nativeTokenData: {
      name: "Ethereum",
      symbol: "ETH",
      logo: "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
      originalChainId: 1,
      wrappedTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    }
  },
  {
    id: 23295,
    isTestnet: true,
    name: "Oasis Sapphire Testnet",
    chainlistUrl: "https://chainlist.org/chain/23295",
    rpcUrl: "https://testnet.sapphire.oasis.io",
    nativeToken: "TEST",
    blockExplorerUrl: "https://explorer.oasis.io/testnet/sapphire",
    imageUrl:
      "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/oasis.svg",
    compatibility: [137],
    nativeTokenData: {
      name: "Test Oasis",
      symbol: "TEST",
      logo: "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/oasis.svg",
      originalChainId: 23294,
      wrappedTokenAddress: "0x21c718c22d52d0f3a789b752d4c2fd5908a8a733",
    }
  },
  /* --------------------------------- Mainnet -------------------------------- */
  {
    id: 1,
    isTestnet: false,
    name: "Ethereum Mainnet",
    chainlistUrl: "https://chainlist.org/chain/1",
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    nativeToken: "ETH",
    blockExplorerUrl: "https://etherscan.io",
    imageUrl:
      "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
    nativeTokenData: {
      name: "Ethereum",
      symbol: "ETH",
      logo: "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/ethereum.svg",
      originalChainId: 1,
      wrappedTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    }
  },
  // {
  //   id: 56,
  //   name: "Binance Smart Chain",
  //   isTestnet: false,
  //   chainlistUrl: "https://chainlist.org/chain/56",
  //   rpcUrl:
  //     `https://bsc-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  //   nativeToken: "BNB",
  //   blockExplorerUrl: "https://bscscan.com/",
  //   imageUrl:
  //     "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/bsc.svg",
  //   nativeTokenData: {
  //     name: "BNB",
  //     symbol: "BNB",
  //     logo: "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/bsc.svg",
  //     originalChainId: 1,
  //     wrappedTokenAddress: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
  //   }
  // },
  // {
  //   id: 23294,
  //   isTestnet: false,
  //   name: "Oasis Sapphire Mainnet",
  //   chainlistUrl: "https://chainlist.org/chain/23294",
  //   rpcUrl: "https://sapphire.oasis.io",
  //   nativeToken: "ROSE",
  //   blockExplorerUrl: "https://explorer.oasis.io/mainnet/sapphire",
  //   imageUrl:
  //     "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/oasis.svg",
  //   compatibility: [137],
  //   nativeTokenData: {
  //     name: "ROSE",
  //     symbol: "ROSE",
  //     logo: "https://filebucketz.sgp1.cdn.digitaloceanspaces.com/misc/chains/oasis.svg",
  //     originalChainId: 23294,
  //     wrappedTokenAddress: "0x21c718c22d52d0f3a789b752d4c2fd5908a8a733",
  //   }
  // },
]

export const ALLOWED_CHAIN_IDS = [1, 137];
