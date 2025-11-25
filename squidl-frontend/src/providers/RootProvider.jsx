import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";
import Web3Provider from "./Web3Provider.jsx";
import AptosProvider from "./AptosProvider.jsx";
import { SWRConfig } from "swr";
import UserProvider from "./UserProvider.jsx";

export default function RootProvider({ children }) {
  const isTestnet = import.meta.env.VITE_APP_ENVIRONMENT === "dev";
  
  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        revalidateOnFocus: false,
      }}
    >
      <NextUIProvider>
        <DynamicProvider>
          <Web3Provider>
            <AptosProvider isTestnet={isTestnet}>
              <AuthProvider>
                <UserProvider>
                  {children}
                </UserProvider>
              </AuthProvider>
            </AptosProvider>
          </Web3Provider>
        </DynamicProvider>
      </NextUIProvider>
    </SWRConfig>
  );
}
