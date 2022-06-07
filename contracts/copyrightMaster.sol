// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

// Importing interface for implementation specific to ST Platform
import "../interfaces/ICopyrightMaster.sol";

// marked as abstracted until all functions are implemented
abstract contract copyrightMaster is ICopyrightMaster {
    address admin;

    // tokenID -> token struct for getting token information
    mapping(uint256 => Token) _tokenIDToTokenStruct;

    // tokenID -> array of edge struct where these are the edges associated with _tokenID 
    mapping(uint256 => Edge[]) _tokenIDToEdges;

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Is there any way to make this function internal even though it is
    // an interface?

    /**
    @dev checks if two 'token' sets are subsets of one another. 
     */
    function isSubset(uint256 _tokenID, Token[] memory parentTokenIDs)
        public
        pure
        returns (bool)
    {
        uint256 length = parentTokenIDs.length;
        if (length == 0) return false;
        else {
            for (uint256 i = 0; i < length; i++) {
                if (parentTokenIDs[i].id == _tokenID) return true;
            }
            return false;
        }
    }

    // note that timestamp is not needed. You fetch timestamp in the function
    function insertToken(
        uint256 _tokenID,
        uint256 _weight
    ) 
        public 
        override
        onlyAdmin {
        require(_tokenID != 0, "The token ID cannot be zero");
        require(
            _tokenIDToTokenStruct[_tokenID].id == 0,
            "ID has allready been added to graph."
        );
        Token memory token;
        token.id = _tokenID;
        token.weight = _weight;
        token.timeStamp = block.timestamp;
        _tokenIDToTokenStruct[_tokenID] = token;
    }

    /**
    Make sure admin contains the address of the smart contract 
     */
    function insertEdges(Token[] memory parentTokenIDs, Token memory token)
        override
        public
        onlyAdmin
    {
        require(token.id != 0, "The token ID cannot be zero");
        require(
            _tokenIDToTokenStruct[token.id].id != 0,
            "ID has not been added to the graph."
        );
        bool isSub = isSubset(token.id, parentTokenIDs);
        require(!isSub, "TokenID is a subset of parentTokenIDs");
        uint256 length = parentTokenIDs.length;
        // if there are no parent token IDs
        if (length == 0) return;
        // incrementing through amt of parent token IDs
        for (uint256 i = 0; i < length; i++) {
            Edge memory edge;
            uint256 parentTokenID = parentTokenIDs[i].id;
            edge.from = parentTokenID;
            // loop invariant - can I just update edge each time? Is that more effiecient?
            // create an update edge function
            edge.to = token.id;
            edge.weight = token.weight;
            // registering an edge with token.ids
            _tokenIDToEdges[token.id].push(edge);
        }
    }

    function changeTokenWeight(Token memory token, uint256 newWeight)
        override
        public
        onlyAdmin
    {
        require(
            _tokenIDToTokenStruct[token.id].id != 0,
            "Token does not exist in weighted graph"
        );
        _tokenIDToTokenStruct[token.id].weight = newWeight;
    }

    // intended to also remove edges by calling another function in this one
    // should I make it seperate instead? ask Bell
    // Need to change the logic for this function 
    function removeToken(
        Token[] memory parentsOfTokenRemoved,
        // change to tokenID, not Token object
        uint256 idToRemove,
        Token[] memory childrenOfTokenRemoved
    ) 
        external
        override
        onlyAdmin {
        // deleting the token struct for this token
        delete _tokenIDToTokenStruct[idToRemove];
        // leaf token
        // need to delete edges from parentsOfTokenRemoved to tokenToRemove
        if (childrenOfTokenRemoved.length == 0) {
            removeCertainEdges(parentsOfTokenRemoved, idToRemove);
        }
        // root token
        else if (parentsOfTokenRemoved.length == 0) {
            // removing all edges in front of idToRemove
            removeAllEdges(idToRemove);
        } else {
            // removing all edges in front of token to remove
            removeAllEdges(idToRemove);
            // removing the edges behind token to remove
            removeCertainEdges(parentsOfTokenRemoved, idToRemove);

            // making the new edge connections back
            for (uint256 i = 0; i < childrenOfTokenRemoved.length; i++) {
                // inserting edges for each parent to each child of the token removed
                insertEdges(parentsOfTokenRemoved, childrenOfTokenRemoved[i]);
            }
        }
    }

    // deleting edges attributed to a certain tokenID
    function removeAllEdges(uint256 idToRemove) 
        public 
        override
        onlyAdmin 
    {
        delete _tokenIDToEdges[idToRemove];
    }

    function removeCertainEdges(
        Token[] memory parentsOfTokenRemoved,
        uint256 idToRemove
    ) 
        public 
        onlyAdmin 
    {
        uint256 parentLength = parentsOfTokenRemoved.length;
        for (uint256 i = 0; i < parentLength; i++) {
            uint256 parentTokenID = parentsOfTokenRemoved[i].id;
            uint256 edgeArrayLength = _tokenIDToEdges[parentTokenID].length;
            for (uint256 j = 0; j < edgeArrayLength; j++) {
                uint256 toID = _tokenIDToEdges[parentTokenID][j].to;
                // if the destination is the ID to be deleted
                if (toID == idToRemove) {
                    // https://blog.finxter.com/how-to-delete-an-element-from-an-array-in-solidity/#:~:text=We%20can%20create%20a%20function,using%20the%20pop()%20method.
                    // firstArray[index] = firstArray[firstArray.length - 1];
                    // moving the element to delete to the end of the array
                    _tokenIDToEdges[parentTokenID][j] = _tokenIDToEdges[
                        parentTokenID
                    ][edgeArrayLength - 1];
                    _tokenIDToEdges[parentTokenID].pop();
                }
            }
        }
    }

    // View Functions
    function getEdgesInPath(uint256 id)
        external
        override
        view
        returns (Edge[] memory edges)
    {
        require(id != 0, "The token ID cannot be zero");
        require(
            _tokenIDToTokenStruct[id].id != 0,
            "ID has not been added to the graph yet."
        );
        require(_tokenIDToEdges[id].length > 0, "There must be edges in the path to run this function.");
        
    }

    /*   
    // tokenID -> order added (for example, tokenID 58 -> 1 and 26 -> 2 since token ID 58 was added first)
    // used for checking if tokenID is allready created 
    mapping(uint256 => uint256) _tokenIDToOrderAdded;
    uint256 orderAddedCount = 1; 
    */
}
