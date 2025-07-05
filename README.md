# useEvmTransactionFlow

> 🧠 Smart, flexible transaction flow hook for EVM-based apps (React + Wagmi + Viem)

## Features

- ✅ Handles ERC20, ERC721, ERC1155 and ETH
- 🔁 Optional approval flow
- ✅ Transaction confirmation tracking
- 🧪 Simulates contract calls before execution
- 🔗 Viem, Wagmi, TanStack Query native
- 💡 Built for composability and clarity
- Works with:
  - ConnectKit (https://family.co/docs/connectkit)
  - RainbowKit (https://rainbowkit.com/de/docs/introduction)
  - AppKit (https://docs.reown.com/appkit/overview)

## Installation

```bash
npm install use-evm-transaction-flow
```

## Usage

```tsx
const {
  run,
  isExecuting,
  isWaitingForApproval,
  isSuccess,
} = useEvmTransactionFlow({...});
```

## License

MIT
