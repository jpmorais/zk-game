import React, { useEffect, useState } from "react";
import Wallet from "./components/Wallet";
import User from "./components/User";
import Play from "./components/Play";
import Header from "./components/Header";

const App = () => {
  const [account, setAccount] = useState("");
  const [number, setNumber] = useState("");
  const [network, setNetwork] = useState("");

  return (
    <div className="bg-slate-900">
      <div className="container mx-auto flex flex-col justify-center items-center min-h-screen space-y-3">
        <Header />
        <Wallet account={account} setAccount={setAccount} />
        {account ? (
          <>
            <User account={account} />
            <Play />
          </>
        ) : (
          <p className="text-gray-300">You're not connected =(</p>
        )}
      </div>
    </div>
  );
};

export default App;
