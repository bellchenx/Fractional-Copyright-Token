// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// changed pragma solidity version

import "./child.sol";
import "./linkedList.sol";
import "./revenueManagement.sol";


contract FCTMaster is child, linkedList, revenueManagement
{
   
    // address -> ID 
    mapping (address => uint256) public _address2ID;

    // ID -> address
    mapping (uint256 => address) public _ID2Address;


    // token IDs -> URI
    // can I use bytes instead or bytes 32? area for reasarch
    mapping (uint256 => string) private _ID2uri;

    // address -> coinName 
    mapping (address => string) public _address2CoinName;

    // address of child -> symbol
    mapping (address => string) public _address2Symbol;

    // address of child -> address of user 
    mapping (address => address) public _childAddress2UserAddress;


    FCTMaster public myParent;
    child public myChild;

    uint256 myID = 0;
    string public sampleURI = "https://bafkreid6l43kbes7i4dupnuopooe6fulym7ttkpbs2yvnvxwki3fj7wxp4.ipfs.nftstorage.link/{id}";
    string public tempURI; 

    address payable STAccount;
    // default constructor is needed to create the contract
    constructor(
    ) child(STAccount, "ST Platform Coin", "SPC", 0, myURI, 0)
    { 
    }

    function mintToken(address payable account, uint256 amount, string memory _name, string memory _symbol)
        public
    {   
        // incrementing the token ID
        myID++; 
        // creating a new child contract with function arguements
        myChild = new child(account, _name, _symbol, myID, sampleURI, amount);
        _address2ID[address(myChild)] = myID; 
        _ID2Address[myID] = address(myChild); 
        // accessing the actual URI from inherited child contract 
        tempURI = getURI();
        // setting token URI in mapping
        setTokenUri(myID, tempURI);
        tempURI = "";

        _address2CoinName[address(myChild)] = _name; 
        _address2Symbol[address(myChild)] = _symbol;
        _childAddress2UserAddress[address(myChild)] = account;

    }

    function setTokenUri(uint256 tokenId, string memory uri) public { 
        _ID2uri[tokenId] = uri; 
    }

    function getMaxID() public returns(uint256) { 
        return myID;
    }
    
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
    {
        _mintBatch(to, ids, amounts, data);
    }

    function setURI(string memory newuri) public {
        _setURI(newuri);
    }



    // adding a number of tokens from another ERC token to 
    // another object batch and taking away from the other contract 
    function addOtherTokenToBatch(
        address childContract,
        uint256 tokensToTransfer
    )
    public   
    {

    }

    
}

