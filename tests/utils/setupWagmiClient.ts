import { mainnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import { mock } from "wagmi/connectors";

export const wagmiTestConfig = createConfig({
  chains: [mainnet],
  connectors: [
    mock({
      accounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      features: {
        defaultConnected: true,
        // reconnect: true,
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});
