import React, { useState } from "react";
import { Web3Provider } from "zksync-web3";
import {ethers} from 'ethers'

const Play = () => {

  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')

  const ABI = ["function playGame(uint _guessNumber) public payable"];

  const address = "0xd0c13b237A1FDc70dd50418Ec796D1319B6eC7a3";

  const handleClick = async () => {
    const provider = new Web3Provider(window.ethereum)
    const signer = await provider.getSigner()

    const zkGame = new ethers.Contract(address, ABI, signer)
    const retorno = await zkGame.playGame(number, {value: ethers.utils.parseEther("0.001")})
    await retorno.wait()

    console.log(`Hash ${retorno.hash}`)

    const receipt = await provider.getTransactionReceipt(retorno.hash)
    const logs = receipt.logs
    console.log(receipt.logs)

    logs.forEach(item => {
      item.topics.forEach(topic => {
        if (topic == "0x85a3875b3a6e376ada779e06d99beed4fbf471788c1d2719f27718958bfc826b") {
          setMessage("You lost =(")
        }
        if (topic == "0x8b01f9dd0400d6a1e84369a5fb8f6033934856ffa8ebadd707dca302ab551695") {
          const valor = item.data
          setMessage(`You won ${ethers.utils.formatEther(valor)} eth`)

        }
      })
    })

  };

  return (
    <div className="flex flex-col space-y-3">
      <label>Choose your luck number:</label>
      <input
        value={number}
        type="number"
        onChange={(e) => setNumber(e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      <button
        onClick={handleClick}
        className="border-2 border-red-900 bg-red-900 text-white rounded-md p-2 font-semibold hover:bg-white hover:text-black"
      >
        Play the game
      </button>
      <h2>{message}</h2>
    </div>
  );
};

export default Play;
