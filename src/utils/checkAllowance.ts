import { erc1155Abi, erc20Abi, erc721Abi, type Address } from "viem";
import { isAddressEqual } from "viem/utils";
import { type UsePublicClientReturnType } from "wagmi";
import type { TokenType } from "../types/transaction";

interface CheckAllowanceParams {
  tokenType: TokenType;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  tokenId?: bigint;
  amount?: bigint;
  publicClient: UsePublicClientReturnType;
  account: Address | undefined;
}

export async function checkAllowance({
  tokenType,
  tokenAddress,
  spender,
  tokenId,
  amount,
  publicClient,
  account,
}: CheckAllowanceParams): Promise<boolean> {
  if (!account || !publicClient)
    throw new Error("Missing wallet or public client");

  switch (tokenType) {
    case "ERC20": {
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account, spender],
      });
      return allowance >= (amount || 0n);
    }

    case "ERC721": {
      if (!tokenId) throw new Error("Missing tokenId for ERC721");
      const [approved, isOperator] = await Promise.all([
        publicClient.readContract({
          address: tokenAddress,
          abi: erc721Abi,
          functionName: "getApproved",
          args: [tokenId],
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc721Abi,
          functionName: "isApprovedForAll",
          args: [account, spender],
        }),
      ]);

      return isOperator || isAddressEqual(approved as Address, spender);
    }

    case "ERC1155": {
      const isApproved = await publicClient.readContract({
        address: tokenAddress,
        abi: erc1155Abi,
        functionName: "isApprovedForAll",
        args: [account, spender],
      });
      return !!isApproved;
    }

    case "NATIVE":
      return true; // No allowance needed

    default:
      throw new Error(`Unsupported token type: ${tokenType}`);
  }
}
