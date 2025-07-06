import type { Address } from "viem";

export type TokenType = "ERC20" | "ERC721" | "ERC1155" | "NATIVE";

export type TransactionStep =
  | "idle"
  | "checkingAllowance"
  | "ready"
  | "waitingForApproval"
  | "waitingForApprovalTxConfirmation"
  | "executing"
  | "waitingForExecutionTxConfirmation"
  | "confirming"
  | "success"
  | "error";

export interface TransactionFlowContextValue {
  step: TransactionStep;
  isConnected: boolean;
  walletClientReady: boolean;
  error?: string;
  setStep: (step: TransactionStep) => void;
  setError: (err: string | undefined) => void;

  approveHash?: Address;
  setApproveHash: (hash: Address) => void;

  executeHash?: Address;
  setExecuteHash: (hash: Address) => void;
}
