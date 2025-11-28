import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import { useAptos } from "../../providers/AptosProvider";
import { getUserBalance, withdrawFunds } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Icons } from "../shared/Icons";
import { useNavigate } from "react-router-dom";

export function AptosWithdraw() {
  const { account, isConnected, connect } = useAptos();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function loadBalance() {
      if (account) {
        const savedUsername = localStorage.getItem(`aptos_username_${account}`);
        const currentUsername = savedUsername || account.slice(2, 8);
        setUsername(currentUsername);

        const balanceData = await getUserBalance(currentUsername);
        setBalance(balanceData?.available_balance || 0);
      }
    }

    loadBalance();
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
      // Call withdrawal API
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationAddress,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      // Record withdrawal in Supabase
      await withdrawFunds(username, parseFloat(amount), destinationAddress, data.txHash);

      const shortHash = data.txHash.slice(0, 6) + "..." + data.txHash.slice(-4);
      
      toast.success(
        (t) => (
          <div 
            onClick={() => {
              window.open(data.explorerUrl, '_blank');
              toast.dismiss(t.id);
            }}
            className="cursor-pointer hover:underline"
          >
            Withdrawal successful! TX: {shortHash} (click to view)
          </div>
        ),
        { duration: 8000 }
      );

      // Trigger balance update
      window.dispatchEvent(new Event('balance-updated'));

      // Reset form
      setAmount("");
      setDestinationAddress("");

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Withdrawal error:", error);
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
    <div className="relative flex flex-col w-full max-w-md items-start justify-center bg-light-white rounded-[32px] p-4 md:p-6">
      <div className="relative flex gap-4 w-full items-center justify-center">
        <h1 className="absolute text-[#161618] font-bold">Withdraw Funds</h1>
        <button
          onClick={handleBack}
          className="relative flex w-fit mr-auto items-center justify-center bg-white rounded-full size-11"
        >
          <Icons.back className="text-black size-6" />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full mt-12">
        {/* Available Balance */}
        <div className="bg-primary-50 rounded-2xl p-4 border border-primary-200">
          <p className="text-xs text-gray-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-primary">{balance.toFixed(4)} APT</p>
          <p className="text-xs text-gray-500 mt-1">From treasury wallet</p>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <h1 className="text-sm text-[#A1A1A3]">Amount (APT)</h1>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              classNames={{
                input: "rounded-full",
                inputWrapper: "rounded-full h-16",
              }}
            />
            <Button
              onClick={() => setAmount(balance.toString())}
              className="h-16 px-6 rounded-full bg-primary-50 text-primary font-medium"
            >
              Max
            </Button>
          </div>
          {amount && parseFloat(amount) > balance && (
            <p className="text-red-500 text-sm">Insufficient balance</p>
          )}
        </div>

        {/* Destination Address */}
        <div className="flex flex-col gap-2">
          <h1 className="text-sm text-[#A1A1A3]">Destination Address</h1>
          <Input
            placeholder="0x..."
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            classNames={{
              input: "rounded-full",
              inputWrapper: "rounded-full h-16",
            }}
          />
          <Button
            size="sm"
            variant="light"
            onClick={() => setDestinationAddress(account)}
            className="w-fit rounded-full"
          >
            Use my wallet
          </Button>
        </div>

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          isLoading={isLoading}
          isDisabled={!amount || !destinationAddress || parseFloat(amount) > balance}
          className="h-16 mt-8 bg-primary w-full rounded-[42px] font-bold text-white"
        >
          {isLoading ? "Processing..." : "Withdraw Funds"}
        </Button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Funds will be sent from the treasury wallet to your specified address. 
            This may take a few moments to process.
          </p>
        </div>
      </div>
    </div>
  );
}
