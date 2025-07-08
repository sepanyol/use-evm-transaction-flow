import type { PublicClient } from "viem";

export async function confirmTransaction(
  txHash: `0x${string}`,
  confirmations: number,
  publicClient: PublicClient
): Promise<void> {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations,
      retryCount: 5,
      retryDelay: 2000,
    });

    if (receipt.status === "reverted") throw new Error(`Transaction reverted`);

    return;
  } catch (err: any) {
    throw new Error(`Transaction confirmation failed: ${err.message || err}`);
  }
}
