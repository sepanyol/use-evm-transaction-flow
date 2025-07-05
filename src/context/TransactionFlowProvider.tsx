import { createContext, useContext, useEffect, useState } from "react";
import { WagmiContext } from "wagmi";
import { useEvmClients } from "../hooks/useEvmClients";
import type {
  TransactionFlowContextValue,
  TransactionStep,
} from "../types/transaction";

const TransactionFlowContext = createContext<
  TransactionFlowContextValue | undefined
>(undefined);

export const TransactionFlowProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [step, setStep] = useState<TransactionStep>("idle");
  const [error, setError] = useState<string | undefined>(undefined);

  const wagmiContext = useContext(WagmiContext);
  // Runtime safety check: Is Wagmi context available?
  useEffect(() => {
    console.log(
      Date.now(),
      "[TransactionFlowProvider] useEffect",
      wagmiContext?.state
    );
    if (!wagmiContext)
      console.warn(
        "[TransactionFlowProvider] No <WagmiConfig> found. Assuming RainbowKit or AppKit is providing the client."
      );
  }, [wagmiContext]);

  console.log(Date.now(), "[TransactionFlowProvider]", wagmiContext?.state);

  const { walletClient, isConnected } = useEvmClients();

  const walletClientReady = Boolean(walletClient);

  const contextValue: TransactionFlowContextValue = {
    step,
    isConnected,
    walletClientReady,
    error,
    setStep,
    setError,
  };

  return (
    <TransactionFlowContext.Provider value={contextValue}>
      {children}
    </TransactionFlowContext.Provider>
  );
};

// Custom hook to access context
export const useTransactionFlow = (): TransactionFlowContextValue => {
  const context = useContext(TransactionFlowContext);
  if (!context) {
    throw new Error(
      "useTransactionFlow must be used within a <TransactionFlowProvider>"
    );
  }
  return context;
};
