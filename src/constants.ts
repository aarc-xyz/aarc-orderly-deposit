import { ethers } from "ethers";
import { TokenConfig } from "./types";

export enum SupportedChainId {
    ARBITRUM = 42161
}

export type AddressMap = {
    [chainId: number]: string;
};

export const APEX_OMNI_ADDRESS: AddressMap = {
    [SupportedChainId.ARBITRUM]: '0x3169844a120C0f517B4eB4A750c08d8518C8466a'
};

export const TOKENS: TokenConfig[] = [
    {
        symbol: 'USDC',
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        decimals: 6,
        logo: '/usdc-icon.svg',
        quickAmounts: ['1', '5', '10', '20']
    },
    {
        symbol: 'USDT',
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        decimals: 6,
        logo: '/usdt-icon.svg',
        quickAmounts: ['1', '5', '10', '20']
    },
    {
        symbol: 'WETH',
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        decimals: 18,
        logo: '/weth-icon.png',
        quickAmounts: ['0.01', '0.05', '0.1', '0.2']
    },
    {
        symbol: 'ETH',
        address: ethers.ZeroAddress,
        decimals: 18,
        logo: '/eth-icon.svg',
        quickAmounts: ['0.01', '0.05', '0.1', '0.2']
    }
];

export const BASE_RPC_URL = "https://mainnet.base.org";