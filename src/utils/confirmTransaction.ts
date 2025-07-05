import type { PublicClient } from "viem";

export async function confirmTransaction(
  txHash: `0x${string}`,
  confirmations: number,
  publicClient: PublicClient
): Promise<void> {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    if (receipt.status === "reverted") throw new Error(`Transaction reverted`);

    if (confirmations > 1) {
      const txBlock = receipt.blockNumber;
      let currentBlock = txBlock;

      while (currentBlock - txBlock < BigInt(confirmations - 1)) {
        await new Promise((res) => setTimeout(res, 3000)); // wait 3s
        currentBlock = await publicClient.getBlockNumber();
      }
    }

    // All good
    return;
  } catch (err: any) {
    throw new Error(`Transaction confirmation failed: ${err.message || err}`);
  }
}
