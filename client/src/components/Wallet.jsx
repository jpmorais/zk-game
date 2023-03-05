import React, { useEffect } from 'react'
import {ethers} from 'ethers'

const Wallet = ({account, setAccount}) => {
  

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    useEffect(() => {
        
        const run = async () => {
            const contas = await provider.send("eth_accounts")                        
            if (contas[0]) {
                setAccount(contas[0]);
            }
        }

        run()

    },[])

    const handleClick = async () => {

        const contas = await provider.send("eth_requestAccounts")
        if (contas[0]) {
            setAccount(contas[0])
        }

    }
  
    return (
    <div>
        {
            account ? (
                <div className='font-semibold p-2 shadow-md'>
                    {account}
                </div>
            ) 
            : (
                <>
                    <button onClick={handleClick} className='border-2 border-red-900 bg-red-900 text-white rounded-md p-2 font-semibold hover:bg-white hover:text-black'>Connect Wallet</button>
                </>
            )
        }
    </div>
  )
}

export default Wallet