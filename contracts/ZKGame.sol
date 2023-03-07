//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Token.sol";

contract ZkGame {

    address public owner; 
    uint public priceGame = 0.001 ether; // fee to pay the game
    uint public maxNumber = 1000;
    uint secretNumber;

    address public tokenAddr; // address of the token

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