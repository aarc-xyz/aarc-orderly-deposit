import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

const StyledConnectButton = ({
    fixWidth = false
}:{
    fixWidth: boolean
}) => {
    return (
        <div className={`${fixWidth ? 'w-[178px]' : 'w-full'} h-[40px]`}>
            <RainbowConnectButton.Custom>
                {({ openConnectModal }) => {
                    return (
                        <button
                            onClick={openConnectModal}
                            className="w-full h-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-aarc-primary border border-[#0033000D]"
                        >
                            <div className="flex items-center rounded-xl justify-center gap-2 w-full">
                                <span className="text-aarc-button-text font-semibold whitespace-nowrap">Connect wallet</span>
                                <img src="/chain-link.svg" alt="chain-link" />

                            </div>
                        </button>
                    );
                }}
            </RainbowConnectButton.Custom>
        </div>
    );
};

export default StyledConnectButton; 