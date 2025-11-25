import AptosPayment from "../components/aptos/AptosPayment";
import AptosSendPayment from "../components/aptos/AptosSendPayment";
import { Tabs, Tab } from "@nextui-org/react";

export default function AptosPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center py-5 md:py-20 px-4 md:px-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Aptos Stealth Payments</h1>
        
        <Tabs aria-label="Aptos Options" className="w-full">
          <Tab key="receive" title="Receive Payments">
            <AptosPayment />
          </Tab>
          <Tab key="send" title="Send Payment">
            <AptosSendPayment />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

