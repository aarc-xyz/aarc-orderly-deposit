import { AarcFundKitModal } from '@aarc-dev/fundkit-web-sdk';
import { Navbar } from './Navbar';
import { useState, useEffect, useRef } from 'react';
import { ORDERLY_CONTRACT_ADDRESS, ORDERLY_ABI, SupportedChainId, USDC_ON_ARBITRUM_ADDRESS, USDC_ABI, BROKER_HASH, TOKEN_HASH } from '../constants';
import { useAccount, useChainId, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import StyledConnectButton from './StyledConnectButton';
import { ethers } from 'ethers';
import { useAccount as useOrderlyAccount } from '@orderly.network/hooks';

export const OrderlyDepositModal = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);
    const amountRef = useRef<string>('');
    console.log("error", error);
    const { address } = useAccount();
    const chainId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const [showProcessingModal, setShowProcessingModal] = useState(false);

    const { state: orderlyState, createAccount, account: orderlyAccount } = useOrderlyAccount();

    // Message event listener for Aarc iframe communication
    useEffect(() => {
        const handleReceiveMessage = async (event: MessageEvent) => {
            if (event?.data?.type === "requestStatus") {
                const statusObj = event.data.data;
                console.log("Received status object from Aarc:", statusObj);

                if (statusObj && statusObj.destinationTokenAmount) {
                    setAmount(statusObj.destinationTokenAmount);
                    amountRef.current = statusObj.destinationTokenAmount; // Also store in ref
                } else {
                    console.log("No destinationTokenAmount in status object:", statusObj);
                }
            }
        };

        // Add event listener
        window.addEventListener("message", handleReceiveMessage);

        // Cleanup on unmount
        return () => {
            window.removeEventListener("message", handleReceiveMessage);
        };
    }, []);

    // Check Orderly account status
    useEffect(() => {
        const checkOrderlyAccount = async () => {
            if (!address || !orderlyAccount) return;

            try {
                console.log("Checking Orderly account status for:", address);

                // Set the address in Orderly account using the accountInstance
                const nextState = await orderlyAccount.setAddress(address, {
                    provider: window.ethereum,
                    chain: {
                        id: `0x${chainId?.toString(16)}`,
                        namespace: "evm" as any
                    },
                    wallet: {
                        name: "MetaMask"
                    }
                });

                console.log("Orderly account state after setAddress:", nextState);
                console.log("Current Orderly state:", orderlyAccount.stateValue);
            } catch (error) {
                console.error("Error checking Orderly account:", error);
            }
        };

        checkOrderlyAccount();
    }, [address, chainId, orderlyAccount]); // Removed orderlyState and accountInfo to prevent infinite loops

    const handleOrderlyRegistration = async () => {
        if (!address || !orderlyAccount) {
            setError("Wallet or Orderly account not available");
            return;
        }

        try {
            setError(null);
            orderlyState.address = address;
            console.log("Creating Orderly account for address:", orderlyState);

            console.log("Address set, now creating account...");
            const createResult = await createAccount();
            console.log("Account creation result:", createResult);

            if (createResult.accountId) {
                console.log("Orderly account created successfully:", createResult.accountId);
            } else {
                throw new Error("Failed to get accountId from account creation");
            }
        } catch (error) {
            console.error("Error creating Orderly account:", error);
            setError(error instanceof Error ? error.message : "Failed to create Orderly account");
        }
    };

    const handleDisconnect = () => {
        // Reset all state values
        setIsProcessing(false);
        setError(null);
        setAmount('');

        // Disconnect wallet
        disconnect();
    };

    const depositToOrderly = async () => {
        if (!walletClient || !address) return;

        // Use ref as fallback if state is empty due to re-renders
        const currentAmount = amount || amountRef.current;
        console.log("Depositing to Orderly with amount:", currentAmount);
        console.log("Amount state at function start:", amount);
        console.log("Amount ref at function start:", amountRef.current);

        if (!currentAmount) {
            setError("Please enter an amount");
            return;
        }

        // Check minimum deposit amount
        const amountNumber = parseFloat(currentAmount);
        console.log("Validating amount in depositToOrderly:", amountNumber);
        if (isNaN(amountNumber) || amountNumber < 10000000) {
            setError("Minimum deposit amount is $10 USD or equivalent");
            return;
        }

        try {
            setError(null);
            setIsProcessing(true);

            // Check if we're on Arbitrum, if not switch
            if (chainId !== SupportedChainId.ARBITRUM) {
                setShowProcessingModal(true);
                switchChain({ chainId: SupportedChainId.ARBITRUM });

                // Wait for network switch to complete
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Check if we have a valid accountId from orderlyState (use mainAccountId as fallback)
            const accountId = orderlyState.accountId || orderlyState.mainAccountId;
            if (!accountId) {
                throw new Error("Orderly account not registered. Please register with Orderly first.");
            }

            console.log("Using accountId for deposit:", accountId);

            const provider = new ethers.BrowserProvider(walletClient);
            const signer = await provider.getSigner();

            const usdcContract = new ethers.Contract(
                USDC_ON_ARBITRUM_ADDRESS,
                USDC_ABI,
                signer
            );

            const amountInWei = ethers.parseUnits(currentAmount, 6); // USDC has 6 decimals

            // Check allowance
            const allowance = await usdcContract.allowance(address, ORDERLY_CONTRACT_ADDRESS);
            if (allowance < amountInWei) {
                // Need to approve first
                const approveTx = await usdcContract.approve(
                    ORDERLY_CONTRACT_ADDRESS,
                    amountInWei
                );
                await approveTx.wait();
            }

            // Create Orderly contract instance
            const orderlyContract = new ethers.Contract(
                ORDERLY_CONTRACT_ADDRESS,
                ORDERLY_ABI,
                signer
            );



            // Call the Orderly deposit function
            const tx = await orderlyContract.deposit(
                address, // receiver address
                {
                    accountId: accountId,
                    brokerHash: BROKER_HASH,
                    tokenHash: TOKEN_HASH,
                    tokenAmount: amountInWei
                }
            );

            // Wait for transaction to be mined
            await tx.wait();

            setShowProcessingModal(false);
            setAmount('');
            setIsProcessing(false);
        } catch (error) {
            console.error("Error depositing USDC to Orderly:", error);
            setError(error instanceof Error ? error.message : "An error occurred during the deposit");
            setShowProcessingModal(false);
            setIsProcessing(false);
        }
    };

    const handleDeposit = async () => {
        if (!address || !walletClient) return;

        // Check if user is registered with Orderly
        if (!(orderlyState.accountId || orderlyState.mainAccountId)) {
            setError("Please register with Orderly first before making a deposit");
            return;
        }

        // Check minimum deposit amount
        if (amount) {
            const amountNumber = parseFloat(amount);
            console.log("Validating amount:", amountNumber);
            if (isNaN(amountNumber) || amountNumber < 10) {
                setError("Minimum deposit amount is $10 USD or equivalent");
                return;
            }
        } else {
            console.log("No amount provided for validation");
        }

        try {
            setIsProcessing(true);
            setError(null);

            aarcModal.updateDestinationWalletAddress(address as `0x${string}`);
            aarcModal.config.userId = address as `0x${string}`;

            aarcModal.updateEvents({
                onTransactionSuccess: () => {
                    aarcModal.close();
                    setShowProcessingModal(true);
                    depositToOrderly();
                }
            });

            // Open the Aarc modal
            aarcModal.openModal();
            setIsProcessing(false);
        } catch (error) {
            console.error("Error preparing deposit:", error);
            setError(error instanceof Error ? error.message : "An error occurred during the deposit");
            setIsProcessing(false);
            aarcModal.close();
        }
    };

    const shouldDisableInteraction = !address;

    return (
        <div className="min-h-screen bg-aarc-bg grid-background">
            <Navbar handleDisconnect={handleDisconnect} />
            <main className="mt-24 gradient-border flex items-center justify-center mx-auto max-w-md shadow-[4px_8px_8px_4px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col items-center w-[440px] bg-[#2D2D2D] rounded-[24px] p-8 pb-[22px] gap-3">
                    {showProcessingModal ? (
                        // Processing Modal
                        <div className="flex flex-col items-center gap-4">
                            <img src="/orderly-name-logo.svg" alt="Orderly" className="w-32 h-16" />
                            <h3 className="text-[18px] font-semibold text-[#F6F6F6]">
                                {chainId !== SupportedChainId.ARBITRUM
                                    ? "Switching to Arbitrum Network..."
                                    : "Depositing to "}
                                {chainId === SupportedChainId.ARBITRUM && (
                                    <a href="https://app.orderly.network/vaults" target="_blank" rel="noopener noreferrer" className="underline text-[#A5E547]">Orderly</a>
                                )}
                            </h3>
                            <p className="text-[14px] text-[#C3C3C3] text-center">
                                {chainId !== SupportedChainId.ARBITRUM
                                    ? "Please approve the network switch in your wallet."
                                    : "Please confirm the transaction in your wallet to complete the deposit."}
                            </p>
                        </div>
                    ) : (
                        // Main Deposit Modal
                        <>
                            <div className="w-full relative">
                                {!address && <StyledConnectButton fixWidth={false} />}
                            </div>

                            <div className="w-full">
                                <a href="https://app.orderly.network/vaults" target="_blank" rel="noopener noreferrer" className="block">
                                    <h3 className="text-[14px] font-semibold text-[#F6F6F6] mb-4">Deposit in <span className="underline text-[#A5E547]">Orderly vaults</span></h3>
                                </a>
                            </div>

                            {/* Info Message */}
                            <div className="w-full flex gap-x-2 items-start p-4 bg-[rgba(255,183,77,0.05)] border border-[rgba(255,183,77,0.2)] rounded-2xl">
                                <img src="/info-icon.svg" alt="Info" className="w-4 h-4 mt-[2px]" />
                                <p className="text-xs font-bold text-[#F6F6F6] leading-5">
                                    The funds will be deposited in the Orderly vault on Arbitrum.
                                </p>
                            </div>

                            {/* Minimum Deposit Warning */}
                            <div className="w-full flex gap-x-2 items-start p-4 bg-[rgba(255,183,77,0.05)] border border-[rgba(255,183,77,0.2)] rounded-2xl">
                                <img src="/warning-icon.svg" alt="Warning" className="w-4 h-4 mt-[2px]" />
                                <p className="text-xs font-bold text-[#F6F6F6] leading-5">
                                    <span className="text-[#FFB74D]">Minimum deposit required:</span> $10 USD or equivalent
                                </p>
                            </div>

                            {/* Orderly Registration Status */}
                            {address && (
                                <div className="w-full flex gap-x-2 items-start p-4 bg-[rgba(165,229,71,0.05)] border border-[rgba(165,229,71,0.2)] rounded-2xl">
                                    <img src="/info-icon.svg" alt="Info" className="w-4 h-4 mt-[2px]" />
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-[#F6F6F6] leading-5">
                                                Orderly Account Status: {(orderlyState.accountId || orderlyState.mainAccountId) ? 'Registered' : 'Not Registered'}
                                            </p>
                                            {(orderlyState.accountId || orderlyState.mainAccountId) && (
                                                <span className="text-xs text-[#A5E547] bg-[rgba(165,229,71,0.1)] px-2 py-1 rounded">
                                                    ✓ Ready
                                                </span>
                                            )}
                                        </div>
                                        {(orderlyState.accountId || orderlyState.mainAccountId) && (
                                            <p className="text-xs text-[#A5E547] leading-5">
                                                Account ID: {(orderlyState.accountId || orderlyState.mainAccountId)?.slice(0, 6)}...{(orderlyState.accountId || orderlyState.mainAccountId)?.slice(-4)}
                                            </p>
                                        )}
                                        {!(orderlyState.accountId || orderlyState.mainAccountId) && (
                                            <button
                                                onClick={handleOrderlyRegistration}
                                                className="w-full h-8 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] text-xs font-semibold rounded-xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center"
                                            >
                                                Register with Orderly
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Continue Button */}
                            <button
                                onClick={handleDeposit}
                                disabled={isProcessing || shouldDisableInteraction || !(orderlyState.accountId || orderlyState.mainAccountId)}
                                className="w-full h-11 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] font-semibold rounded-2xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' :
                                    !(orderlyState.accountId || orderlyState.mainAccountId) ? 'Register with Orderly first' : 'Continue'}
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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrderlyDepositModal;