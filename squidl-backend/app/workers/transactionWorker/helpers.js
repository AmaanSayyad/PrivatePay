import Web3 from "web3"
import { CHAINS } from "../../config.js"
import { prismaClient } from "../../lib/db/prisma.js"
import { getTokenMetadata } from "../../utils/tokenUtils.js"
import { ethers } from "ethers"

export const logTransaction = async ({
  txHash,
  isNative,
  stealthAddressId,
  chainId
}) => {
  try {
    if (!txHash) {
      throw new Error('txHash is required')
    }

    // Check if there is any existing transaction
    const existingTransaction = await prismaClient.transaction.findUnique({
      where: {
        txHash: txHash,
        chainId: chainId
      }
    })
    if (existingTransaction) {
      return
    }

    const chain = CHAINS.find(chain => chain.id === chainId)
    if (!chain) {
      throw new Error('Invalid chainId')
    }

    const web3 = new Web3(chain.rpcUrl)
    const tx = await web3.eth.getTransaction(txHash)

    if (!isNative && tx.input) {
      // Decode ERC20 Transfer
      const methodId = tx.input.slice(0, 10); // First 4 bytes represent method ID
      const transferMethodId = "0xa9059cbb";

      if (methodId === transferMethodId) {
        const recipient = "0x" + tx.input.slice(34, 74); // Extract recipient address
        const valueHex = "0x" + tx.input.slice(74); // Extract value in hex
        const value = web3.utils.hexToNumberString(valueHex); // Convert value to number

        console.log({
          transactionType: "ERC20 Transfer",
          contractAddress: tx.to,
          recipient: recipient,
          value: value,
        });

        const tokenMetadata = await getTokenMetadata({
          tokenAddress: tx.to,
          chainId: chainId
        })

        // Insert transaction to database
        await prismaClient.transaction.upsert({
          where: {
            txHash: txHash,
            chainId: chainId
          },
          update: {},
          create: {
            chainId: chainId,
            fromAddress: tx.from,
            toAddress: recipient,
            isNative: isNative,
            value: value.toString(),
            amount: parseFloat(ethers.formatUnits(value, tokenMetadata.decimals)),
            data: tx,
            txHash: txHash,
            stealthAddressId: stealthAddressId,
            tokenId: tokenMetadata.id
          }
        })

        console.log('Transaction logged successfully.')
      } else {
        console.log('Transaction is not an ERC20 transfer.');
      }
    } else if (isNative) {
      console.log({
        transactionType: "Native Transfer",
        from: tx.from,
        to: tx.to,
        value: tx.value,
        amount: parseFloat(web3.utils.fromWei(tx.value, 'ether'))
      });

      // Insert transaction to database
      await prismaClient.transaction.upsert({
        where: {
          txHash: txHash
        },
        update: {},
        create: {
          chainId: chainId,
          fromAddress: tx.from,
          toAddress: tx.to,
          isNative: isNative,
          value: tx.value.toString(),
          amount: parseFloat(web3.utils.fromWei(tx.value, 'ether')),
          data: tx,
          txHash: txHash,
          stealthAddressId: stealthAddressId
        }
      })

      console.log('Transaction logged successfully.')
    }
  } catch (error) {
    console.log('Error while logging transaction', error)
  }
}

// NATIVE
// logTransaction({
//   txHash: '0xf62ecfefa5cf096041fbcbb9e1e852bc7f5e80eb76c582d2240ad5964810659a',
//   isNative: true,
//   stealthAddressId: 'cm2uvtwn900036mcang5s7esk',
//   chainId: 11155111
// })

// ERC20
// logTransaction({
//   txHash: '0xae73cfd81b37040040764723dd4665fd33e4cd767f2f19137155a588d40e8a3b',
//   isNative: false,
//   stealthAddressId: 'cm2uvtwn900036mcang5s7esk',
//   chainId: 11155111
// })