import { AarcFundKitModal } from '@aarc-dev/fundkit-web-sdk';
import { Navbar } from './Navbar';
import { TradingPage } from "@orderly.network/trading";
import { useAccountInfo } from '@orderly.network/hooks';
import { useState, useEffect } from 'react';
import { ORDERLY_CONTRACT_ADDRESS, BROKER_HASH, TOKEN_HASH } from '../constants';

export const OrderlyDepositModal = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
    const { data: account, isLoading } = useAccountInfo();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDeposit = async () => {
        console.log('Account:', account);
        if(!account) return;
        
        const { account_id } = account;
        try {
            setIsProcessing(true);

            aarcModal.updateDestinationContract({
                contractAddress: ORDERLY_CONTRACT_ADDRESS,
                calldataABI: JSON.stringify([
                    {
                        "inputs": [
                           {"internalType":"bytes32","name":"accountId","type":"bytes32"},
                           {"internalType":"bytes32","name":"brokerHash","type":"bytes32"},
                           {"internalType":"bytes32","name":"tokenHash","type":"bytes32"},
                           {"internalType":"uint128","name":"tokenAmount","type":"uint128"}
                        ],
                        "name":"deposit",
                        "outputs":[],
                        "stateMutability":"payable",
                        "type":"function"
                    }
                ]),
                calldataParams: `${account_id},${BROKER_HASH},${TOKEN_HASH},AARC`,
                contractName: "Orderly Deposit",
                contractGasLimit: "800000",
                contractLogoURI: "https://mintlify.s3.us-west-1.amazonaws.com/orderly/logo/dark.svg"
            });

            aarcModal.openModal();
            setIsProcessing(false);
        } catch (error) {
            console.error("Error preparing deposit:", error);
            setIsProcessing(false);
            aarcModal.close();
        }
    };

    // Override the deposit button functionality using MutationObserver
    useEffect(() => {
        const overrideDepositButton = () => {
            // Find all deposit buttons in the DOM
            const depositButtons = document.querySelectorAll('[data-testid="oui-testid-assetView-deposit-button"]');
            
            console.log('Found deposit buttons to override:', depositButtons.length);
            
            depositButtons.forEach((button, index) => {
                // Check if this button has already been overridden
                if (button.getAttribute('data-aarc-overridden') === 'true') {
                    console.log(`Button ${index} already overridden, skipping`);
                    return;
                }
                
                console.log(`Overriding button ${index}:`, button);
                
                // Mark as overridden
                button.setAttribute('data-aarc-overridden', 'true');
                
                // Remove existing click listeners by cloning the button
                const newButton = button.cloneNode(true) as HTMLElement;
                newButton.setAttribute('data-aarc-overridden', 'true');
                
                // Clear any existing event listeners by removing and re-adding
                const oldButton = button;
                button.parentNode?.replaceChild(newButton, oldButton);
                
                // Add our custom click handler with multiple event types
                const handleClick = async (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('Aarc deposit button clicked!');
                    await handleDeposit();
                };
                
                // Add multiple event listeners to ensure it works
                newButton.addEventListener('click', handleClick, true);
                newButton.addEventListener('mousedown', handleClick, true);
                newButton.addEventListener('touchstart', handleClick, true);
                
                // Update button text and styling
                newButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="oui-text-white">
                        <path fill="currentcolor" fill-opacity="1" fill-rule="evenodd" clip-rule="evenodd" d="M11.993 6.012a1 1 0 0 0-1 .999v7.555L7.998 11.6l-1.405 1.405 4.683 4.714c.195.196.457.293.719.293.26 0 .522-.098.717-.293l4.683-4.714L15.99 11.6l-2.997 2.966V7.011a1 1 0 0 0-1-.999"></path>
                    </svg>
                    <span>${isProcessing ? 'Processing...' : 'Deposit via Aarc'}</span>
                `;
                
                // Add custom styling
                newButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                newButton.style.cursor = isProcessing ? 'not-allowed' : 'pointer';
                newButton.style.opacity = isProcessing ? '0.7' : '1';
                
                // Ensure the button is clickable
                newButton.style.pointerEvents = 'auto';
                newButton.style.userSelect = 'none';
                newButton.style.position = 'relative';
                newButton.style.zIndex = '1000';
                
                console.log('Button overridden successfully:', newButton);
            });
        };

        // Create a MutationObserver to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check if any new nodes contain deposit buttons
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as Element;
                            if (element.querySelector('[data-testid="oui-testid-assetView-deposit-button"]')) {
                                setTimeout(overrideDepositButton, 100); // Small delay to ensure DOM is ready
                            }
                        }
                    });
                }
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial override with multiple attempts
        const initialTimer = setTimeout(overrideDepositButton, 1000);
        const retryTimer = setTimeout(overrideDepositButton, 2000);
        const finalTimer = setTimeout(overrideDepositButton, 3000);
        
        return () => {
            observer.disconnect();
            clearTimeout(initialTimer);
            clearTimeout(retryTimer);
            clearTimeout(finalTimer);
        };
    }, [isProcessing, account, isLoading]);

    return (
        <div className="min-h-screen bg-aarc-bg grid-background">
            <Navbar/>
            <div className="mt-[70px]">
                <TradingPage 
                    symbol='PERP_BTC_USDC' 
                    tradingViewConfig={{
                        library_path: "/tradingview-library.js",
                    }}
                />
            </div>
        </div>
    );
};

export default OrderlyDepositModal;