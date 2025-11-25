import { useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { useAptos } from "../../providers/AptosProvider";
import { sendAptosStealthPayment, getAptosClient } from "../../lib/aptos";
import toast from "react-hot-toast";

/**
 * Aptos Send Stealth Payment Component
 * Sends stealth payments on Aptos network
 */
export default function AptosSendPayment({ recipientAddress, recipientMetaIndex = 0 }) {
  const { account, isConnected } = useAptos();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [stealthAddress, setStealthAddress] = useState("");
  const [ephemeralPubKey, setEphemeralPubKey] = useState("");


  const handleSendPayment = async () => {
    if (!stealthAddress || !ephemeralPubKey || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      const amountOctas = parseFloat(amount) * 100000000; // Convert APT to octas

      const result = await sendAptosStealthPayment({
        accountAddress: account,
        recipientAddress: recipientAddress || account,
        recipientMetaIndex,
        amount: amountOctas,
        k: 0,
        ephemeralPubKey,
        stealthAddress,
        isTestnet: true,
      });

      toast.success("Payment sent successfully!", {
        duration: 5000,
      });
      
      if (result.explorerUrl) {
        toast.success(
          `View transaction: ${result.explorerUrl}`,
          { duration: 10000 }
        );
      }

      // Reset form
      setAmount("");
      setStealthAddress("");
      setEphemeralPubKey("");
    } catch (error) {
      toast.error("Failed to send payment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please connect your Aptos wallet first
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Send Stealth Payment</h2>

      <div className="flex flex-col gap-4">
        <Input
          label="Recipient Address"
          value={recipientAddress || account}
          disabled
          description="Aptos account address"
        />

        <Input
          label="Amount (APT)"
          type="number"
          placeholder="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          description="Amount in APT (will be converted to octas)"
        />

        <Input
          label="Stealth Address"
          placeholder="0x..."
          value={stealthAddress}
          onChange={(e) => setStealthAddress(e.target.value)}
          description="Generated stealth address (from offchain_helper.py)"
        />

        <Input
          label="Ephemeral Public Key"
          placeholder="0x..."
          value={ephemeralPubKey}
          onChange={(e) => setEphemeralPubKey(e.target.value)}
          description="Ephemeral public key (from offchain_helper.py)"
        />

        <Button
          color="primary"
          onClick={handleSendPayment}
          isLoading={isLoading}
          disabled={!stealthAddress || !ephemeralPubKey || !amount}
          className="w-full"
        >
          Send Stealth Payment
        </Button>

        <div className="text-xs text-gray-500 mt-2">
          <p>Note: Stealth address and ephemeral key should be generated using:</p>
          <code className="block mt-1 p-2 bg-gray-100 rounded">
            python scripts/offchain_helper.py
          </code>
        </div>
      </div>
    </div>
  );
}


