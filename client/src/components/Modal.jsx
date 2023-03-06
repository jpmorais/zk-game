import React from "react";
import lottiePlay from "../assets/lottery.json";
import lottieSad from "../assets/sad.json";
import lottieWin from "../assets/win.json";

import Lottie from "react-lottie-player";

const Modal = ({ type, setShowModal }) => {
  const handlePlayAgain = () => {
    setShowModal(false);
  };

  return (
    <div
      id="popup-modal"
      tabindex="-1"
      className="fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full flex justify-center items-center"
    >
      <div className="relative w-full h-full max-w-md md:h-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 p-11">
          {type == "playing" && (
            <div className="flex flex-row space-x-6">
              <Lottie
                loop
                animationData={lottiePlay}
                play
                style={{ width: 150, height: 150 }}
                className="w-1/2"
              />
              <h2 className="text-2xl font-semibold text-slate-800 w-1/2">
                You are playing! The greatest luck in the world to you!
              </h2>
            </div>
          )}
          {type == "lost" && (
            <div className="flex flex-row space-x-6">
              <Lottie
                loop
                animationData={lottieSad}
                play
                style={{ width: 150, height: 150 }}
                className="w-1/2"
              />
              <div className="text-2xl font-semibold text-slate-800 w-1/2 space-y-3">
                <h2>You didn't get the number right. Better luck next time.</h2>
                <button className="block px-6 py-2 text-center text-white bg-yellow-600 rounded-md" onClick={handlePlayAgain}>Play again?</button>
              </div>
            </div>
          )}
          {type == "won" && (
            <div className="flex flex-row space-x-6">
              <Lottie
                loop
                animationData={lottieWin}
                play
                style={{ width: 150, height: 150 }}
                className="w-1/2"
              />
              <h2 className="text-2xl font-semibold text-slate-800 w-1/2">
                Congratulations! You got the number right! Now enjoy your
                victory!{" "}
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
