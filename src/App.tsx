import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';
import { AarcFundKitModal } from '@aarc-dev/fundkit-web-sdk';
import { useRef } from 'react';
import { AarcEthWalletConnector, wagmiConfig } from '@aarc-xyz/eth-connector';
import { aarcConfig } from './config/aarcConfig';
import DepositModal from './components/OrderlyDepositModal';
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const queryClient = new QueryClient();

function App() {
  const aarcModalRef = useRef(new AarcFundKitModal(aarcConfig, "dev", "https://deploy-preview-209--iframe-widget-v3.netlify.app"));

  const aarcModal = aarcModalRef.current;

  return (
    <WalletConnectorProvider solanaInitial={{network: WalletAdapterNetwork.Mainnet }}>
    <OrderlyAppProvider brokerId="orderly" brokerName="Orderly" networkId="mainnet">
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <AarcEthWalletConnector aarcWebClient={aarcModal} debugLog={true} >
          <DepositModal aarcModal={aarcModal} />
        </AarcEthWalletConnector>
      </WagmiProvider>
    </QueryClientProvider>
    </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
}

export default App;
