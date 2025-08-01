import { convertToInjectiveAddress, isValidInjectiveAddress, getEthereumAddressFromInjective } from './injectiveAddress';

// Test cases for address conversion
const testCases = [
    {
        ethAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        description: 'Standard Ethereum address'
    },
    {
        ethAddress: '0x0000000000000000000000000000000000000000',
        description: 'Zero address'
    },
    {
        ethAddress: '0x1111111111111111111111111111111111111111',
        description: 'All ones address'
    }
];

console.log('Testing Injective address conversion...');

testCases.forEach(({ ethAddress, description }) => {
    console.log(`\nTesting: ${description}`);
    console.log(`Ethereum address: ${ethAddress}`);
    
    const injAddress = convertToInjectiveAddress(ethAddress);
    console.log(`Injective address: ${injAddress}`);
    
    const isValid = isValidInjectiveAddress(injAddress);
    console.log(`Valid Injective address: ${isValid}`);
    
    if (isValid) {
        const backToEth = getEthereumAddressFromInjective(injAddress);
        console.log(`Back to Ethereum: ${backToEth}`);
        console.log(`Round trip successful: ${backToEth.toLowerCase() === ethAddress.toLowerCase()}`);
    }
});

console.log('\nTest completed!'); 