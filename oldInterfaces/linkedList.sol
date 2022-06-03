// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
// changed pragma solidity version


/// FCTMaster will inherit this data information 
contract linkedList
{   
    uint256 peopleInList = 1; 

    // this struct will track all of the ST world elements used from 
    // other people using their contract address
    struct addedElementFromOtherPerson {
        address accountOfOwner;
        bool willTransferTokensByPercentage;
        uint256 percentOfTokensToTransfer;
        bool transferedMoneyDirectly;
        uint256 paymentAmount; 
        bool WillTransferANumberOfToekns; 
        uint256 numberOfTokensToTransfer;
    }

    /// creating a 2D mapping. whichPerson -> (elementsAddedCount for this person-> addedElementFromOtherPerson)
    mapping (uint256 => mapping(uint256 => addedElementFromOtherPerson)) public _contributedElements;

    /// add an element to contributedElements map to keep track of contributors 
    /// make sure that only FCTMaster can acecess later
    function addElementToMap(uint256 _elementsAddedCount) public {
        /// implment this later 
    }
}