# Starting the project

To start this project, we will create a new folder named zkGame.

```shell
$ mkdir zkGame
```

To edit the project files, I will use VSCode, however you can use the text editor, or the IDE, which you are more familiar with. If you are using VSCode, you can start it in the root of the project, with the following command.

```shell
$ code zkGame
```

In order to be able to push the project to a public repository such as GitHub, let's start a git project. Right after that, let's start a new node project. You must have Node installed on your system. Otherwise, you can install node by going to https://nodejs.org/.

```shell
$ git init
$ npm init -y
```

We are now ready to install the required dependencies.

# Installing dependencies

This project will consist of two parts: a development environment, where we will use Hardhata to write and deploy the necessary smart contracts. And an application in React, which will be the interface that the user will use to interact with the contracts.

Let's install the dependencies involving Hardhat and the necessary plug-ins for Hardhat to work together with zkSync.

```shell
$ npm install -D @matterlabs/hardhat-zksync-deploy @nomicfoundation/hardhat-toolbox dotenv hardhat zksync-web3 @matterlabs/hardhat-zksync-solc @openzeppelin/contracts @matterlabs/hardhat-zksync-verify @nomiclabs/hardhat-etherscan
```
Let's explain the role of each dependency.

### Dependências instaladas
- **@matterlabs/hardhat-zksync-deploy**. Responsible for deploying to the zkSync network.
- **@nomicfoundation/hardhat-toolbox**. Some useful tools for Hardhat.
- **dotenv**. It will be used to use environment variables in the project.
- **hardhat**. Framework for developing smart contracts.
- **zksync-web3**. SDK for Connecting to zkSync for JavaScript/TypeScript.
- **@matterlabs/hardhat-zksync-solc**. Compiler of contracts that are written in Solidity, targeting zkEVM.
- **@matterlabs/hardhat-zksync-verify**. Used to verify the contract in the block explorer.
- **@nomiclabs/hardhat-etherscan**. Needs to be installed together with hardhat-zksync-verify.
- **@openzeppelin/contracts**. Install smart contract models that we are going to use.

To start a new project in Hardhat, just create a configuration file named `hardhat.config.js` in the root. In this tutorial, we will use JavaScript.

Another option to start a new Hardhat project is to run the command

```shell
$ npx hardhat init
```

And choose the **Create an empty hardhat.config.js** option.

# Configuring Hardhat

Let's now change the hardhat configuration file, `hardhat.config.js`, to the code listed below. 

```javascript
require("@matterlabs/hardhat-zksync-solc")
require("@nomicfoundation/hardhat-toolbox")
require("@matterlabs/hardhat-zksync-deploy")
require("dotenv").config()

module.exports = {
  zksolc: {
    version: "1.3.1",
    compilerSource: "binary",
    settings: {},
  },
  solidity: {
    version: "0.8.17",
  },
  defaultNetwork: "zkTestnet",
  networks: {
    zkTestnet: {
      url: "https://zksync2-testnet.zksync.dev", 
      ethNetwork: process.env.ALCHEMY_API, // or "goerli" to use a default endpoint
      zksync: true,
    }
  }
};
```

Let me explain the config file above. The `zksolc` and `solidity` properties respectively configure the compilers for the zkEVM and the EVM. The `defaultNetwork` property indicates which will be the default network to be used, in this case, zkTestnet. Finally, under `networks`, we configure zkTestnet.

We will use the Goerli network to transfer Ether to zkTestnet. Therefore, we must configure a Goerli endpoint. I'm using a private Alchemy endpoint. In order not to expose my API key, I am using the `dotenv` package.

Thus, it is necessary to create a new configuration file, `.env`, which will contain the environment variables to be used. This file should look like this.

```env
PRIVATE_KEY=<YOUR PRIVATE KEY>
ALCHEMY_API=<ALCHEMY URL WITH KEY>
```

If you don't have an account with Alchemy or another node provider, you can use a public node, or set the `ethNetwork` setting to *'goerli'* to let Hardhat provide a node for you. However, private nodes work better and faster.

## Contratos inteligentes

To start writing our contracts, let's create a folder in the root called `contracts`. In this folder, we will write two smart contracts. A standard **ERC20** token contract and the contract for the guessing game we want to create.

Let's start by creating a Token contract. For this, we will use the openzeppelin contract library, which has secure implementations of several models, such as the ERC20 standard. The code can be found in the listing below.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenGame is ERC20, ERC20Burnable, Pausable, Ownable {

    address public immutable addrGame;
    constructor(address _addrGame) ERC20("Zk Token Game", "ZKTG") {
        addrGame = _addrGame;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == addrGame);
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

We now need a second contract, which will be the contract for our game. The code for this contract can be found in the listing below.

```solidity
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Token.sol";

contract ZkGame {

    address public owner; 
    uint public priceGame = 0.001 ether; // fee to pay the game
    uint public maxNumber = 1000; // Maximum number that can be played.
    uint secretNumber; // The secret number that the player must match.

    address public tokenAddr; // address of the token contract

    event Played(address indexed _player);
    event Won(address indexed _player, uint256 amount);
    event Lost(address indexed _player);

    constructor() {
        owner = msg.sender;
    }    

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function setTokenAddr(address _tokenAddr) public onlyOwner {
        tokenAddr = _tokenAddr;
    }

    function setSecretNumber(uint _number) public onlyOwner {
        secretNumber = _number;
    }

    function changePriceGame(uint _value) public onlyOwner {
        priceGame = _value;
    }

    function changeMaxNumber(uint _value) public onlyOwner {
        maxNumber = _value;
    }


    function playGame(uint _guessNumber) public payable {
        require(msg.value == priceGame, "Please pay the game fee");
        require(_guessNumber <= maxNumber, "Please provide a valid number");
        emit Played(msg.sender);
        if (_guessNumber == secretNumber) {
            uint toTransfer = address(this).balance * 80 / 100;                        
            emit Won(msg.sender, toTransfer);
            (bool success, ) = (msg.sender).call{value: toTransfer}("");
            require(success);
            TokenGame myToken = TokenGame(tokenAddr);
            uint8 decimals = myToken.decimals();
            myToken.mint(msg.sender, 100 * 10 ** decimals);
        } 
        else {
            emit Lost(msg.sender);
        }
    }

}
```

State variables are easy to understand, and most functions are used to change state variables. Let's focus on the playGame function, which is used to play the game. The Played event will always be emitted, as long as the function's requirements are met: the game value is paid and the chosen number is less than or equal to the maximum number. If the attempted number is different from the secret number, the Lost event will be issued.

In case the attempted number is the same as the secret number, an event called Won will be emitted. In this case, 80% of the contract balance will be sent to msg.sender, and 100 tokens from the token contract will be mined to the msg.sender address.


## Compiling the contracts

For a contract to run on zkEVM, it has to be compiled with a compiler developed by zkSync. Solidity is a high-level language for both EVM and zkEVM, however the compiled code (bytecode) of both is different. To compile the contract for zkEVM, just run the following command.

```shell
$ npx hardhat compile
```

Artifacts such as the bytecode and ABI of the contracts will be stored in the `artifacts-zk` folder that is created automatically, along with the `cache-zk` folder. If you need to recompile the contract, you must delete these folders.

## Deploy on testnet

Deploy files must be placed in the `Deploy` folder. I'll start by showing you the code for the deploy, in JavaScript, and then I'll explain it in more detail.

```JavaScript
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

    // transfer tokens to the testnet
    const depositAmount = ethers.utils.parseEther("0.01")
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: utils.ETH_ADDRESS,
        amount: depositAmount
    })

    await depositHandle.wait()

    // Deploy the game contract and get the address
    const instanceZKGame = await deployer.deploy(artifactGame)
    const addressZKGame = instanceZKGame.address

    // Deploy the token contract with the game contract address as the constructor argument. 
    // This is so that the game contract address can mint tokens to pay the winners.
    const instanceToken = await deployer.deploy(artifactToken,[addressZKGame])
    const addressToken = instanceToken.address
    
    // The token contract address must be registered in the game contract.
    await instanceZKGame.setTokenAddr(addressToken)

    // Choose the secret number.
    await instanceZKGame.setSecretNumber(32)

    console.log(`${artifactToken.contractName} was deployed to ${addressToken}\n${artifactGame.contractName} was deployed to ${addressZKGame}`)
}

module.exports = run
```

To deploy the contracts and initialize the necessary values, you need to run the command below.

```shell
npx hardhat deploy-zksync
```

The address of both contracts will be displayed in the terminal: the token contract and the game contract.

# Verifying the contract

To verify the contract, we have two options. Either do it manually or using a plug-in for Hardhat. Let's first see the manual solution. The first step is to flatten the contract. This can be done using the command below.

```shell
$ npx hardhat flatten > flattened.sol
```

It will put all the contracts in the `flattened.sol` file. We can use this file when verifying the contract in the block explorer, but we need to delete the multiple licenses contained in the contract. File explorer will complain if more than one license is declared.

To verify a contract in the block explorer, just go to `https://explorer.zksync.io/`, find the contract by its address, click on the Contract option and on the verify option.

It is much simpler to verify the contract through the plugin offered by Matter labs, **@matterlabs/hardhat-zksync-verify**. To verify the game contract, just run the command below, replacing the contract address with your contract address.

```shell
$ npx hardhat verify --network zkTestnet <Address_ZkGame>
```

Note that it was not necessary to indicate which contract is being verified. The plug-in will check all contracts present, if there are any of them whose bytecode is identical to the bytecode located at the given address.

To verify the token contract, the command is similar. However, the token contract has an argument that must be passed to the constructor. Therefore, this argument must be indicated at the time of verification. Run the command below, replacing both addresses.

```shell
$ npx hardhat verify --network zkTestnet <Address_Token> <Address_ZkGame>
```
