# CoinFlip Frontend

A modern, animated frontend for the CoinFlip smart contract built with React, Wagmi, RainbowKit, Framer-Motion, and Tailwind CSS.

## Features

- Connect wallet with RainbowKit
- Place bets with ETH
- Animated coin flip
- Real-time player statistics
- Responsive design
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A WalletConnect project ID (get it from [WalletConnect](https://cloud.walletconnect.com/))

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd coinflip-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your WalletConnect project ID:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. Update the contract address in `src/App.tsx`:
```typescript
const CONTRACT_ADDRESS = '0x...'; // Replace with your deployed contract address
```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Building for Production

Build the app for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Wagmi
- RainbowKit
- Framer Motion
- Tailwind CSS
- Viem

## License

MIT
