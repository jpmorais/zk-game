import { Web3Provider } from "zksync-web3";
import {ethers} from 'ethers'
import React, { useEffect, useState } from "react";

const User = ({ account }) => {
  const [balance, setBalance] = useState("");

  useEffect(() => {
    const run = async () => {
      const provider = new Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const balance = await signer.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    };

    run();
  }, []);

  return <div className="font-semibold p-2"> Your current balance is {balance} eth.</div>;
};

export default User;
