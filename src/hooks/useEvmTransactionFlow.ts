import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type Abi, type Address } from "viem";
import type { TokenType, TransactionStep } from "../types/transaction";
import { approve } from "../utils/approve";
import { checkAllowance } from "../utils/checkAllowance";
import { confirmTransaction } from "../utils/confirmTransaction";
import { executeContractFunction } from "../utils/executeContractFunction";
import { useEvmClients } from "./useEvmClients";

interface UseEvmTransactionFlowParams {
  tokenType: TokenType;
  tokenAddress: Address; // Target contract address
  spender?: Address; // Optional: Who will spend tokens (if approval needed)
  tokenId?: bigint; // For ERC721/ERC1155
  amount?: bigint; // For ERC20/ERC1155
  confirmations?: number; // Defaults to 1
  requireExplicitApproval?: boolean; // set true if you want to force approval
  contractAddress: Address; // address that should be called to execute `functionName`
  abi: Abi; // see viem documentation
  functionName: string; // see viem documentation
  args: unknown[]; // see viem documentation
}

export const useEvmTransactionFlow = ({
  tokenType,
  tokenAddress,
  spender,
  tokenId,
  amount,
  confirmations = 1,
  requireExplicitApproval = false,
  contractAddress,
  abi,
  functionName,
  args,
}: UseEvmTransactionFlowParams) => {
  const [step, setStep] = useState<TransactionStep>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [approveHash, setApproveHash] = useState<Address | undefined>(
    undefined
  );
  const [executeHash, setExecuteHash] = useState<Address | undefined>(
    undefined
  );
  const { publicClient, walletClient, account } = useEvmClients();

  // --- Step 1: Check allowance (for ERC20/721/1155) ---
  const {
    data: isAllowanceSufficient,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useQuery({
    enabled: walletClient && !!spender && !!amount && tokenType !== "NATIVE",
    queryKey: [
      "checkAllowance",
      tokenType,
      tokenAddress,
      spender,
      tokenId?.toString(),
      amount?.toString(),
    ],
    queryFn: async () => {
      setStep("checkingAllowance");
      const allowed = await checkAllowance({
        tokenType,
        tokenAddress,
        account,
        publicClient,
        spender: spender!,
        tokenId,
        amount,
      });

      if (requireExplicitApproval || allowed) setStep("ready");

      return allowed;
    },
  });

  // --- Step 2: Approve if needed ---
  const {
    mutateAsync: triggerApproval,
    isPending: isPendingApprove,
    reset: resetApproval,
  } = useMutation({
    mutationFn: async () => {
      setStep("waitingForApproval");
      const txHash = await approve({
        tokenType,
        tokenAddress,
        walletClient,
        account: account,
        spender: spender!,
        amount,
      });

      setApproveHash(txHash);

      setStep("waitingForApprovalTxConfirmation");
      await confirmTransaction(txHash, confirmations, publicClient!);

      return txHash;
    },
  });

  // --- Step 3: Send main transaction ---
  const nativeValue = tokenType === "NATIVE" ? amount : undefined;
  const {
    mutateAsync: sendTx,
    isPending: isPendingExecuting,
    reset: resetExecute,
  } = useMutation({
    mutationFn: async () => {
      setStep("executing");
      const txHash = await executeContractFunction({
        publicClient,
        walletClient,
        contractAddress,
        abi,
        functionName,
        args,
        account: account!,
        value: nativeValue,
      });

      setExecuteHash(txHash);

      setStep("waitingForExecutionTxConfirmation");

      await confirmTransaction(txHash, confirmations, publicClient!);

      setStep("success");

      return txHash;
    },
  });

  // --- Main run method ---
  const run = async () => {
    try {
      setError(undefined);

      if (!Boolean(walletClient)) throw new Error("Wallet client not ready");

      if (tokenType !== "NATIVE") {
        if (!spender || !amount)
          throw new Error("Spender and amount required for tokens");

        if (
          requireExplicitApproval ||
          (!requireExplicitApproval && !isAllowanceSufficient)
        ) {
          await triggerApproval();
          await refetchAllowance();
        }
      }

      await sendTx();
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setStep("error");
      throw err;
    }
  };

  const reset = () => {
    setStep("idle");
    setError(undefined);
    setApproveHash(undefined);
    setExecuteHash(undefined);
    resetApproval();
    resetExecute();
  };

  return {
    run,
    step,
    error,
    reset,
    approveHash,
    executeHash,
    isIdle: step === "idle",
    isReadyToExecute: step === "ready",
    isCheckingAllowance: isLoadingAllowance || step === "checkingAllowance",
    isPendingApprove,
    isWaitingForApproval: step === "waitingForApproval",
    isWaitingForApprovalTxConfirmation:
      step === "waitingForApprovalTxConfirmation",
    isExecuting: step === "executing",
    isPendingExecuting,
    isWaitingForExecutionTxConfirmation:
      step === "waitingForExecutionTxConfirmation",
    isSuccess: step === "success",
    isError: step === "error",
    isReady: Boolean(walletClient),
  };
};
