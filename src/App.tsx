import "./App.css";
import { EvmTransactionFlowWrapper as AppKitEvmTransactionFlowWrapper } from "./components/appkit/EvmTransactionFlowWrapper";
import { Web3AppKitProvider } from "./components/appkit/Web3AppKitProvider";
import { EvmTransactionFlowWrapper as ConnectKitEvmTransactionFlowWrapper } from "./components/connectkit/EvmTransactionFlowWrapper";
import { Web3ConnectKitProvider } from "./components/connectkit/Web3ConnectKitProvider";
import { EvmTransactionFlowWrapper as RainbowKitEvmTransactionFlowWrapper } from "./components/rainbowkit/EvmTransactionFlowWrapper";
import { Web3RainbowKitProvider } from "./components/rainbowkit/Web3RainbowKitProvider";
import { TransactionFlowProvider } from "./context/TransactionFlowProvider";

function App() {
  return (
    <>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <div style={{ marginBottom: "10px" }}>ConnectKit</div>
          <Web3ConnectKitProvider>
            <TransactionFlowProvider>
              <ConnectKitEvmTransactionFlowWrapper />
            </TransactionFlowProvider>
          </Web3ConnectKitProvider>
        </div>
        <div>
          <div style={{ marginBottom: "10px" }}>AppKit</div>
          <Web3AppKitProvider>
            <TransactionFlowProvider>
              <AppKitEvmTransactionFlowWrapper />
            </TransactionFlowProvider>
          </Web3AppKitProvider>
        </div>
        <div>
          <div style={{ marginBottom: "10px" }}>RainbowKit</div>
          <Web3RainbowKitProvider>
            <TransactionFlowProvider>
              <RainbowKitEvmTransactionFlowWrapper />
            </TransactionFlowProvider>
          </Web3RainbowKitProvider>
        </div>
      </div>
    </>
  );
}

export default App;
