import { Address, getInjectiveAddress } from '@injectivelabs/sdk-ts';

/**
 * Converts an Ethereum address to a proper Injective address.
 *
 * IMPORTANT: This is a one-way conversion and cannot be reversed without
 * access to the private key. It derives the Injective address from the
 * Ethereum public key, which is standard for many Cosmos-based chains.
 *
 * @param ethAddress - The Ethereum address to convert
 * @returns The corresponding Injective address
 */
export const convertToInjectiveAddress = (ethAddress: string): string => {
    try {
        const address = getInjectiveAddress(ethAddress);
        return address;
    } catch (error) {
        console.error('Error converting Ethereum address to Injective address:', error);
        return '';
    }
};

/**
 * Validates if an address is a proper Injective address
 * @param address - The address to validate
 * @returns True if the address is a valid Injective address
 */
export const isValidInjectiveAddress = (address: string): boolean => {
    try {
        Address.fromBech32(address);
        return true;
    } catch {
        return false;
    }
};

/**
 * Gets the Ethereum address from an Injective address
 * @param injAddress - The Injective address
 * @returns The corresponding Ethereum address
 */
export const getEthereumAddressFromInjective = (injAddress: string): string => {
    try {
        const address = Address.fromBech32(injAddress);
        return address.toHex();
    } catch (error) {
        console.error('Error converting Injective address to Ethereum address:', error);
        return '';
    }
}; 