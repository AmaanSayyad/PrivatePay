import * as sapphire from '@oasisprotocol/sapphire-paratime';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { prismaClient } from '../../db/prisma.js';
import { sleep } from '../../../utils/miscUtils.js';

const __dirname = path.resolve();
export const StealthSignerABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'app/lib/contracts/oasis/abi/StealthSigner.json'), 'utf8'));

// StealthSignerContract.js
export const OASIS_CONTRACT = {
  mainnet: {
    address: "",
    explorerUrl: "",
    network: {
      id: 23294,
      name: "Oasis Sapphire Mainnet",
      nativeToken: "ROSE",
      rpcUrl: "https://sapphire.oasis.io",
    }
  },
  testnet: {
    address: process.env.SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS,
    explorerUrl: `https://explorer.oasis.io/testnet/sapphire/address/${process.env.SQUIDL_STEALTHSIGNER_CONTRACT_ADDRESS}`,
    network: {
      id: 23295,
      name: "Oasis Sapphire Testnet",
      nativeToken: "TEST",
      rpcUrl: "https://testnet.sapphire.oasis.io",
    }
  }
}

export const stealthSignerGenerateStealthAddress = async ({
  chainId,
  metaAddress,
  key,
}) => {
  try {
    if (!chainId || !metaAddress || !key) {
      throw new Error('Missing required parameters');
    }

    const network = Object.values(OASIS_CONTRACT).find(
      (network) => network.network.id === chainId
    ).network;
    if (!network) {
      throw new Error('Invalid chainId');
    }
    const provider = sapphire.wrap(ethers.getDefaultProvider(network.rpcUrl));

    const contract = new ethers.Contract(
      OASIS_CONTRACT.testnet.address,
      StealthSignerABI.abi,
      provider
    );

    const generatedStealthAddress = await contract.generateStealthAddress.staticCall(
      metaAddress,
      key
    );
    const [stealthAddress, ephemeralPub, viewHint] = generatedStealthAddress;

    console.log('generatedStealthAddress', generatedStealthAddress);


    const stealthAddressCheck = await contract.checkStealthAddress.staticCall(
      metaAddress,
      key,
      ephemeralPub,
      ethers.getBytes(viewHint)
    )

    console.log('stealthAddressCheck', stealthAddressCheck);

    const data = {
      stealthAddress,
      ephemeralPub,
      viewHint,
      stealthAddressCheck
    }
    return data;
  } catch (error) {
    console.log(error);
  }
}

// stealthSignerGenerateStealthAddress({
//   chainId: 23295,
//   key: 1,
//   metaAddress: "st:eth:0x025c66a53b27a3dbe6e591c6ef58a022538922341a650231a30a04e65494333a7802fc0af3018b0cec9159541bb5efc76c583b6f330a9bb97486cf553e3f6c8dc717"
// })

export const stealthSignerGetMetaAddress = async ({
  chainId,
  auth
}) => {
  try {
    const network = Object.values(OASIS_CONTRACT).find(
      (network) => network.network.id === chainId
    ).network;
    const provider = sapphire.wrap(ethers.getDefaultProvider(network.rpcUrl));

    const contract = new ethers.Contract(
      OASIS_CONTRACT.testnet.address,
      StealthSignerABI.abi,
      provider
    );

    const metaAddress = await contract.getMetaAddress.staticCall(auth, 1);
    console.log('metaAddress', metaAddress);

    return metaAddress;
  } catch (error) {
    console.log(error);
  }
}

export const stealthSignerCheckStealthAddress = async ({
  chainId,
  metaAddress,
  k,
  ephemeralPub,
  viewHint,
  expected
}) => {
  try {
    const network = Object.values(OASIS_CONTRACT).find(
      (network) => network.network.id === chainId
    ).network;
    const provider = sapphire.wrap(ethers.getDefaultProvider(network.rpcUrl));

    const contract = new ethers.Contract(
      OASIS_CONTRACT.testnet.address,
      StealthSignerABI.abi,
      provider
    );

    const stealthAddress = await contract.checkStealthAddress.staticCall(
      metaAddress,
      k,
      ephemeralPub,
      ethers.getBytes(viewHint)
    )

    console.log('stealthAddress check:', stealthAddress); // Expected: 0xcaFB78fD713eBfE220E7C02e6005080Db54E39a9
    if (stealthAddress === expected) {
      console.log('Stealth address check passed');
    } else {
      console.error('Stealth address check failed');
    }
  } catch (error) {
    console.log(error);
  }
}

// stealthSignerCheckStealthAddress({
//   chainId: 23295,
//   metaAddress: "st:eth:0x025c66a53b27a3dbe6e591c6ef58a022538922341a650231a30a04e65494333a7802fc0af3018b0cec9159541bb5efc76c583b6f330a9bb97486cf553e3f6c8dc717",
//   k: 1,
//   ephemeralPub: "0x02585db927759746ba7362f238b3a7f682cfa38251611708b038b4be2e3d17b52f",
//   viewHint: "0xb4"
// })

// stealthSignerCheckStealthAddress({
//   chainId: 23295,
//   metaAddress: "st:eth:0x025c66a53b27a3dbe6e591c6ef58a022538922341a650231a30a04e65494333a7802fc0af3018b0cec9159541bb5efc76c583b6f330a9bb97486cf553e3f6c8dc717",
//   k: 1,
//   ephemeralPub: "0x02e609640b58587b1382d4d6701a7d963c7d0f0fa72e71af78c3ae2514e5effb17",
//   viewHint: "0x1f",
//   expected: "0xF366E7D225d99AB2F5fA3416fC2Da2D6497F0747"
// })

export const stealthSignerSimulateAnnounce = async ({
  chainId,
  k,
  ephemeralPub,
  viewHint,
}) => {
  try {
    const network = Object.values(OASIS_CONTRACT).find(
      (network) => network.network.id === chainId
    ).network;

    const provider = sapphire.wrap(ethers.getDefaultProvider(network.rpcUrl));
    const signer = new ethers.Wallet(process.env.PAYMASTER_PK, provider);

    const contract = new ethers.Contract(
      OASIS_CONTRACT.testnet.address,
      StealthSignerABI.abi,
      signer
    );

    const announce = await contract.announce(
      k,
      ephemeralPub,
      ethers.getBytes(viewHint)
    );

    console.log('announce', announce);
  } catch (error) {
    console.log(error);
  }
}

