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
