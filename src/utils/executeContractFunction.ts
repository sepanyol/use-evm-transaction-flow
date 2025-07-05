import { type Abi, type Address, type PublicClient } from "viem";
import type { StableWalletClient } from "../hooks/useEvmClients";

interface ExecuteContractFunctionParams {
  publicClient?: PublicClient;
  walletClient?: StableWalletClient;
  contractAddress: Address;
  abi: Abi;
  functionName: string;
  args: unknown[];
  account: Address;
  value?: bigint;
}

export async function executeContractFunction({
  publicClient,
  walletClient,
  contractAddress,
  abi,
  functionName,
  args,
  account,
  value,
}: ExecuteContractFunctionParams): Promise<`0x${string}`> {
  if (!walletClient || !publicClient)
    throw new Error("Wallet or Public client not available");

  try {
    const simulate = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName,
      args,
      account,
      value,
    });

    return walletClient.writeContract(simulate.request);
  } catch (e) {
    console.error(e);
    throw new Error("Execution error");
  }
}
