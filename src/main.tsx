import React from 'react';
import ReactDOM from 'react-dom/client';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import App from './App';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

// Create a client
const queryClient = new QueryClient();

// Configure chains & providers
const config = getDefaultConfig({
  appName: 'CoinFlip',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [mainnet, sepolia],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
