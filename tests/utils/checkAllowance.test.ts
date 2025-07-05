// tests/utils/checkAllowance.test.ts
import { type Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAllowance } from "./../../src/utils/checkAllowance";

const address = "0x000000000000000000000000000000000000dEaD" as Address;
const spender = "0x000000000000000000000000000000000000bEEF" as Address;
const tokenId = 1n;

const mockReadContract = vi.fn();

const mockPublicClient = {
  readContract: mockReadContract,
} as any;

describe("checkAllowance()", () => {
  beforeEach(() => {
    mockReadContract.mockReset();
  });

  it("throws if account is missing", async () => {
    await expect(
      checkAllowance({
        tokenType: "ERC20",
        contractAddress: address,
        spender,
        amount: 100n,
        account: undefined,
        publicClient: mockPublicClient,
      })
    ).rejects.toThrow("Missing wallet or public client");
  });

  it("throws if publicClient is missing", async () => {
    await expect(
      checkAllowance({
        tokenType: "ERC20",
        contractAddress: address,
        spender,
        amount: 100n,
        account: address,
        publicClient: undefined as any,
      })
    ).rejects.toThrow("Missing wallet or public client");
  });

  it("returns true if ERC20 allowance >= amount", async () => {
    mockReadContract.mockResolvedValueOnce(200n);

    const result = await checkAllowance({
      tokenType: "ERC20",
      contractAddress: address,
      spender,
      amount: 100n,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(true);
  });

  it("returns false if ERC20 allowance < amount", async () => {
    mockReadContract.mockResolvedValueOnce(50n);

    const result = await checkAllowance({
      tokenType: "ERC20",
      contractAddress: address,
      spender,
      amount: 100n,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(false);
  });

  it("throws if tokenId is missing for ERC721", async () => {
    await expect(
      checkAllowance({
        tokenType: "ERC721",
        contractAddress: address,
        spender,
        account: address,
        publicClient: mockPublicClient,
      })
    ).rejects.toThrow("Missing tokenId for ERC721");
  });

  it("returns true if ERC721 getApproved === spender", async () => {
    mockReadContract
      .mockResolvedValueOnce(spender) // getApproved
      .mockResolvedValueOnce(false); // isApprovedForAll

    const result = await checkAllowance({
      tokenType: "ERC721",
      contractAddress: address,
      spender,
      tokenId,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(true);
  });

  it("returns true if ERC721 isApprovedForAll === true", async () => {
    mockReadContract
      .mockResolvedValueOnce(address) // getApproved
      .mockResolvedValueOnce(true); // isApprovedForAll

    const result = await checkAllowance({
      tokenType: "ERC721",
      contractAddress: address,
      spender,
      tokenId,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(true);
  });

  it("returns false if ERC721 neither approved nor operator", async () => {
    mockReadContract
      .mockResolvedValueOnce(address) // getApproved
      .mockResolvedValueOnce(false); // isApprovedForAll

    const result = await checkAllowance({
      tokenType: "ERC721",
      contractAddress: address,
      spender,
      tokenId,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(false);
  });

  it("returns true if ERC1155 isApprovedForAll is true", async () => {
    mockReadContract.mockResolvedValueOnce(true);

    const result = await checkAllowance({
      tokenType: "ERC1155",
      contractAddress: address,
      spender,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(true);
  });

  it("returns false if ERC1155 isApprovedForAll is false", async () => {
    mockReadContract.mockResolvedValueOnce(false);

    const result = await checkAllowance({
      tokenType: "ERC1155",
      contractAddress: address,
      spender,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(false);
  });

  it("returns true for NATIVE token type", async () => {
    const result = await checkAllowance({
      tokenType: "NATIVE",
      contractAddress: address,
      spender,
      account: address,
      publicClient: mockPublicClient,
    });

    expect(result).toBe(true);
  });

  it("throws for unsupported token type", async () => {
    await expect(
      checkAllowance({
        // @ts-expect-error invalid token type
        tokenType: "FOO",
        contractAddress: address,
        spender,
        account: address,
        publicClient: mockPublicClient,
      })
    ).rejects.toThrow("Unsupported token type: FOO");
  });
});
