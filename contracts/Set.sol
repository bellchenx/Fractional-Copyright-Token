// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

//Source: https://ethereum.stackexchange.com/questions/69672/std-set-in-solidity

// Set implementation in solidity that does not have all features yet
contract Set {

    struct set {
        uint256[] values;
        mapping (uint256 => bool) isInSet;
    }

    set mySet;

    function add(uint256 a) public {
        // if a is not in the set
        if (!mySet.isInSet[a]) {
            mySet.isInSet[a] = true;
            // add it to the set which is an array
            mySet.values.push(a);
        }
    }

    // change permissions later
    // clearing the values in the set to use somewhere else 
    function clearSet() public { 
        for (uint256 i = 0; i < mySet.values.length; i++) { 
            mySet.values.pop();
        }
    }
}
