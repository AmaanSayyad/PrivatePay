import { useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { useAptos } from "../../providers/AptosProvider";
import { registerAptosMetaAddress } from "../../lib/aptos";
import toast from "react-hot-toast";

/**
 * Aptos Stealth Payment Component
 * Handles Aptos wallet connection and stealth payments
 */
export default function AptosPayment() {
  const { account, isConnected, connect, disconnect } = useAptos();
  const [isLoading, setIsLoading] = useState(false);
  const [spendPubKey, setSpendPubKey] = useState("");
  const [viewingPubKey, setViewingPubKey] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Aptos wallet connected!");
    } catch (error) {
      toast.error("Failed to connect Aptos wallet");
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Aptos wallet disconnected");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegisterMetaAddress = async () => {
    if (!spendPubKey || !viewingPubKey) {
      toast.error("Please provide both spend and viewing public keys");
      return;
    }

    setIsLoading(true);
    try {
      // Register on-chain (directly to Aptos blockchain)
      const result = await registerAptosMetaAddress({
        accountAddress: account,
        spendPubKey,
        viewingPubKey,
        isTestnet: true,
      });

      toast.success("Meta address registered!", {
        duration: 5000,
      });
      
      if (result.explorerUrl) {
        toast.success(
          `View transaction: ${result.explorerUrl}`,
          { duration: 10000 }
        );
      }
      
      setIsRegistered(true);
    } catch (error) {
      toast.error("Failed to register meta address");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Aptos Stealth Payment</h2>

      {/* Wallet Connection */}
      <div className="flex flex-col gap-2">
        {!isConnected ? (
          <Button
            color="primary"
            onClick={handleConnect}
            className="w-full"
          >
            Connect Aptos Wallet
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              Connected: {account?.slice(0, 10)}...{account?.slice(-8)}
            </div>
            <Button
              color="danger"
              variant="light"
              onClick={handleDisconnect}
              size="sm"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>

      {/* Meta Address Registration */}
      {isConnected && !isRegistered && (
        <div className="flex flex-col gap-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">Register Meta Address</h3>
          
          <Input
            label="Spend Public Key"
            placeholder="0x..."
            value={spendPubKey}
            onChange={(e) => setSpendPubKey(e.target.value)}
            description="33 bytes compressed secp256k1 public key"
          />
          
          <Input
            label="Viewing Public Key"
            placeholder="0x..."
            value={viewingPubKey}
            onChange={(e) => setViewingPubKey(e.target.value)}
            description="33 bytes compressed secp256k1 public key"
          />

          <Button
            color="primary"
            onClick={handleRegisterMetaAddress}
            isLoading={isLoading}
            disabled={!spendPubKey || !viewingPubKey}
          >
            Register Meta Address
          </Button>
        </div>
      )}

      {isRegistered && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">Meta address registered successfully!</p>
          <p className="text-sm text-green-600 mt-2">
            You can now receive stealth payments on Aptos.
          </p>
        </div>
      )}
    </div>
  );
}


