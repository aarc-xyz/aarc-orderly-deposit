# Cross-Chain Deposits with Aarc

This guide demonstrates how to implement cross-chain deposits using Aarc's FundKit SDK. The example shows how to create a dApp that allows users to deposit funds from any supported chain to a destination contract on Arbitrum.

## Prerequisites

- Node.js and npm installed
- Basic understanding of React and Web3 development
- An Aarc API key

## Quick Start

1. Clone into the repository:
```bash
git clone https://github.com/aarc-xyz/aarc-rampx-nft-minting
cd aarc-rampx-nft-minting
```

2. Install required dependencies:
```bash
npm install @aarc-xyz/fundkit-web-sdk @aarc-xyz/eth-connector @rainbow-me/rainbowkit wagmi viem ethers @tanstack/react-query
```

3. Create a `.env` file with your Aarc API key:
```env
VITE_AARC_API_KEY=your_api_key_here
```

## Implementation Guide

### 1. Setup Aarc Configuration

Create a configuration file for Aarc's FundKit SDK:

```typescript
import { FKConfig, ThemeName, SourceConnectorName } from "@aarc-xyz/fundkit-web-sdk";

export const aarcConfig: FKConfig = {
  appName: "Cross-Chain Deposits",
  module: {
    exchange: { enabled: true },
    onRamp: { enabled: true },
    bridgeAndSwap: {
      enabled: true,
      fetchOnlyDestinationBalance: false,
      routeType: "Value",
      connectors: [SourceConnectorName.ETHEREUM],
    },
  },
  destination: {
    contract: {
      contractAddress: "YOUR_CONTRACT_ADDRESS",
      contractName: "Deposit Contract",
      contractGasLimit: "300000",
      contractUri: "https://example.com/image.png/"
    },
    chainId: 42161, // Arbitrum
    destinationToken: "DESTINATION_TOKEN_ADDRESS"
  },
  appearance: {
    theme: ThemeName.DARK,
    roundness: 42,
  },
  apiKeys: {
    aarcSDK: import.meta.env.VITE_AARC_API_KEY,
  },
};
```

### 2. Create the Deposit Component

```typescript
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';

export const DepositComponent = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
  const [amount, setAmount] = useState('20');
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    if (!address) return;

    try {
      setIsProcessing(true);

      // Create contract interface
      const contractInterface = new ethers.Interface([
        "function deposit(bytes32 address, bytes32 amount) external payable"
      ]);

      // Generate deposit payload
      const contractPayload = contractInterface.encodeFunctionData("deposit", [
        address,
        amount
      ]);

      const value = ethers.parseUnits(amount, 18).toString();

      // Update Aarc configuration
      aarcModal.updateRequestedAmount(Number(amount));
      aarcModal.updateDestinationContract({
        contractPayload,
      });

      // Open Aarc modal
      aarcModal.openModal();
      setAmount('');
      setIsProcessing(false);
    } catch (error) {
      console.error("Deposit error:", error);
      setIsProcessing(false);
      aarcModal.close();
    }
  };

  return (
    <div className="deposit-container">
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        disabled={!address}
      />

      <button
        onClick={handleDeposit}
        disabled={isProcessing || !address}
        className="deposit-button"
      >
        {isProcessing ? 'Processing...' : 'Deposit'}
      </button>
    </div>
  );
};
```

### 3. Setup App Component

```typescript
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { AarcEthWalletConnector } from '@aarc-xyz/eth-connector';
import { aarcConfig } from './config/aarcConfig';
import { DepositComponent } from './components/DepositComponent';

const queryClient = new QueryClient();

function App() {
  const aarcModalRef = useRef(new AarcFundKitModal(aarcConfig));
  const aarcModal = aarcModalRef.current;

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <AarcEthWalletConnector aarcWebClient={aarcModal}>
          <DepositComponent aarcModal={aarcModal} />
        </AarcEthWalletConnector>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
```

## User Flow

1. User connects their wallet using RainbowKit
2. User enters the amount they want to deposit
3. User clicks the "Deposit" button
4. Aarc modal opens showing available payment options
5. User selects their preferred payment method
6. Transaction is processed cross-chain
7. Funds are deposited to the destination contract on Arbitrum

![Minting in Progress](/deposit-progress.png)
*User selecting payment method in Aarc modal*

![Minting Complete](/deposit-complete.png)
*Successfully depositing funds cross-chain*

## Example Implementation

You can find a complete working example at:
- GitHub: [aarc-xyz/aarc-apex-omni-deposit](https://github.com/aarc-xyz/aarc-apex-omni-deposit)
- Live Demo: [aarc-apex-omni-deposit.netlify.app](https://aarc-apex-omni-deposit.netlify.app/)

## Support

For additional queries contact [support](/introduction/support):
