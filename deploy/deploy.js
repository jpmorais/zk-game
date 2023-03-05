const {utils, Wallet} = require("zksync-web3")
const {ethers} = require("hardhat")
const {Deployer} = require("@matterlabs/hardhat-zksync-deploy")
require("dotenv").config()

const run = async function(hre) {

    // initialize the Wallet
    const wallet = new Wallet(process.env.PRIVATE_KEY)

    // create a deployer object
    const deployer = new Deployer(hre, wallet)

    // load the Artifacts
    const artifactToken = await deployer.loadArtifact("TokenGame")
    const artifactGame = await deployer.loadArtifact("ZkGame")

    // const depositAmount = ethers.utils.parseEther("0.001")
    // const depositHandle = await deployer.zkWallet.deposit({
    //     to: deployer.zkWallet.address,
    //     token: utils.ETH_ADDRESS,
    //     amount: depositAmount
    // })

    // await depositHandle.wait()

    const instanceZKGame = await deployer.deploy(artifactGame)
    const addressZKGame = instanceZKGame.address

    const instanceToken = await deployer.deploy(artifactToken,[addressZKGame])
    const addressToken = instanceToken.address
    
    // set the minter of the tokens
    await instanceZKGame.setTokenAddr(addressToken)

    // set the first secret number
    await instanceZKGame.setSecretNumber(32)

    console.log(`${artifactToken.contractName} was deployed to ${addressToken}\n${artifactGame.contractName} was deployed to ${addressZKGame}`)
}

module.exports = run
