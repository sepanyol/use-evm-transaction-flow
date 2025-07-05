// tests/utils/approve.test.ts
import { describe, expect, it, vi } from "vitest";
import { StableWalletClient } from "../../src/hooks/useEvmClients";
import { approve } from "../../src/utils/approve";

const address = "0x000000000000000000000000000000000000dEaD" as const;
const writeContract = vi.fn();
const mockClient: StableWalletClient = {
  writeContract,
} as unknown as StableWalletClient;

describe("approve()", () => {
  describe("happy", () => {
    it("should call writeContract for ERC20", async () => {
      writeContract.mockResolvedValueOnce("0x123");

      const txHash = await approve({
        tokenType: "ERC20",
        contractAddress: "0xToken",
        spender: "0xSpender",
        amount: 100n,
        walletClient: mockClient,
        account: "0xAccount",
      });

      expect(txHash).toBe("0x123");
      expect(writeContract).toHaveBeenCalled();
    });

    it("calls writeContract for ERC721", async () => {
      writeContract.mockResolvedValueOnce("0xtxhash");

      const tx = await approve({
        tokenType: "ERC721",
        contractAddress: address,
        spender: address,
        walletClient: mockClient,
        account: address,
      });

      expect(tx).toBe("0xtxhash");
      expect(writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          functionName: "setApprovalForAll",
          args: [address, true],
        })
      );
    });

    it("calls writeContract for ERC1155", async () => {
      writeContract.mockResolvedValueOnce("0xtxhash1155");

      const tx = await approve({
        tokenType: "ERC1155",
        contractAddress: address,
        spender: address,
        walletClient: mockClient,
        account: address,
      });

      expect(tx).toBe("0xtxhash1155");
      expect(writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          abi: expect.any(Array),
          functionName: "setApprovalForAll",
          args: [address, true],
        })
      );
    });
  });

  describe("unhappy", () => {
    it("throws if walletClient is missing", async () => {
      await expect(
        approve({
          tokenType: "ERC20",
          contractAddress: address,
          spender: address,
          amount: 100n,
          account: address,
          walletClient: undefined,
        })
      ).rejects.toThrow("Missing wallet or wallet client");
    });

    it("throws if account is missing", async () => {
      await expect(
        approve({
          tokenType: "ERC20",
          contractAddress: address,
          spender: address,
          amount: 100n,
          walletClient: mockClient,
        })
      ).rejects.toThrow("Missing wallet or wallet client");
    });

    it("throws if amount is missing for ERC20", async () => {
      await expect(
        approve({
          tokenType: "ERC20",
          contractAddress: address,
          spender: address,
          walletClient: mockClient,
          account: address,
        })
      ).rejects.toThrow("Amount is required for ERC20 approval");
    });

    it("throws if token type is NATIVE", async () => {
      await expect(
        approve({
          tokenType: "NATIVE",
          contractAddress: address,
          spender: address,
          walletClient: mockClient,
          account: address,
        })
      ).rejects.toThrow("NATIVE does not require approval");
    });

    it("throws if token type is unsupported", async () => {
      await expect(
        approve({
          // @ts-expect-error: invalid token type on purpose
          tokenType: "INVALID",
          contractAddress: address,
          spender: address,
          walletClient: mockClient,
          account: address,
        })
      ).rejects.toThrow("Unsupported token type: INVALID");
    });
  });
});
