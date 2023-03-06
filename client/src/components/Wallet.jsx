import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const Wallet = ({ account, setAccount }) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const [walletEnabled, setWalletEnabled] = useState(false);
  const [networkId, setNetworkId] = useState(0);

  const handleAccountChange = (chainId) => {
    setNetworkId(chainId);
  };

  useEffect(() => {
    ethereum.on("chainChanged", handleAccountChange);

    return () => {
      ethereum.removeListener("chainChanged", handleAccountChange);
    };
  });

  useEffect(() => {
    const run = async () => {
      // check the network
      const chain = await provider.getNetwork();
      setNetworkId(chain.chainId);
      if (chain.chainId != 280) {
        setAccount("");
      } else {
        const contas = await provider.send("eth_accounts");
        setWalletEnabled(true);
        if (contas[0]) {
          setAccount(contas[0]);
        }
      }
    };

    run();
  }, [networkId]);

  const handleClickConnect = async () => {
    const contas = await provider.send("eth_requestAccounts");
    if (contas[0]) {
      setAccount(contas[0]);
    }
  };

  const handleClickNetwork = async () => {
    await provider.send("wallet_addEthereumChain", [
      {
        chainId: "0x118",
        chainName: "ZkSync Testnet",
        rpcUrls: ["https://zksync2-testnet.zksync.dev"],
        nativeCurrency: {
          name: "ether",
          symbol: "ETH", // 2-6 characters long
          decimals: 18,
        },
      },
    ]);

    // // check the network
    // const chain = await provider.getNetwork();
    // setNetworkId(chain.chainId)
  };

  return (
    <div>
      {account ? (
        <div className="font-semibold p-2 shadow-md text-gray-300"> You are currently logged in and your wallet is {account}</div>
      ) : (
        <div className="flex flex-row space-x-10">
          <button
            disabled={!walletEnabled}
            onClick={handleClickConnect}
            className="block px-6 py-2 text-center text-white bg-yellow-600 rounded-md disabled:opacity-25 disabled:hover:bg-yellow-600 disabled:hover:text-white font-semibold"
          >
            Connect Wallet
          </button>
          {networkId != 280 && (
            <button
              onClick={handleClickNetwork}
              className="border-2 border-blue-900 bg-blue-900 text-white rounded-md p-2 font-semibold hover:bg-white hover:text-black"
            >
              Click to change network
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;
