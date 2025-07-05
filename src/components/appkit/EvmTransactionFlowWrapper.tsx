import "@rainbow-me/rainbowkit/styles.css";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import {
  BaseError,
  ContractFunctionRevertedError,
  formatUnits,
  parseEther,
  type Abi,
} from "viem";
import wrapperAbi from "../../abi/wrapper.json";
import { useEvmClients } from "../../hooks/useEvmClients";
import { useEvmTransactionFlow } from "../../hooks/useEvmTransactionFlow";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const EvmTransactionFlowWrapper = () => {
  const { account, isConnected, walletClient, publicClient } = useEvmClients();

  const { data: balanceWrapper, refetch: refetchBalanceWrapper } = useQuery({
    queryKey: ["balance", account],
    queryFn: async () =>
      await publicClient?.readContract({
        address: WETH,
        abi: wrapperAbi,
        functionName: "balanceOf",
        args: [account],
      }),
    select: (res: any) => BigInt(res),
  });

  const { data: balanceNative, refetch: refetchBalanceNative } = useQuery({
    queryKey: ["balance", "native", account],
    queryFn: async () => await publicClient?.getBalance({ address: account! }),
    select: (res: any) => BigInt(res),
  });

  const txflow = useEvmTransactionFlow({
    tokenAddress: WETH,
    contractAddress: WETH,
    abi: wrapperAbi as Abi,
    functionName: "withdraw",
    args: [BigInt(balanceWrapper || 0)],
    tokenType: "ERC20",
    spender: WETH,
    amount: BigInt(balanceWrapper || 0),
  });

  const handleDeposit = useCallback(() => {
    if (!walletClient || !account || !publicClient) {
      console.error("walletClient | account | publicClient not existing");
      return;
    }

    try {
      publicClient
        .simulateContract({
          account,
          abi: wrapperAbi,
          functionName: "deposit",
          address: WETH,
          value: parseEther("10"),
        })
        .then(async ({ request }) => walletClient.writeContract(request))
        .then(async (hash) => {
          const receipe = await publicClient.waitForTransactionReceipt({
            hash,
            timeout: 60000,
            retryCount: 10,
          });
          return receipe;
        })
        .then(() => {
          refetchBalanceWrapper();
          refetchBalanceNative();
        });
    } catch (err) {
      if (err instanceof BaseError) {
        const revertError = err.walk(
          (err) => err instanceof ContractFunctionRevertedError
        );
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? "";
          console.log({ errorName });
        }
      }
    }
  }, [walletClient, publicClient]);

  const handleWithdraw = useCallback(() => {
    if (!txflow) {
      console.error("no run possible");
      return;
    }
    txflow.run();
  }, [txflow]);

  useEffect(() => {
    if (txflow.isSuccess) {
      refetchBalanceWrapper();
      refetchBalanceNative();
    }
  }, [txflow.isSuccess]);

  return (
    <>
      <appkit-button />
      {isConnected && (
        <>
          ETH Balance:{balanceNative ? formatUnits(balanceNative, 18) : 0}
          <br />
          WETH Balance: {balanceWrapper ? formatUnits(balanceWrapper, 18) : 0}
          <br />
          <button onClick={handleDeposit}>Wrap ETH</button>
          {Boolean(balanceWrapper && balanceWrapper > 0n) && (
            <>
              <br />
              <button onClick={handleWithdraw}>
                Unwrap {balanceWrapper ? formatUnits(balanceWrapper, 18) : "0"}{" "}
                WETH
              </button>
              {!txflow.isIdle && (
                <>
                  {" "}
                  <br />
                  {txflow.isCheckingAllowance && <span>Needs approval</span>}
                  {(txflow.isPendingApprove || txflow.isWaitingForApproval) && (
                    <span>Wait for approval...</span>
                  )}
                  {txflow.isWaitingForApprovalTxConfirmation && (
                    <span>Wait for approval tx to settle...</span>
                  )}
                  {(txflow.isExecuting || txflow.isPendingExecuting) && (
                    <span>Wait for execution...</span>
                  )}
                  {txflow.isWaitingForApprovalTxConfirmation && (
                    <span>Wait for execution tx to settle...</span>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
