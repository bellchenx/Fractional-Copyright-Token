// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FCTMaster.sol";

/// add non-reentrant modifier
contract child is ERC1155, Ownable {
   

    uint public constant myToken = 0;

    string  public myName;
    string  public mySymbol;
    string public myURI; 
    uint256 public myAmount;


    // the account of the person who minted the smart contract and who can be paid for coins and services 
    address payable public myAccount;
    uint256 public IDForContract;

    // creating array of same account to use balance of batch function
    // not implemented yet 
    address[] public arrayOfSameAddress; 
    uint256[] public IDSOwned;

    FCTMaster public parent;

    constructor(
        address payable _account,
        string memory _name, 
        string memory _symbol,
        uint _id,
        string memory _URI, 
        uint256 _amount
    )
        ERC1155(_URI)
    {
        myName = _name;
        mySymbol = _symbol;
        myAmount = _amount; 
        myAccount = _account;
        IDForContract = _id; 
        
        _setURI(_URI);
        myURI = _URI;
        // minting a coin at chosen URI with chosen ID and no extra data 
        // can send the same same URI each time and just change the ID 
        // right now the smart contract is what owns the token
        _mint(address(this), _id, _amount, "");
    }

    /// fallback function for each version of the child contract  
    /// used to recieve funds to the contract 
    // can I make the fallback function versatile to allow for multiple coin types to be sent? 
    event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// function idea not complete: 
    /// this function will send revenue to addresses according to percentage of tokens owned 
    /// need to optimize due to gas fees 
    function sendRevenue(
        bool wasWithdrawnAllready, 
        uint256 amountOfTokens, 
        address fromWhichContract,
        address to 
    ) public payable onlyOwner {
        // check if to -> correct comntract address 
        // verify amount of tokens is a trustable number 
        // make sure that the money wasnt allready withdrawn to prevent reentrancy
    }

    /// This function is only designated for FCT Master. This function will be used to allocated tokens according to linked list 
    /// when the token is first created
    /// FCTMaster is the owner of this smart contract so it is the only one that can call it 
    /// should be sending from one smart contract to another one 
    /// @param from: FCTMaster
    /// @param to: address of this contract
    /// @param id: tokenID for the tokens to transfer 
    /// @param amount: amount of tokens to transfer based on linkedList
    function transferTokensToChildNotPayable(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
        ) public onlyOwner  { 
            require(address(to) != address(0), "Cannot send to zero address"); 
            require(address(from) != address(0), "Cannot send from zero address");
            // max ID is a contract vairiable in FCTMaster.sol
            uint256 maxID = parent.getMaxID();
            require(id <= maxID, "The ID being sent has not yet been created");
            require(amount <= myAmount, "The amount requsted to transfer is greater than the amount in circulation");

            safeTransferFrom(from, to, id, amount, data);

        }
    
    /// this function is intended for payable transfers between users 
    /// from transfers to then to pays from 
    /// @param fromUser: the user transfering tokens 
    /// @param toContract: the contract to send tokens to 
    /// @param id: the token id from FCTMaster 
    /// @param amount: the amount of tokens to be sent
    /// @param gasAmount: how much gas do you want to spend to 
    function transferTokensToChildPayable(
        address payable fromUser,
        address toContract, 
        uint256 id,
        uint256 amount,
        uint256 gasAmount,
        bytes memory data
    ) public payable { 
        require(address(toContract) != address(0), "Cannot send to zero address"); 
        require(address(fromUser) != address(0), "Cannot send from zero address");
        uint256 maxID = parent.getMaxID();
        require(id <= maxID, "The ID being sent has not yet been created");
        require(amount <= myAmount, "The amount requsted to transfer is greater than the amount in circulation");
        require(parent._childAddress2UserAddress(toContract) != address(0), "There is not an payable address to send money");
        // check that to user is an address payable 

        // contract recieves the tokens 
        safeTransferFrom(fromUser, toContract, id, amount, data);

        // use map _childAddress2UserAddress to determine the address paying fromUser 
        // address toAddress = parent._childAddress2UserAddress(toContract);

        // the person who sent the tokens recieves the amount 
        // transfer functionality
        
        fromUser.transfer(amount);

        // other option is to use call function to send ether 
        // more versatile but more dangerous for reentrancy attack 
        // is deprecated, need to change syntax 

        // (bool success, ) = fromUser.call.value(amount).gas(gasAmount);


    }

    /// function that allows FCTMaster to transfer "ownership" to the 
    /// creator of this contract
    function transferOwnershipToCreator() public onlyOwner { 
        transferOwnership(myAccount);
    }

    /// get the address of the smart contract to send tokens to 
    function getAddress() public view onlyOwner returns(address) { 
        return address(this);
    }

    /// ability to access URI from another contract 
    function getURI() public onlyOwner returns(string memory) { 
        return myURI;
    }
}