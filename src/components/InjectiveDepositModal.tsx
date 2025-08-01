import { useRef, useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { AarcFundKitModal } from '@aarc-dev/fundkit-web-sdk';
import { INJECTIVE_ADDRESS, SupportedChainId, TOKENS } from '../constants';
import { Navbar } from './Navbar';
import StyledConnectButton from './StyledConnectButton';
import { TokenConfig } from '../types';
import { cexConfig } from '../config/cexConfig';
import { getAddress } from 'ethers';

export const InjectiveDepositModal = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
    const [amount, setAmount] = useState('20');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedToken, setSelectedToken] = useState<TokenConfig>(TOKENS[0]);
    const { disconnect } = useDisconnect();
    const { address } = useAccount();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const shouldDisableInteraction = !address;
    const [destinationAddress, setDestinationAddress] = useState('');
    const [isWithdrawMode, setIsWithdrawMode] = useState(false);

    const cexAarcModalRef = useRef(new AarcFundKitModal(cexConfig));

    const cexModal = cexAarcModalRef.current;

    // Function to convert Ethereum address to Injective address
    const convertToInjectiveAddress = (ethAddress: string): string => {
        try {
            // Normalize the Ethereum address
            const normalizedAddress = getAddress(ethAddress);
            
            // Convert to Injective address format
            // This is a simplified conversion - in a real implementation, you'd use a proper library
            // For now, we'll create a mock Injective address based on the Ethereum address
            const addressBytes = normalizedAddress.slice(2); // Remove '0x'
            const injAddress = `inj1${addressBytes.slice(0, 38)}`;
            
            return injAddress;
        } catch (error) {
            console.error('Error converting address:', error);
            return '';
        }
    };

    // Update destination address when wallet connects
    useEffect(() => {
        if (address && isWithdrawMode) {
            const injAddress = convertToInjectiveAddress(address);
            setDestinationAddress(injAddress);
        }
    }, [address, isWithdrawMode]);

    // Function to validate Injective address format
    const isValidInjectiveAddress = (address: string): boolean => {
        // Injective addresses start with 'inj' and are typically 42 characters long
        const injAddressRegex = /^inj1[a-zA-Z0-9]{38}$/;
        return injAddressRegex.test(address);
    };

    const handleDisconnect = () => {
        setAmount('20');
        setIsProcessing(false);
        setDestinationAddress('');
        disconnect();
    };

    const handleDeposit = async () => {
        if (!address) return;

        try {
            setIsProcessing(true);
            aarcModal.updateRequestedAmount(Number(amount));
            aarcModal.updateDestinationToken(selectedToken.address);

            if(selectedToken.symbol === 'INJ'){
                //@ts-expect-error - only INJ is supported for now
                aarcModal.updateModules({
                    exchange: {
                        enabled: false
                    }
                })
            }

            aarcModal.updateDestinationContract({
                contractAddress: INJECTIVE_ADDRESS[SupportedChainId.ETHEREUM],
                calldataABI: JSON.stringify([
                    {
                        "inputs": [
                            { "internalType": "address", "name": "_tokenContract", "type": "address" },
                            { "internalType": "bytes32", "name": "_destination", "type": "bytes32" },
                            { "internalType": "uint256", "name": "_amount", "type": "uint256" },
                            { "internalType": "string", "name": "_data", "type": "string" }
                        ],
                        "name": "sendToInjective",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ]),
                calldataParams: `${selectedToken.address},0x000000000000000000000000${address.slice(2)},AARC,`,
                contractName: "Injective Deposit",
                contractGasLimit: "800000",
                contractLogoURI: "https://explorer.injective.network/favicon.png"
            });

            aarcModal.openModal();
            setAmount('');
            setIsProcessing(false);
        } catch (error) {
            console.error("Error preparing deposit:", error);
            setIsProcessing(false);
            aarcModal.close();
        }
    };

    const handleBinanceWithdraw = async () => {
        if(!destinationAddress) return;

        // Validate Injective address format
        if (!isValidInjectiveAddress(destinationAddress)) {
            console.error("Invalid Injective address format. Expected format: inj1...");
            return;
        }

        try{
            cexModal.updateRequestedAmount(Number(amount));
            cexModal.updateDestinationToken(selectedToken.address);
            cexModal.updateDestinationChainId(SupportedChainId.ETHEREUM);
            cexModal.updateDestinationWalletAddress(destinationAddress);
            cexModal.openModal();
        }catch(error){
            console.error("Error withdrawing INJ from Binance:", error);
        }
    };

    const sliceAddress = (address: string, length: number) => {
        return address.slice(0, length) + '...' + address.slice(-length);
    }

    return (
        <div className="min-h-screen bg-aarc-bg grid-background">
            <Navbar handleDisconnect={handleDisconnect} />
            <main className="mt-24 gradient-border flex items-center justify-center mx-auto max-w-md shadow-[4px_8px_8px_4px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col items-center w-[440px] bg-[#2D2D2D] rounded-[24px] p-8 pb-[22px] gap-3">
                    <div className="w-full relative">
                        <h3 className="text-[14px] font-semibold text-[#F6F6F6] mb-4">Deposit on Injective or Withdraw INJ from CEX</h3>
                       
                    </div>

                    {/* Toggle Switch */}
                    <div className="w-full flex items-center justify-center bg-[#2A2A2A] rounded-2xl p-1">
                        <button
                            onClick={() => setIsWithdrawMode(false)}
                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                                !isWithdrawMode 
                                    ? 'bg-[#A5E547] text-[#003300]' 
                                    : 'text-[#F6F6F6] hover:text-[#A5E547]'
                            }`}
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => setIsWithdrawMode(true)}
                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                                isWithdrawMode 
                                    ? 'bg-[#A5E547] text-[#003300]' 
                                    : 'text-[#F6F6F6] hover:text-[#A5E547]'
                            }`}
                        >
                            Withdraw from CEX
                        </button>
                    </div>

                    {!isWithdrawMode ? (
                        // Deposit Section
                        <>
                            {/* Token Selection Dropdown */}
                            <div className="w-full relative">
                                <button
                                    onClick={() => !shouldDisableInteraction && setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl"
                                    disabled={shouldDisableInteraction}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-6 h-6" />
                                        <span className="text-[18px] font-semibold text-[#F6F6F6]">{selectedToken.symbol}</span>
                                    </div>
                                    <div className="pointer-events-none">
                                        <svg 
                                            width="12" 
                                            height="8" 
                                            viewBox="0 0 12 8" 
                                            fill="none" 
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                                        >
                                            <path d="M1 1L6 6L11 1" stroke="#F6F6F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </button>

                                {/* Dropdown Options */}
                                {isDropdownOpen && (
                                    <div className="absolute w-full mt-2 py-2 bg-[#2A2A2A] border border-[#424242] rounded-2xl z-10">
                                        {TOKENS.map(token => (
                                            <button
                                                key={token.symbol}
                                                onClick={() => {
                                                    setSelectedToken(token);
                                                    setAmount(token.quickAmounts[0]);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#363636] transition-colors"
                                            >
                                                <img src={token.logo} alt={token.symbol} className="w-6 h-6" />
                                                <span className="text-[18px] font-semibold text-[#F6F6F6]">{token.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Deposit Info */}
                            <div className="w-full flex gap-x-2 items-start p-4 bg-[rgba(165,229,71,0.05)] border border-[rgba(165,229,71,0.2)] rounded-2xl">
                                <img src="/info-icon.svg" alt="Info" className="w-4 h-4 mt-[2px]" />
                                <div className="text-xs text-[#F6F6F6] leading-5">
                                    <p className="font-bold mb-1">After your deposit is completed:</p>
                                    <p>Check your deposit balance on{' '}
                                        <a 
                                            href="https://explorer.injective.network/" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[#A5E547] hover:underline"
                                        >
                                            Injective Explorer
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {!address && <div className="mt-2 w-full"><StyledConnectButton fixWidth={false} /></div> }

                            {/* Continue Button */}
                            {address && <button
                                onClick={handleDeposit}
                                disabled={isProcessing || shouldDisableInteraction}
                                className="w-full h-11 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] font-semibold rounded-2xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : 'Continue'}
                            </button>}
                        </>
                    ) : (
                        // Withdraw Section
                        <>
                            {/* INJ Token Display (Fixed) */}
                            <div className="w-full flex items-center p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl">
                                <div className="flex items-center gap-3 flex-1">
                                    <img src="/inj-icon.svg" alt="INJ" className="w-6 h-6" />
                                    <span className="text-[18px] font-semibold text-[#F6F6F6]">INJ</span>
                                </div>
                            </div>

                            {/* Injective Address Input (Mandatory) */}
                            <div className="w-full">
                                <div className="flex items-center p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl">
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="text"
                                            value={destinationAddress ? sliceAddress(destinationAddress, 6) : ''}
                                            onChange={(e) => setDestinationAddress(e.target.value)}
                                            className="w-full bg-transparent text-[18px] font-semibold text-[#F6F6F6] outline-none"
                                            placeholder={!address ? "Connect wallet to continue" : "Enter Injective address (required)"}
                                            disabled={shouldDisableInteraction || destinationAddress !== ''}
                                            readOnly={destinationAddress !== ''}
                                        />
                                        <div className="relative group">
                                            <img 
                                                src="/info-icon.svg" 
                                                alt="Info" 
                                                className="w-4 h-4 cursor-pointer" 
                                            />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded-lg text-xs text-[#F6F6F6] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {!address 
                                                    ? "Connect your wallet to get your Injective address"
                                                    : "Your Injective address where you will receive the withdrawn INJ"
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!address && <div className="mt-2 w-full"><StyledConnectButton fixWidth={false} /></div> }

                            {/* Withdraw Button */}
                            {address && <button
                                onClick={handleBinanceWithdraw}
                                disabled={isProcessing || shouldDisableInteraction || !destinationAddress}
                                className="w-full h-11 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] font-semibold rounded-2xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Withdraw INJ from CEX
                            </button>}
                        </>
                    )}

                    {/* Powered by Footer */}
                    <div className="flex flex-col items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#F6F6F6]">Powered by</span>
                            <img src="/aarc-logo-small.svg" alt="Aarc" />
                        </div>
                        <p className="text-[10px] text-[#C3C3C3]">
                            By using this service, you agree to Aarc <span className="underline cursor-pointer">terms</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InjectiveDepositModal;