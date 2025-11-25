import { JsonRpcProvider, Interface, ethers } from "ethers";
import Web3 from "web3";
import { CHAINS } from "../../config.js";
import { prismaClient } from "../../lib/db/prisma.js";
import cron from "node-cron";
import { logTransaction } from "./helpers.js";
import { sleep } from "../../utils/miscUtils.js";

const ERC20_TRANSFER_EVENT_SIG = "Transfer(address,address,uint256)";
const erc20Interface = new Interface([`event ${ERC20_TRANSFER_EVENT_SIG}`]);
const TRANSFER_TOPIC = Web3.utils.sha3("Transfer(address,address,uint256)");
const BLOCKS_TO_CHECK = 25; // Number of recent blocks to scan

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const transactionWorker = (app, _, done) => {
  console.log("Transaction worker is running...");

  let isCheckingTransactions = false;
  const handleCheckStealthAddressTransaction = async () => {
    try {
      if (isCheckingTransactions) return;
      isCheckingTransactions = true;

      console.log("Already checking transactions, skipping...");

      // Get recently created stealth addresses that haven't been marked as transacted
      const recentStealthAddresses = await prismaClient.stealthAddress.findMany({
        where: {
          createdAt: {
            // gte: new Date(Date.now() - 8 * 60 * 60 * 1000), // Created no more than 8 hours ago, this is done to avoid checking too many addresses
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100
      });

      // console.log('recentStealthAddresses', recentStealthAddresses);

      if (recentStealthAddresses.length === 0) {
        console.log("No recent stealth addresses to check");
        return;
      }

      // Map addresses to their IDs for quick lookup
      const addressToIdMap = recentStealthAddresses.reduce((map, addr) => {
        map[addr.address.toLowerCase()] = addr.id;
        return map;
      }, {});

      const stealthAddresses = Object.keys(addressToIdMap);

      console.log("Checking stealth addresses", stealthAddresses);

      for (const chain of CHAINS) {
      // for (const chain of CHAINS.filter(chain => chain.isTestnet)) {
        const web3 = new Web3(chain.rpcUrl);

        // Get the latest block number and calculate the range to check
        const currentBlock = parseInt((await web3.eth.getBlockNumber()).toString());
        const fromBlock = Math.max(0, currentBlock - BLOCKS_TO_CHECK);

        console.log(`Fetching logs and transactions for blocks ${fromBlock} to ${currentBlock} on chain: ${chain.name}`);

        // Fetch all logs in the block range for ERC20 transfers
        const options = {
          fromBlock,
          toBlock: currentBlock,
          topics: [TRANSFER_TOPIC],
        };
        const logs = await web3.eth.getPastLogs(options);

        // Check logs for any relevant ERC20 transfers
        const detectedIds = new Set();
        for (const log of logs) {
          const involvedAddress = log.topics.find(topic =>
            stealthAddresses.some(address => topic.toLowerCase().includes(address.slice(2)))
          );

          if (involvedAddress) {
            const matchedAddress = "0x" + involvedAddress.slice(-40).toLowerCase();
            const matchedId = addressToIdMap[matchedAddress];
            if (matchedId) {
              detectedIds.add(matchedId);

              console.log(`Detected ERC20 transfer to stealth address with ID ${matchedId} on ${chain.name}`, {
                log: log
              });

              await logTransaction({
                txHash: log.transactionHash,
                isNative: false,
                stealthAddressId: matchedId,
                chainId: chain.id
              })
            }
          }
        }

        // Check transactions in each block for native transfers
        for (let blockNumber = fromBlock; blockNumber <= currentBlock; blockNumber++) {
          try {
            const block = await web3.eth.getBlock(blockNumber, true); // `true` includes full transactions
            for (const tx of block.transactions) {
              if (tx.to) {
                const toAddress = tx.to.toLowerCase();
                const matchedId = addressToIdMap[toAddress];
                if (matchedId) {
                  detectedIds.add(matchedId);

                  console.log(`Detected native transaction to stealth address with ID ${matchedId} on ${chain.name}`, {
                    tx: tx
                  });

                  await logTransaction({
                    txHash: tx.hash,
                    isNative: true,
                    stealthAddressId: matchedId,
                    chainId: chain.id
                  })
                }
              }
            }
          } catch (error) {
            console.log('Error while fetching block', error)
          }
        }

        // Update database for all detected addresses by ID
        for (const id of detectedIds) {
          await prismaClient.stealthAddress.update({
            where: {
              id: id,
            },
            data: {
              isTransacted: true
            },
          });
          console.log(`Marked stealth address with ID ${id} as transacted on ${chain.name}`);
        }

        console.log(`Finished checking stealth addresses on ${chain.name}`);
        await sleep(500)
      }
    } catch (error) {
      console.log("Error in handleCheckStealthAddressTransaction", error);
    } finally {
      isCheckingTransactions = false;
    }
  };


  cron.schedule("*/15 * * * * *", () => {
    console.log("Running stealth address transaction check...");
    handleCheckStealthAddressTransaction();
  })

  handleCheckStealthAddressTransaction();

  done();
};
