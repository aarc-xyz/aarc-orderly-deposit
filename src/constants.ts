import { TokenConfig } from "./types";

export enum SupportedChainId {
    ETHEREUM = 1
}

export type AddressMap = {
    [chainId: number]: string;
};

export const INJECTIVE_ADDRESS: AddressMap = {
    [SupportedChainId.ETHEREUM]: '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3'
};

export const TOKENS: TokenConfig[] = [
    {
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        logo: '/usdt-icon.svg',
        quickAmounts: ['1', '5', '10', '20']
    },
    {
        symbol: 'INJ',
        address: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30',
        decimals: 18,
        logo: '/inj-icon.svg',
        quickAmounts: ['2', '5', '10', '12']
    }
];