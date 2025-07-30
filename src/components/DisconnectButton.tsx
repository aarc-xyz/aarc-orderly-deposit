const DisconnectButton = ({ handleDisconnect }: { handleDisconnect: () => void }) => {

    return (
        <div className="w-[158px] h-[40px]">
            <button
                onClick={handleDisconnect}
                className="w-full h-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-aarc-primary border border-[#0033000D] hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center rounded-xl justify-center gap-2 w-full">
                    <span className="text-aarc-button-text font-semibold whitespace-nowrap">Disconnect</span>
                    <svg width="16" height="16" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" fill="#003300" />
                    </svg>
                </div>
            </button>
        </div>
    );
};

export default DisconnectButton;