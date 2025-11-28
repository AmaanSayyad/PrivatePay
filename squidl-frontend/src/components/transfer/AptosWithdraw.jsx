import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import { useAptos } from "../../providers/AptosProvider";
import { getUserBalance } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Icons } from "../shared/Icons";
import { useNavigate } from "react-router-dom";
import { usePhoton } from "../../providers/PhotonProvider.jsx";

export function AptosWithdraw() {
  const { account, isConnected, connect } = useAptos();
  const navigate = useNavigate();
  const { trackRewardedEvent } = usePhoton();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function loadBalance() {
      if (account) {
        setIsLoadingBalance(true);
        const savedUsername = localStorage.getItem(`aptos_username_${account}`);
        const currentUsername = savedUsername || account.slice(2, 8);
        setUsername(currentUsername);

        try {
          const balanceData = await getUserBalance(currentUsername);
          setBalance(balanceData?.available_balance || 0);
        } catch (error) {
          console.error('Error loading balance:', error);
          setBalance(0);
        } finally {
          setIsLoadingBalance(false);
        }
      }
    }

    loadBalance();

    // Listen for balance updates
    const handleBalanceUpdate = () => {
      loadBalance();
    };

    window.addEventListener('balance-updated', handleBalanceUpdate);

    return () => {
      window.removeEventListener('balance-updated', handleBalanceUpdate);
    };
  }, [account]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Please connect your Aptos wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!destinationAddress) {
      toast.error("Please enter a destination address");
      return;
    }

    setIsLoading(true);
    try {
      toast.loading("Processing withdrawal...", { id: "withdraw" });

      // Import Aptos SDK
      const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = await import("@aptos-labs/ts-sdk");
      const { withdrawFunds } = await import("../../lib/supabase");

      // Treasury private key (should be in env)
      const treasuryPrivateKeyHex = import.meta.env.VITE_TREASURY_PRIVATE_KEY;
      
      if (!treasuryPrivateKeyHex) {
        throw new Error("Treasury private key not configured");
      }

      // Initialize Aptos client
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);

      // Create treasury account from private key
      const privateKey = new Ed25519PrivateKey(treasuryPrivateKeyHex);
      const treasuryAccount = Account.fromPrivateKey({ privateKey });

      console.log("Treasury address:", treasuryAccount.accountAddress.toString());

      // Convert amount to octas (1 APT = 100000000 octas)
      const amountInOctas = Math.floor(parseFloat(amount) * 100_000_000);

      // Build transaction
      const transaction = await aptos.transaction.build.simple({
        sender: treasuryAccount.accountAddress,
        data: {
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [destinationAddress, amountInOctas],
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: treasuryAccount,
        transaction,
      });

      console.log("Transaction submitted:", committedTxn.hash);

      // Wait for transaction
      const executedTxn = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      if (!executedTxn.success) {
        throw new Error("Transaction failed on blockchain");
      }

      // Update Supabase balance
      const result = await withdrawFunds(username, parseFloat(amount), destinationAddress, committedTxn.hash);

      toast.dismiss("withdraw");
      
      toast.success(
        `Withdrawal successful! ${parseFloat(amount).toFixed(4)} APT sent to ${destinationAddress.slice(0, 6)}...${destinationAddress.slice(-4)}`,
        { duration: 8000 }
      );

      // Update local balance
      setBalance(result.newBalance);

      // Trigger balance update
      window.dispatchEvent(new Event('balance-updated'));

      // Track rewarded event for successful withdrawal
      trackRewardedEvent("aptos_withdrawal_completed", {
        amount: parseFloat(amount),
        tokenSymbol: "APT",
        destinationAddress: destinationAddress.slice(0, 10),
        txHash: committedTxn.hash.slice(0, 10),
      });

      // Reset form
      setAmount("");
      setDestinationAddress("");

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.dismiss("withdraw");
      toast.error(error.message || "Failed to process withdrawal");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="relative flex flex-col w-full max-w-md items-center justify-center bg-light-white rounded-[32px] p-6">
        <div className="relative flex gap-4 w-full items-center justify-center mb-8">
          <h1 className="absolute text-[#161618] font-bold">Withdraw Funds</h1>
          <button
            onClick={handleBack}
            className="relative flex w-fit mr-auto items-center justify-center bg-white rounded-full size-11"
          >
            <Icons.back className="text-black size-6" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-gray-600 text-center">Connect your Aptos wallet to withdraw funds</p>
          <Button
            color="primary"
            onClick={connect}
            className="h-14 rounded-full px-8"
            size="lg"
          >
            Connect Aptos Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full max-w-md items-start justify-center bg-neutral-50 rounded-[32px] p-6">
      {/* Header */}
      <div className="relative flex gap-4 w-full items-center justify-center mb-8">
        <h1 className="absolute text-[#161618] font-bold text-xl">Withdraw Funds</h1>
        <button
          onClick={handleBack}
          className="relative flex w-fit mr-auto items-center justify-center bg-white rounded-full size-11 hover:bg-gray-100 transition-colors"
        >
          <Icons.back className="text-black size-6" />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Available Balance Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Available Balance</p>
            <div className="bg-white/20 rounded-full px-3 py-1">
              <p className="text-xs font-medium">APT</p>
            </div>
          </div>
          {isLoadingBalance ? (
            <div className="flex items-center gap-2">
              <div className="animate-pulse bg-white/30 h-10 w-32 rounded-lg"></div>
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold mb-1">{balance.toFixed(4)}</p>
              <p className="text-xs opacity-75">Held in treasury wallet</p>
            </>
          )}
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <h1 className="text-sm text-[#A1A1A3] font-medium">Amount (APT)</h1>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                classNames={{
                  input: "text-lg font-medium",
                  inputWrapper: "rounded-2xl h-16 bg-white border-2 border-gray-200 hover:border-primary-300 transition-colors",
                }}
                disabled={isLoadingBalance || balance === 0}
              />
            </div>
            <Button
              onClick={() => setAmount(balance.toString())}
              isDisabled={isLoadingBalance || balance === 0}
              className="h-16 px-6 rounded-2xl bg-primary-50 text-primary font-semibold hover:bg-primary-100 transition-colors"
            >
              Max
            </Button>
          </div>
          {amount && parseFloat(amount) > balance && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <span>⚠️</span> Insufficient balance
            </p>
          )}
        </div>

        {/* Destination Address */}
        <div className="flex flex-col gap-2">
          <h1 className="text-sm text-[#A1A1A3] font-medium">Destination Address</h1>
          <Input
            placeholder="0x..."
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            classNames={{
              input: "text-sm font-mono",
              inputWrapper: "rounded-2xl h-16 bg-white border-2 border-gray-200 hover:border-primary-300 transition-colors",
            }}
          />
          <Button
            size="sm"
            variant="light"
            onClick={() => setDestinationAddress(account)}
            className="w-fit rounded-full text-primary hover:bg-primary-50"
          >
            Use my connected wallet
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mt-2">
          <div className="flex gap-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">How it works</p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Funds will be transferred from the treasury wallet to your specified address. 
                The transaction will be processed on the Aptos blockchain and may take a few moments.
              </p>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          isLoading={isLoading}
          isDisabled={!amount || !destinationAddress || parseFloat(amount) > balance || parseFloat(amount) <= 0 || isLoadingBalance}
          className="h-16 mt-4 bg-primary hover:bg-primary-600 w-full rounded-2xl font-bold text-white text-lg shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? "Processing Withdrawal..." : "Withdraw Funds"}
        </Button>
      </div>
    </div>
  );
}
