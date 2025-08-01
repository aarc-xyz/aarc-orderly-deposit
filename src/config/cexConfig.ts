import {
    FKConfig,
    ThemeName,
    TransactionSuccessData,
    TransactionErrorData,
    SourceConnectorName,
  } from "@aarc-dev/fundkit-web-sdk";
  
  export const cexConfig: FKConfig = {
    appName: "Injective x Aarc",
    userId: "0x",
    dappId: "Injective CEX demo",
    module: {
      exchange: {
        enabled: true,
      },
      onRamp: {
        enabled: false,
        onRampConfig: {},
      },
      bridgeAndSwap: {
        enabled: false,
        fetchOnlyDestinationBalance: false,
        routeType: "Value",
        connectors: [SourceConnectorName.ETHEREUM],
      },
    },
    destination: {},
    appearance: {
      roundness: 42,
      theme: ThemeName.DARK,
    },
    apiKeys: {
      aarcSDK: import.meta.env.VITE_AARC_API_KEY,
    },
    events: {
      onTransactionSuccess: (data: TransactionSuccessData) => {
        console.log("Transaction successful:", data);
      },
      onTransactionError: (data: TransactionErrorData) => {
        console.error("Transaction failed:", data);
      },
      onWidgetClose: () => {
        console.log("Widget closed");
      },
      onWidgetOpen: () => {
        console.log("Widget opened");
      },
    },
    origin: window.location.origin,
  
  }; 