import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import type { PropsWithChildren } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { anvil } from "wagmi/chains";

const config = createConfig(
  getDefaultConfig({
    chains: [anvil],
    transports: {
      [anvil.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: `123412341234124`,

    // Required App Info
    appName: "Your App Name",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3ConnectKitProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
