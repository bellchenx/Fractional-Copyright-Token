// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

//Source: https://ethereum.stackexchange.com/questions/69672/std-set-in-solidity

// Set implementation in solidity that does not have all features yet
contract Set {

    struct set {
        uint256[] values;
        mapping (uint256 => bool) isInSet;
    }

    // id -> set 
    mapping (uint256 => set) _id2Set;

    function add(uint256 id, uint256 addToSet) public {
        // if a is not in the set
        if (!_id2Set[id].isInSet[addToSet]) {
            _id2Set[id].isInSet[addToSet] = true;
            // add it to the set which is an array
            _id2Set[id].values.push(addToSet);
        } else { 
            revert("A value you are inputting indicates a break of set.");
        }
    }

    // change permissions later
    // clearing the values in the set to use somewhere else 
    function clearSet(uint256 id) public { 
        for (uint256 i = 0; i < _id2Set[id].values.length; i++) { 
            _id2Set[id].values.pop();
        }
    }
}
