import { Web3Provider } from "zksync-web3";
import {ethers} from 'ethers'
import React, { useEffect, useState } from "react";

const User = ({ account }) => {
  const [balance, setBalance] = useState("");
  const [tokens, setTokens] = useState("")

  const addressToken = "0x82854bEE094a0d17ac0e0cDbba3158FdEa64019d"
  const ABI = [
    "function balanceOf(address) public view returns (uint256)"
  ]

  useEffect(() => {
    const run = async () => {
      const provider = new Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const balance = await signer.getBalance();
      setBalance(ethers.utils.formatEther(balance));

      const contractToken = new ethers.Contract(addressToken, ABI, provider)

      const balanceTokens = await contractToken.balanceOf(await signer.getAddress())
      setTokens(ethers.utils.formatEther(balanceTokens))
    };

    run();
  }, []);

  return <div className="font-semibold p-2 text-white"> Your current balance is {balance} eth and {tokens} tokens. Want to become a millionaire? Play the game!</div>;
};

export default User;
