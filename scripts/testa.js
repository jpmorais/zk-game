const {ethers} = require("hardhat")
require("dotenv").config()

const run = async () => {

    const provider = new ethers.providers.JsonRpcProvider("https://zksync2-testnet.zksync.dev")
    let signer = new ethers.Wallet(process.env.PRIVATE_KEY)
    signer = signer.connect(provider)

    const address = "0xE53538951EF944740fF4E14c853A4a5e341b370a"
    const ABI = [
        "function tokenAddr() public view returns (address)",
        "function playGame(uint _guessNumber) public payable",
        "function changeMaxNumber(uint _value) public",
        "function maxNumber() public view returns(uint)"
    ]

    const contratoJogo = new ethers.Contract(address, ABI, signer)

    // const addrToken = await contratoJogo.tokenAddr()
    // console.log(addrToken)


    const playGame = await contratoJogo.playGame(23, { value: ethers.utils.parseUnits("0.001", "ether") })
    await playGame.wait()

    console.log(playGame)
}

run()