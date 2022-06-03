// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
// changed pragma solidity version

import "./FCTMaster.sol";

/// right now just an interface with some ideas 
contract revenueManagement
{   
    FCTMaster public parent2; 

    /// this function will be called when someone buys a virtual good or service 
    /// for example, a subscription or a game skin or virtual power up 
    /// money will be send to the contract 
    /// a divyMoney function will be created in child to allocate revenue according to share
    function sendMoneyToContractForGoods(
        string memory serviceType, 
        uint256 _amount
        // some object with some attributes
    ) public payable{ 

    }
}