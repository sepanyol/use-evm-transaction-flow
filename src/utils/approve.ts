import { type Address, erc1155Abi, erc20Abi, erc721Abi } from "viem"; // or your abi imports
import type { StableWalletClient } from "../hooks/useEvmClients";
import type { TokenType } from "../types/transaction";

interface ApproveParams {
  tokenType: TokenType;
  tokenAddress: Address;
  spender: Address;
  // tokenId?: bigint;
  amount?: bigint;
  walletClient?: StableWalletClient;
  account?: Address;
}

export async function approve({
  tokenType,
  tokenAddress,
  spender,
  // tokenId,
  amount,
  walletClient,
  account,
}: ApproveParams): Promise<`0x${string}`> {
  if (!account || !walletClient)
    throw new Error("Missing wallet or wallet client");

  switch (tokenType) {
    case "ERC20": {
      if (!amount) throw new Error("Amount is required for ERC20 approval");
      return walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
        account,
        chain: walletClient.chain,
      });
    }

    case "ERC721": {
      return walletClient.writeContract({
        address: tokenAddress,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [spender, true],
        account,
        chain: walletClient.chain,
      });
    }

    case "ERC1155": {
      return walletClient.writeContract({
        address: tokenAddress,
        abi: erc1155Abi,
        functionName: "setApprovalForAll",
        args: [spender, true],
        account,
        chain: walletClient.chain,
      });
    }

    case "NATIVE": {
      throw new Error("NATIVE does not require approval");
    }

    default:
      throw new Error(`Unsupported token type: ${tokenType}`);
  }
}
