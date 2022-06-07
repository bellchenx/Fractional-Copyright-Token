// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Importing interface for implementation specific to ST Platform
import "../Interfaces/ICopyrightMaster.sol";

// marked as abstracted until all functions are implemented
abstract contract copyrightMaster is ICopyrightMaster {
    address admin;

    mapping(uint256 => Token) _tokenIDToTokenStruct;
    Edge[] edgeSet;
    // the number of edges so far
    uint256 edgeCount = 0;

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
                if (parentTokenIDs[i].tokenID == _tokenID) return true;
            }
            return false;
        }
    }

    // note that timestamp is not needed. You fetch timestamp in the function
    function insertToken(
        Token[] memory parentTokenIDs,
        uint256 _tokenID,
        uint256 _weight
    ) public onlyAdmin {
        require(_tokenID != 0, "The token ID cannot be zero");
        bool isSub = isSubset(_tokenID, parentTokenIDs);
        require(!isSub, "TokenID is a subset of parentTokenIDs");
        Token memory token;
        token.tokenID = _tokenID;
        token.weight = _weight;
        token.timeStamp = block.timestamp;
        insertEdges(parentTokenIDs, token);
    }

    /**
    Make sure admin contains the address of the smart contract 
     */
    function insertEdges(Token[] memory parentTokenIDs, Token memory token)
        public
        onlyAdmin
    {
        uint256 length = parentTokenIDs.length;
        if (length == 0) return;
        Edge[] memory edge;
        // since edgeCount starts at 0
        edgeSet[edgeCount + 1] = edge;
        for (uint256 i = 0; i < length; i++) {
            uint256 parentTokenID = parentTokenIDs[i].tokenID;
            edge[i].sourceID = parentTokenID;
            edge[i].targetID = token.tokenID;
            edge[i].weight = token.weight;
            edgeCount++ ; 
        }
    }

    function changeTokenWeight(Token memory token, uint256 newWeight)
        public
        onlyAdmin
    {
        require(
            _tokenIDToTokenStruct[token.tokenID].tokenID != 0,
            "Token does not exist in weighted graph"
        );
        _tokenIDToTokenStruct[token.tokenID].weight = newWeight;
    }

    function removeToken(
        Token[] memory parentsOfTokenRemoved,
        Edge[] memory edges,
        Token memory tokenToRemove,
        Token[] memory childrenOfTokenRemoved
    ) external {
        // rewrite the removeEdges function
        // removeEdges(tokenToRemove);
        // leaf token or root token cases
        if (
            childrenOfTokenRemoved.length == 0 ||
            parentsOfTokenRemoved.length == 0
        ) {
            // deleting the tokenID -> Token mapping for tokenToRemove.tokenID
            delete _tokenIDToTokenStruct[tokenToRemove.tokenID];
        }
        // middle token
        else {}
    }

/* 
    function removeEdges(Token memory tokenToRemove)
        public
    {
        delete _tokenIDToArrayOfEdgeStruct[tokenToRemove.tokenID];
    }
*/
}
