import React, { useEffect, useState, useRef } from "react";
import { Web3Provider } from "zksync-web3";
import { ethers } from "ethers";
import Modal from "./Modal";

const Play = () => {
  const [number, setNumber] = useState();
  const [showModal, setShowModal] = useState(false)
  const [typeModal, setTypeModal] = useState('')

  const ABI = ["function playGame(uint _guessNumber) public payable"];
  const address = "0xDa781f0eb9eE1C799FAE73B4B0AaA0F41636aC70";

  const refInput = useRef("");

  useEffect(() => {
    const initialNumber = refInput.current.value;
    setNumber(initialNumber);
  }, []);

  const handleClick = async () => {
    setTypeModal('playing')
    setShowModal(true)
    const provider = new Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const zkGame = new ethers.Contract(address, ABI, signer);
    let retorno;
    try {
      retorno = await zkGame.playGame(number, {
        value: ethers.utils.parseEther("0.001"),
      });
      await retorno.wait();
    } catch(error) {
      setTypeModal('tryagain')
      setShowModal(true)
    }

    console.log(retorno)
    const receipt = await provider.getTransactionReceipt(retorno.hash);
    const logs = receipt.logs;
    console.log(receipt.logs);

    logs.forEach((item) => {
      item.topics.forEach((topic) => {
        if (
          topic ==
          "0x85a3875b3a6e376ada779e06d99beed4fbf471788c1d2719f27718958bfc826b"
        ) {
          setTypeModal('lost')
        }
        if (
          topic ==
          "0x8b01f9dd0400d6a1e84369a5fb8f6033934856ffa8ebadd707dca302ab551695"
        ) {
          setTypeModal('won')
        }
      });
    });
  };

  const handleChange = (e) => {
    setNumber(e.target.value);
  };

  return (
    <>
      {showModal && <Modal type={typeModal} setShowModal={setShowModal} />}
      <div className="flex flex-col space-y-3 w-1/2">
        <p className="text-gray-200">Your luck number is {number}</p>
        <input
          ref={refInput}
          type="range"
          className="transparent h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
          min="1"
          max="1000"
          id="customRange"
          onChange={(e) => handleChange(e)}
        />
        <button
          onClick={handleClick}
          className="block px-6 py-2 text-center text-white bg-yellow-600 rounded-md"
        >
          Play the game
        </button>
      </div>
    </>
  );
};

export default Play;
