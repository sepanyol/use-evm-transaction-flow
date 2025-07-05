# useEvmTransactionFlow

> 🧠 Smart, flexible transaction flow hook for EVM-based apps (React + Wagmi + Viem)

## Features

- ✅ Handles ERC20, ERC721, ERC1155 and ETH
- 🔁 Optional approval flow
- ✅ Transaction confirmation tracking
- 🧪 Simulates contract calls before execution
- 🔗 Viem, Wagmi, TanStack Query native
- 💡 Built for composability and clarity
- 💪 Works with:
  - ConnectKit (https://family.co/docs/connectkit)
  - RainbowKit (https://rainbowkit.com/de/docs/introduction)
  - AppKit (https://docs.reown.com/appkit/overview)

## Installation

```bash
npm install @s3panyol/use-evm-transaction-flow
```

## Usage

### Provider

```tsx
<TransactionFlowProvider>
  {/* USE HOOK IN CHILD COMPONENT */}
</TransactionFlowProvider>
```

### Hook

```tsx
const {
    run, // executes the process
    step, // text representation of hook status
    error, // stores the error message
    isIdle, // initial state
    isReadyToExecute, // flag if approval is necessary
    isCheckingAllowance, // flag for checking allowance if not ETH
    isPendingApprove, // tanstack query flag isPending of approval execution
    isWaitingForApproval, // internal flag for being in approval
    isWaitingForApprovalTxConfirmation, // flag for approval transaction still not having a receipt (good for load balanced RPCs)
    isExecuting, // flag if hook is in execution mode, which is the actual function call that should transfer the token/ETH
    isPendingExecuting, // tanstack query flag isPending of main function execution
    isWaitingForExecutionTxConfirmation, // flag for execution transaction still not having a receipt
    isSuccess, // if everything is finished, this flag will be true
    isError, // true on error
    isReady, // equivalent of isReadyToExecute // TODO cleanup
} = useEvmTransactionFlow({...});
```

### Trigger `run()`

```tsx
const handleClick = () => {
  run();
};
```

## TODOs

[ ] sophisticated status handling
[ ] proper integration testing with wagmi mock
[ ] tbd...

## License

MIT
