import React, { useEffect, useState } from 'react'
import Wallet from './components/Wallet'
import User from "./components/User"
import Play from './components/Play'


const App = () => {

  const [account, setAccount] = useState('')
  const [number, setNumber] = useState('')
  const [network, setNetwork] = useState('')

  return (
    <div className='container mx-auto flex flex-col justify-center items-center min-h-screen space-y-3'>
        <Wallet account={account} setAccount={setAccount} />
        {account ? (
            <>
                <User account={account} />
                <Play  />
            </>
        ) : (
            <p>Not connected</p>
        )}
    </div>
  )
}

export default App