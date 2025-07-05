// tests/utils/confirmTransaction.test.ts
import { describe, expect, it, vi } from "vitest";
import { confirmTransaction } from "./../../src/utils/confirmTransaction";

const txHash = "0xabc" as const;

describe("confirmTransaction()", () => {
  it("resolves if transaction is successful with 1 confirmation", async () => {
    const mockClient = {
      waitForTransactionReceipt: vi.fn().mockResolvedValue({
        status: "success",
        blockNumber: 100n,
      }),
    };

    await expect(
      confirmTransaction(txHash, 1, mockClient as any)
    ).resolves.toBeUndefined();

    expect(mockClient.waitForTransactionReceipt).toHaveBeenCalledWith({
      hash: txHash,
      confirmations: 1,
    });
  });

  it("resolves after waiting for multiple confirmations", async () => {
    const mockClient = {
      waitForTransactionReceipt: vi.fn().mockResolvedValue({
        status: "success",
        blockNumber: 100n,
      }),
      getBlockNumber: vi
        .fn()
        .mockResolvedValueOnce(100n)
        .mockResolvedValueOnce(101n)
        .mockResolvedValueOnce(102n),
    };

    const sleep = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation((cb: any) => {
        cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });

    await expect(
      confirmTransaction(txHash, 3, mockClient as any)
    ).resolves.toBeUndefined();

    expect(mockClient.getBlockNumber).toHaveBeenCalledTimes(3);
    sleep.mockRestore();
  });

  it("throws if transaction was reverted", async () => {
    const mockClient = {
      waitForTransactionReceipt: vi.fn().mockResolvedValue({
        status: "reverted",
        blockNumber: 100n,
      }),
    };

    await expect(
      confirmTransaction(txHash, 1, mockClient as any)
    ).rejects.toThrow("Transaction reverted");
  });

  it("throws if waitForTransactionReceipt throws", async () => {
    const mockClient = {
      waitForTransactionReceipt: vi
        .fn()
        .mockRejectedValue(new Error("RPC failed")),
    };

    await expect(
      confirmTransaction(txHash, 1, mockClient as any)
    ).rejects.toThrow("Transaction confirmation failed: RPC failed");
  });

  it("throws if getBlockNumber throws", async () => {
    const mockClient = {
      waitForTransactionReceipt: vi.fn().mockResolvedValue({
        status: "success",
        blockNumber: 100n,
      }),
      getBlockNumber: vi.fn().mockRejectedValue(new Error("Block error")),
    };

    await expect(
      confirmTransaction(txHash, 2, mockClient as any)
    ).rejects.toThrow("Transaction confirmation failed: Block error");
  });
});
