import {
    FKConfig,
    ThemeName,
    TransactionSuccessData,
    TransactionErrorData,
    SourceConnectorName,
  } from "@aarc-xyz/fundkit-web-sdk";
  
  export const cexConfig: FKConfig = {
    appName: "Injective x Aarc",
    module: {
      exchange: {
        enabled: true,
        // @ts-ignore
        fromTokenAddress: '0xa2B726B1145A4773F68593CF171187d8EBe4d495',
        fromChainId: '56',
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
      aarcSDK: import.meta.env.VITE_AARC_API_KEY_STAGING,
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