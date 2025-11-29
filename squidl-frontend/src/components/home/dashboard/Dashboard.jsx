import { useEffect, useState } from "react";
import { cnm } from "../../../utils/style";
import { Button, Skeleton, Spinner } from "@nextui-org/react";
import QrCodeIcon from "../../../assets/icons/qr-code.svg?react";
import CopyIcon from "../../../assets/icons/copy.svg?react";
import { motion } from "framer-motion";
import QrDialog from "../../dialogs/QrDialog.jsx";
import PaymentLinksDashboard from "./PaymentLinksDashboard.jsx";
import toast from "react-hot-toast";
import { Icons } from "../../shared/Icons.jsx";
import { useNavigate } from "react-router-dom";
import { useAptos } from "../../../providers/AptosProvider.jsx";
import { getUserBalance, registerUser } from "../../../lib/supabase.js";
import PhotonWalletDisplay from "../../shared/PhotonWalletDisplay.jsx";

export default function Dashboard() {
  const [openQr, setOpenQr] = useState(false);
  const { account } = useAptos();
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    async function loadBalance() {
      if (account) {
        const username = localStorage.getItem(`aptos_username_${account}`) || account.slice(2, 8);
        
        // Register user if not exists
        try {
          await registerUser(account, username);
        } catch (error) {
          console.error('Error registering user:', error);
        }

        // Get balance
        const balanceData = await getUserBalance(username);
        setBalance(balanceData?.available_balance || 0);
        setIsLoadingBalance(false);
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

  return (
    <>
      <QrDialog open={openQr} setOpen={setOpenQr} />

      <motion.div
        layoutScroll
        className="w-full h-screen flex flex-col items-center overflow-y-auto"
      >
        <div className="flex flex-col items-center py-20 w-full">
          <div className="w-full max-w-lg flex flex-col items-center gap-4 pt-12 pb-20">
            <ReceiveCard setOpenQr={setOpenQr} />
            <BalanceCard balance={balance} isLoading={isLoadingBalance} />
            <PhotonWalletDisplay />
            <PaymentLinksDashboard />
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ReceiveCard({ setOpenQr, user, isLoading }) {
  const { account, isConnected } = useAptos();
  const [mode, setMode] = useState("username");
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // Load username from localStorage
  useEffect(() => {
    if (account) {
      const savedUsername = localStorage.getItem(`aptos_username_${account}`);
      if (savedUsername) {
        setUsername(savedUsername);
      } else {
        // Generate default username from address
        const defaultUsername = account.slice(2, 8);
        setUsername(defaultUsername);
      }
    }
  }, [account]);

  const handleSaveUsername = () => {
    if (username && account) {
      localStorage.setItem(`aptos_username_${account}`, username);
      setIsEditingUsername(false);
      toast.success("Username saved!", {
        duration: 1000,
        position: "bottom-center",
      });
    }
  };

  const onCopy = () => {
    let copyText;
    if (mode === "username" && username) {
      copyText = `${username}.privatepay.me`;
    } else if (account) {
      copyText = account;
    } else {
      toast.error("Address not available", {
        duration: 1000,
        position: "bottom-center",
      });
      return;
    }

    navigator.clipboard.writeText(copyText);
    toast.success("Copied to clipboard", {
      duration: 1000,
      position: "bottom-center",
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-primary-600 p-4 rounded-3xl text-white w-full">
        <div className="w-full flex items-center justify-between">
          <p className="text-xl">Receive</p>
        </div>
        <div className="bg-white rounded-full w-full h-14 mt-4 flex items-center justify-center text-gray-500">
          Connect wallet to receive payments
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-600 p-4 rounded-3xl text-white w-full">
      <div className="w-full flex items-center justify-between">
        <p className="text-xl">Receive</p>
        <div className="bg-white rounded-full flex relative items-center font-medium px-1 py-1">
          <div
            className={cnm(
              "w-28 h-10 bg-primary-500 absolute left-1 rounded-full transition-transform ease-in-out",
              mode === "username" ? "translate-x-0" : "translate-x-full"
            )}
          ></div>
          <button
            onClick={() => setMode("username")}
            className={cnm(
              "w-28 h-10 rounded-full flex items-center justify-center relative transition-colors text-xs",
              mode === "username" ? "text-white" : "text-primary"
            )}
          >
            Username
          </button>
          <button
            onClick={() => setMode("address")}
            className={cnm(
              "w-28 h-8 rounded-full flex items-center justify-center relative transition-colors text-xs",
              mode === "address" ? "text-white" : "text-primary"
            )}
          >
            Address
          </button>
        </div>
      </div>
      
      {isEditingUsername ? (
        <div className="bg-white rounded-full w-full h-14 mt-4 flex items-center justify-between pl-4 pr-2 text-black">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            placeholder="username"
            className="flex-1 bg-transparent outline-none text-sm"
            maxLength={20}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveUsername}
              className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditingUsername(false)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-full w-full h-14 mt-4 flex items-center justify-between pl-6 pr-2 text-black">
          {mode === "address" ? (
            <p className="text-sm">
              {account?.slice(0, 10)}...{account?.slice(-8)}
            </p>
          ) : (
            <p className="text-sm">{username}.privatepay.me</p>
          )}
          <div className="flex items-center gap-2">
            {mode === "username" && (
              <button
                onClick={() => setIsEditingUsername(true)}
                className="bg-primary-50 size-9 rounded-full flex items-center justify-center"
              >
                <Icons.edit className="text-primary size-4" />
              </button>
            )}
            <button
              onClick={() => setOpenQr(true)}
              className="bg-primary-50 size-9 rounded-full flex items-center justify-center"
            >
              <QrCodeIcon className="size-5" />
            </button>
            <button
              onClick={onCopy}
              className="bg-primary-50 size-9 rounded-full flex items-center justify-center"
            >
              <CopyIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceCard({ balance, isLoading }) {
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-3xl bg-neutral-50 overflow-hidden">
      <div className="w-full flex items-center justify-between px-6 py-6">
        <p className="font-medium text-xl">Available Balance</p>
      </div>
      
      <div className="w-full px-6 pb-6">
        {isLoading ? (
          <Skeleton className="w-32 h-12 rounded-lg" />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-4xl font-semibold text-primary">
              {balance.toFixed(4)} APT
            </p>
            <p className="text-sm text-gray-500">
              Held in treasury wallet
            </p>
          </div>
        )}

        <div className="mt-6 w-full flex flex-col items-center gap-2">
          <Button
            onClick={() => navigate("/send")}
            className="w-full rounded-full h-14 bg-primary text-white font-semibold"
          >
            Send Payment
          </Button>
          <div className="w-full flex items-center gap-2">
            <Button
              onClick={() => navigate("/transfer")}
              className="flex-1 rounded-full h-12 bg-primary-50 text-primary"
            >
              Withdraw
            </Button>
            <Button
              onClick={() => navigate("/transactions")}
              className="flex-1 rounded-full h-12 bg-primary-50 text-primary"
            >
              History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
