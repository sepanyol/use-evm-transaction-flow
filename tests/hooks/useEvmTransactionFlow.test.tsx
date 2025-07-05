import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WagmiProvider } from "wagmi";
import { TransactionFlowProvider } from "../../src/context/TransactionFlowProvider";
import { useEvmTransactionFlow } from "../../src/hooks/useEvmTransactionFlow";
import { wagmiTestConfig } from "../utils/setupWagmiClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("./../../src/utils/checkAllowance", () => ({
  checkAllowance: vi.fn(),
}));

vi.mock("./../../src/utils/approve", () => ({
  approve: vi.fn(),
}));

vi.mock("./../../src/utils/confirmTransaction", () => ({
  confirmTransaction: vi.fn(),
}));

import { approve as mockApprove } from "./../../src/utils/approve";
import { checkAllowance as mockCheckAllowance } from "./../../src/utils/checkAllowance";
import { confirmTransaction as mockConfirm } from "./../../src/utils/confirmTransaction";
import { connect, disconnect } from "@wagmi/core";

const testQueryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={wagmiTestConfig}>
    <QueryClientProvider client={testQueryClient}>
      <TransactionFlowProvider>{children}</TransactionFlowProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

const connector = wagmiTestConfig.connectors[0];

describe("useEvmTransactionFlow()", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    if (wagmiTestConfig.state.current === connector.uid)
      await disconnect(wagmiTestConfig, { connector });
  });

  afterEach(() => {
    testQueryClient.clear();
  });

  it("should initialize with idle step", async () => {
    const { result } = renderHook(
      () =>
        useEvmTransactionFlow({
          tokenType: "ERC20",
          contractAddress: "0xToken",
          spender: "0xSpender",
          amount: 100n,
          execute: vi.fn(),
        }),
      { wrapper }
    );

    expect(result.current.step).toBe("idle");
    expect(result.current.isIdle).toBe(true);
  });

  it.only("completes a full flow with mock connector", async () => {
    const executeMock = vi.fn().mockResolvedValue("0xExecutedTx");

    const { result } = renderHook(
      () =>
        useEvmTransactionFlow({
          tokenType: "ERC20",
          contractAddress: "0xToken",
          spender: "0xSpender",
          amount: 100n,
          execute: executeMock,
        }),
      { wrapper }
    );

    expect(result.current.step).toBe("idle");
    expect(result.current.isIdle).toBe(true);

    await act(async () => {
      // await connect(wagmiTestConfig, { connector });
      await result.current.run();
    });

    expect(result.current.step).toBe("success");
  });

  it("should complete full flow successfully", async () => {
    mockCheckAllowance.mockResolvedValueOnce(false);
    mockApprove.mockResolvedValueOnce("0xApproved");
    mockConfirm.mockResolvedValueOnce(undefined);

    const executeMock = vi.fn().mockResolvedValue("0xExecuted");

    const { result } = renderHook(
      () =>
        useEvmTransactionFlow({
          tokenType: "ERC20",
          contractAddress: "0xToken",
          spender: "0xSpender",
          amount: 100n,
          execute: executeMock,
        }),
      { wrapper }
    );

    await act(async () => {
      const connector = wagmiTestConfig.connectors.find((c) => c.id === "mock");
      await connector?.connect?.();
      await result.current.run();
    });

    expect(result.current.step).toBe("success");
    // expect(mockCheckAllowance).toHaveBeenCalled();
    // expect(mockApprove).toHaveBeenCalled();
    // expect(executeMock).toHaveBeenCalled();
    // expect(mockConfirm).toHaveBeenCalled();
  });

  it("should stop flow and throw if approve fails", async () => {
    mockCheckAllowance.mockResolvedValueOnce(false);
    mockApprove.mockRejectedValueOnce(new Error("Approval error"));

    const executeMock = vi.fn();

    const { result } = renderHook(
      () =>
        useEvmTransactionFlow({
          tokenType: "ERC20",
          contractAddress: "0xToken",
          spender: "0xSpender",
          amount: 100n,
          execute: executeMock,
        }),
      { wrapper }
    );

    await act(async () => {
      await expect(result.current.run()).rejects.toThrow("Approval error");
    });

    expect(result.current.step).toBe("error");
    expect(result.current.error).toBe("Approval error");
    expect(mockApprove).toHaveBeenCalled();
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("should stop flow and throw if confirmTransaction fails", async () => {
    mockCheckAllowance.mockResolvedValueOnce(true);
    mockApprove.mockResolvedValueOnce("0xApproved");
    mockConfirm.mockRejectedValueOnce(new Error("Confirm error"));

    const executeMock = vi.fn().mockResolvedValue("0xExecuted");

    const { result } = renderHook(
      () =>
        useEvmTransactionFlow({
          tokenType: "ERC20",
          contractAddress: "0xToken",
          spender: "0xSpender",
          amount: 100n,
          execute: executeMock,
        }),
      { wrapper }
    );

    await act(async () => {
      await expect(result.current.run()).rejects.toThrow("Confirm error");
    });

    expect(result.current.step).toBe("error");
    expect(result.current.error).toBe("Confirm error");
    expect(mockConfirm).toHaveBeenCalled();
  });
});
