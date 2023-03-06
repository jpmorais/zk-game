import React from "react";
import zksync from '../assets/zksync.png'


export default function Header() {
    return (
        <div>
            <section className="container items-center px-4 pb-12 mx-auto mt-20 lg:flex md:px-40">
                <div className="flex-1 space-y-4 sm:text-center lg:text-left">
                    <h1 className="text-4xl font-bold text-yellow-500">
                        Welcome to ZkGame
                    </h1>
                    <p className="max-w-xl leading-relaxed text-gray-300 sm:mx-auto lg:ml-0">
                    The game that can make you a millionaire. Just hit the lucky number and enjoy your new life.                    </p>
                    <div className=" text-gray-400">
                        <h4>Rules:</h4>
                        <ul>
                            <li>You need to pay 0.001 Ether to play the game.</li>
                            <li>Choose a number between 1 and 1,000.</li>
                            <li>If you hit the number, you will earn 80% of the pot and 100 tokens.</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <img
                        src={zksync}
                        style={{width: "412px"}}
                        className="w-full mx-auto mt-6 sm:w-10/12 lg:w-full"
                    />
                </div>
            </section>
        </div>
    );
}