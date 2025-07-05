import { type Address, type WalletClient } from "viem";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  type UsePublicClientReturnType,
} from "wagmi";
import { type Chain } from "wagmi/chains";

export type StableWalletClient = WalletClient<any, Chain>;

export const useEvmClients = (): {
  walletClient: StableWalletClient | undefined;
  publicClient: UsePublicClientReturnType;
  account: Address | undefined;
  accounts: any;
  isConnected: boolean;
  isReady: boolean;
} => {
  const { data: walletClientRaw } = useWalletClient();
  const publicClient = usePublicClient();
  const { address: account, addresses: accounts, isConnected } = useAccount();

  const walletClient = walletClientRaw as StableWalletClient;
  const isReady = Boolean(walletClient && publicClient && account);

  return {
    walletClient,
    publicClient,
    account,
    accounts: accounts as typeof accounts,
    isConnected,
    isReady,
  };
};
