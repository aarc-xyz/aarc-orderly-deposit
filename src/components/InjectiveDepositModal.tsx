import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { INJECTIVE_ADDRESS, SupportedChainId, TOKENS } from '../constants';
import { Navbar } from './Navbar';
import StyledConnectButton from './StyledConnectButton';
import { TokenConfig } from '../types';
import { getEthereumAddress } from '@injectivelabs/sdk-ts';

export const InjectiveDepositModal = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
    const [amount, setAmount] = useState('20');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedToken, setSelectedToken] = useState<TokenConfig>(TOKENS[0]);
    const { disconnect } = useDisconnect();
    const { address } = useAccount();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const shouldDisableInteraction = !address;
    const [destinationAddress, setDestinationAddress] = useState('');

    const handleDisconnect = () => {
        setAmount('20');
        setIsProcessing(false);
        disconnect();
    };

    const handleDeposit = async () => {
        if (!address) return;

        try {
            setIsProcessing(true);

            const injectiveInterface = new ethers.Interface([
                "function sendToInjective(address _tokenContract, bytes32 _destination, uint256 _amount, string _data) external"
            ]);

            const amountInWei = ethers.parseUnits(amount, selectedToken.decimals);
            
            let userEthereumAddress = destinationAddress ? destinationAddress : address;
            if (destinationAddress && destinationAddress.toLowerCase().startsWith('inj')) {
                userEthereumAddress = getEthereumAddress(destinationAddress);
            }

            const contractPayload = injectiveInterface.encodeFunctionData("sendToInjective", [
                selectedToken.address,
                `0x000000000000000000000000${userEthereumAddress.slice(2)}`,
                amountInWei,
                ""
            ]);
            
            aarcModal.updateRequestedAmount(Number(amount));
            aarcModal.updateDestinationToken(selectedToken.address);

            aarcModal.updateDestinationContract({
                contractAddress: INJECTIVE_ADDRESS[SupportedChainId.ETHEREUM],
                contractName: "Injective Deposit",
                contractGasLimit: "800000",
                contractPayload: contractPayload,
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

    return (
        <div className="min-h-screen bg-aarc-bg grid-background">
            <Navbar handleDisconnect={handleDisconnect} />
            <main className="mt-24 gradient-border flex items-center justify-center mx-auto max-w-md shadow-[4px_8px_8px_4px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col items-center w-[440px] bg-[#2D2D2D] rounded-[24px] p-8 pb-[22px] gap-3">
                    <div className="w-full relative">
                        <h3 className="text-[14px] font-semibold text-[#F6F6F6] mb-4">Injective Deposit</h3>
                        {!address && <StyledConnectButton /> }
                    </div>

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

                    {/* Amount Input */}
                    <div className="w-full">
                        <div className="flex items-center p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl">
                            <div className="flex items-center gap-3">
                                <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-6 h-6" />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                    className="w-full bg-transparent text-[18px] font-semibold text-[#F6F6F6] outline-none"
                                    placeholder="Enter amount"
                                    disabled={shouldDisableInteraction}
                                />
                            </div>
                        </div>
                    </div>

                                        {/* Quick Amount Buttons */}
                    <div className="flex gap-[14px] w-full">
                        {selectedToken.quickAmounts.map((value) => (
                            <button
                                key={value}
                                onClick={() => setAmount(value)}
                                disabled={shouldDisableInteraction}
                                className="flex items-center justify-center px-2 py-2 bg-[rgba(83,83,83,0.2)] border border-[#424242] rounded-lg h-[34px] flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-[14px] font-semibold text-[#F6F6F6] whitespace-nowrap">{value} {selectedToken.symbol}</span>
                            </button>
                        ))}
                    </div>

                    {/* Destination Address Input */}
                    <div className="w-full">
                        <div className="flex items-center p-3 bg-[#2A2A2A] border border-[#424242] rounded-2xl">
                            <div className="flex items-center gap-3 flex-1">
                                <input
                                    type="text"
                                    value={destinationAddress}
                                    onChange={(e) => setDestinationAddress(e.target.value)}
                                    className="w-full bg-transparent text-[18px] font-semibold text-[#F6F6F6] outline-none"
                                    placeholder="Enter destination address INJ or ETH"
                                    disabled={shouldDisableInteraction}
                                />
                                <div className="relative group">
                                    <img 
                                        src="/info-icon.svg" 
                                        alt="Info" 
                                        className="w-4 h-4 cursor-pointer" 
                                    />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded-lg text-xs text-[#F6F6F6] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        You can enter INJ or ETH address where you want the funds to be deposited,
                                        or leave blank to deposit to your own address
                                    </div>
                                </div>
                            </div>
                        </div>
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

                    {/* Continue Button */}
                    <button
                        onClick={handleDeposit}
                        disabled={isProcessing || shouldDisableInteraction}
                        className="w-full h-11 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] font-semibold rounded-2xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Continue'}
                    </button>

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