
export enum SupportedChainId {
    ETHEREUM = 1
}

export type AddressMap = {
    [chainId: number]: string;
};

export const ORDERLY_CONTRACT_ADDRESS = "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9";

// kecakk hash of broker id i.e, "orderly"
export const BROKER_HASH = "0x95d85ced8adb371760e4b6437896a075632fbd6cefe699f8125a8bc1d9b19e5b";
export const TOKEN_HASH = "0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0";

export const USDT_ON_ARBITRUM = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";