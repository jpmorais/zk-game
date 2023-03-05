# Starting the project

Para começar esse projeto, iremos criar uma nova pasta de nome zkGame.

```shell
$ mkdir zkGame
```

Para editar os arquivos do projeto, irei utilizar o VSCode, porém você pode utilizar o editor de textos, ou a IDE, que estiver mais familiarizados. Se você estiver utilizando o VSCode, pode iniciá-lo já na raiz do projeto, com o seguinte comando.

```shell
$ code zkGame
```

Para poder colocar o projeto em um repositório, como GitHub, vamos iniciar um projeto git. Logo após, vamos começar um novo projeto node. Eu espero que vocês tenham nodeJS instalado no sistema. Caso contrário, é possível instalar o node acessando https://nodejs.org/

```shell
$ git init
$ npm init -y
```

Agora estamos prontos para instalar as dependências necessárias.

# Installing dependencies

Esse projeto irá constar de duas partes. Iremos começar uma nova aplicação utilizando Hardhat, para escrever, testar e fazer o deploy dos contratos inteligentes necessários. E uma aplicação em React, que será a interface que o usuário irá utilizar para interagir com os contratos.

Vamos instalar as dependências envolvendo o Hardhat e os plug-ins necessários para que o Hardhat trabalhe em conjunto com a zkSync.

```shell
$ npm install -D @matterlabs/hardhat-zksync-deploy @nomicfoundation/hardhat-toolbox dotenv hardhat zksync-web3 @matterlabs/hardhat-zksync-solc @openzeppelin/contracts @matterlabs/hardhat-zksync-verify @nomiclabs/hardhat-etherscan
```
Vamos explicar o papel de cada dependência

### Dependências instaladas
- **@matterlabs/hardhat-zksync-deploy**. Responsável por fazer o deploy na rede zkSync
- **@nomicfoundation/hardhat-toolbox**. Plug-in do harhat, inclui ethers.
- **dotenv**. Será utilizado para armazenar variáveis de ambiente.
- **hardhat**. Framework para o desenvolvimento de contratos inteligentes.
- **zksync-web3**. SDK de conexão com a rede zkSync para JavaScript/TypeScript.
- **@matterlabs/hardhat-zksync-solc**. Compilador de contratos escritos em Solidity, mirando a zkEVM.
- **@matterlabs/hardhat-zksync-verify**. Usado para verificar o contrato no explorador de blocos.
- **@nomiclabs/hardhat-etherscan**. Precisa ser instalado juntamente com hardhat-zksync-verify.

Para começar um novo projeto no Hardhat, basta criar um arquivo de configuração de nome `hardhat.config.js`. Neste tutorial, não iremos utilizar TypeScript.

Outra opção para começar um novo projeto Hardhat e executar o comando

```shell
$ npx hardhat init
```

E escolher a opção **Create an empty hardhat.config.js**.

# Configurando o Hardhat

Vamos agora alterar o arquivo de configuração do hardhat, `hardhat.config.js`, para como podemos ver abaixo.  

```json
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

Deixe-me explicar a configuração acima. As propriedades `zksolc` e `solidity` configuram, respectivamente, os compiladores para a zkEVM e para a EVM. A propriedade `defaultNetwork` indica qual será a rede padrão a ser utilizada, no caso, zkTestnet. Finalmente, em `networks`, configuramos a zkTestnet.

Iremos utilizar a rede Goerli para transferir Ether para a zkTestnet. Por isso, devemos configurar um endpoint da Goerli. Eu estou utilizando um endpoint privado da Alchemy, após criar uma conta. Para não expor minha chave da API, estou utilizando o pacote `dotenv`.

Assim, é preciso criar um novo arquivo de configuração, `.env`, que irá conter as variáveis de ambiente a serem utilizadas. Inicialmente, este arquivo deve ficar da seguinte forma.

```env
ALCHEMY_API=<ALCHEMY URL WITH KEY>
```

Se você não tiver uma conta na Alchemy em outro provedor de nós, você pode utilizar um nó público, ou deixar *'goerli'* para que o Hardhat providencie um nó para você. No entanto, nós privados funcionam melhor e com mais rapidez.

Está na hora de começar a escrever nossos contratos.

# Contratos inteligentes

Para começar a escrever nossos contratos, vamos criar uma pasta na raiz chamada de `contracts`. Nesta pasta, iremos escrever 2 contratos inteligentes. Um contrato de token padrão ERC20 e o contrato do jogo, que irá interagir com o contrato de token.

Vamos começar criando um contrato de Token. Para isso, vamos utiliazar a biblioteca de contratos da openzeppelin, que possui implementações seguras de diversos modelos, como o padrão ERC20.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Burnable, Pausable, Ownable {
    constructor() ERC20("MyToken", "MTK") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
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

Precisamos agora de um segundo contrato, que irá ser o contrato de nosso jogo.

```solidity
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Token.sol";

contract ZkGame {

    address public owner; 
    uint public priceGame = 0.001 ether; // fee to pay the game
    uint public maxNumber = 100;

    address public tokenAddr; // address of the token

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

    function changePriceGame(uint _value) public onlyOwner {
        priceGame = _value;
    }

    function changeMaxNumber(uint _value) public onlyOwner {
        maxNumber = _value;
    }


    function playGame(uint _guessNumber) public payable returns (uint) {
        require(msg.value == priceGame, "Please pay the game fee");
        require(_guessNumber < maxNumber, "Please provide a valid number");
        uint secretNumber = (block.timestamp * block.number) % maxNumber;
        if (_guessNumber == secretNumber % maxNumber) {
            payable(msg.sender).transfer(address(this).balance * 80 / 100);
            TokenGame myToken = TokenGame(tokenAddr);
            myToken.mint(msg.sender, 100);
        } 
        return secretNumber % maxNumber;

    }

}
```

## Compilando os contratos

Para que um contrato seja executado na zkEVM, ele tem que ser compilado com um compilador próprio. Solidity é uma linguagem de alto-nível tanto para a EVM quanto para a zkEVM, porém o código compilado (bytecode) de ambas é diferente.

Já configuramos o Hardhat devidamente, em seu arquivo de configuração `hardhat.config.js`. Agora precisamos apenas executar o comando abaixo.

```shell
$ npx hardhat compile
```

Os artefatos como o bytecode e a ABi dos contratos poderão ser encontrados na pasta `artifacts-zk` que é criada automaticamente, juntamente com a pasta `cache-zk`.

## Deploy na rede de testes

Os arquivos de deploy devem ser colocado na pasta `Deploy`. Vou começar mostrando o código para o deploy, em JavaScript, e depois irei explicá-lo em maiores detalhes.

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

    const depositAmount = ethers.utils.parseEther("0.001")
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: utils.ETH_ADDRESS,
        amount: depositAmount
    })

    await depositHandle.wait()

    const instanceToken = await deployer.deploy(artifactToken)
    const instanceZKGame = await deployer.deploy(artifactGame)

    const addressToken = instanceToken.address
    const addressZKGame = instanceZKGame.address

    console.log(`${artifactToken.contractName} was deployed to ${addressToken}\n${artifactGame.contractName} was deployed to ${addressZKGame}`)
}

module.exports = run
```

É preciso executar o comando

```shell
```

# Verificando o contrato

Para verificar o contrato, temos duas opções. Ou fazer isso manualmente ou utilizando um plug-in para o Hardhat. Vamos primero ver a solução manual. O primeiro passo é flatten. Isso pode ser feito através do comando 

```shell
$ npx hardhat flatten > flattened.sol
```

Ele irá colocar todos os contratos no arquivo `flattened.sol`. Podemos utilizar este arquivo como um todo na hora da verificação, porém precisamos excluir as múltiplas indicações de licença presentes.

...

Utilizando o plug-in

```shell
$ npx hardhat verify --network zkTestnet <Address_Token> <Address_ZkGame>
```

```shell
$ npx hardhat verify --network zkTestnet <Address_ZkGame>
```

## Criando a Interface com o usuário

```shell
$ npm create vite client -- --template react
```

```shell
$ npm i zksync-web3 ethers@5
```
