// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

/**
@dev Required interface for copyright master functions and data structure. 

This code is an interface for a directional-weighted-graph structure. 
It is a graph because it will use vertices and edges. 
It is weighted because it will store a metric (for instance, royalty cap model).

For this interface, all vertices all called tokens and the data stored by a 
token is its tokenID. Likewise, it is assumed that all tokenIDs non-zero positive Integers. 
This is because the zero tokenID will act like a null tokenID or the empty set. 

Note that a root token is a token with no prior connections on the weighted graph. 
Note that a middle token is a token with connections before and after on the graph. 
Note that a leaf token is a token with no connections after on the graph. 

Note the topology of all tokens is immutable when added to the graph unless removed entirely.
When the owner of a token wants to change its edge weight, it can update the number by calling a function.

Based on reasearch from: 
https://ethereum.stackexchange.com/questions/78333/efficient-solidity-storage-pattern-for-a-directional-weighted-graph

@author Elijah Mansur 
@title Interface Copyright Master
 */
interface ICopyrightMaster {
    
    /**
    @dev struct to store the edge data between 'sourceID' and 'targetID' with a 'weight'. This data 
    is immutable unless an edge is removed from the graph. 
     */
    struct Edge {
        uint256 sourceID;
        uint256 targetID;
        uint256 weight;
    }

    /**
    @dev struct to store a token object with a 'tokenID' and a weight'. Unlike the struct {Edge},
    the 'weight' in {Token} is mutable. Also note that the 'tokenID' is immutable once added to the graph 
    unless the object {Token} is removed. 
     */
    struct Token { 
        uint256 tokenID;
        uint256 weight;
    }

    /**
    @dev Emitted when an address 'creator' commercializes a token 
    as type 'tokenID' with a 'weight'
     */
    event CreateNewNode(address creator, uint256 tokenID, uint256 weight);

    /**
    @dev Emitted when a new token is added to the graph at a 'timeStamp'. The 'tokenID'
    is added to the graph as a new node with Edge connections 'edges' that represent the 
    sourceID, targetID, and weight of each edge. 
     */
    event AddNodeToGraph(
        Edge[] edges, 
        Token token,
        uint256 timeStamp
    );

    // Question What does indexed mean? Indexed means that the data indexed is stored in an order according to
    // when the event occured. This can be accessed later for a front end .

    /**
    @dev Emitted when a 'tokenID' is removed from the graph at a 'timeStamp'. 
     */
    event RemovedNodeFromGraph(uint256 indexed tokenID, uint256 timeStamp);

    /**
    @dev Emitted when the functions {updateEdges} or {removeEdges} are called. 
    This represents an array of 'edge' being removed at a 'timeStamp'.
     */
    event RemovedEdgeFromGraph(Edge[] edges, uint256 timeStamp);

    /**
    @dev Returns a struct 'token' that represents the 'tokenID' and 'weight'

    Requirements: 

    -  If 'parentTokenIDs' is zero, this means an inserted token has no parents 
    -  'tokenID' and 'parentTokenIDs' must not be subsets unless 'parentTokenIDs' is the zero ID
    -  'tokenID' must not be zero 
    -  'address(this)' must be an approved operator to insert a token into graph
    -  'tokenID' must not be a subset of 'parentTokenIDs'
    -   This function must call {insertEdges} internally for each connection between 'parentTokenIDs' and 'tokenIDs'
     */
    function insertToken(
        uint256[] memory parentTokenIDs,
        uint256 tokenID,
        uint256 weight,
        uint256 timeStamp
    ) external returns (Token calldata token);

    /**
    @dev returns the edge connections between 'parentTokenIDs' and 'tokenID' with an array of 'weights' for each of the
    'parentTokenID'.

    Requirements:  

    -   'parentTokenIDs' and 'tokenID' cannot be the zero token ID 
    -   'tokenID' and 'parentTokenIDs' must not be subsets.
    -    The size of 'weights' must match the size of 'parentIDs'
    -   
     */
    function insertEdges(
        uint256[] calldata parentTokenIDs,
        uint256 tokenID,
        uint256[] calldata weights
    ) external returns (Edge[] calldata edges);

    /**
    @dev changes the weight in a 'token' struct to 'newWeight'

    Requirements: 

    -   'token' must allready exist in weighted graph
     */
    function changeTokenWeight(Token calldata token, uint256 newWeight) external;

    /** 
    @dev removes 'tokenToRemove' from the graph. If the 'tokenToRemove' is a leaf token, 'tokenToRemove' and its 'edges' are removed. 
    If 'tokenToRemove' is a middle token, 'tokenToRemove' is removed and its edge connections are also removed. Next new edge are 

    by fetching the weights from 'parentIDs'. If 'removeID' is a root token, the edge connections between 'removeID' and 'grandchildIDs' 
    are removed. 'grandchildIDs then become root IDs.
    
    Requirements: 

    -   If 'removeID' is a leaf token, grandchildIDs must be empty and 'parentIDs' cannot be empty
    -   If 'removeID' is a root token, 'parentIDs' must be empty and 'grandchildIDs' cannot be empty. 
    -   In all other cases ('removeID' is a middle token), all IDs cannot be empty. 
    -   'tokenID', 'parentTokenIDs', and 'grandchildID' must not be subsets unless they are empty in special cases
    -   'address(this)' must be an approved operator 
    */
    function removeToken(
        Token[] calldata parentsOfTokenToRemove,
        Edge[] calldata edges,
        Token calldata tokenToRemove,
        Token[] calldata tokensAfterTokenToRemove
    ) external;

    /**
    @dev updates the edge connection between 'parentIDs' and 'tokenIDs' with a preset royalty cap for 
    each of the 'parentIDs' of 'weights'. This function can be used for the function {removeToken} and 
    for updating royalty amounts for 'parentTokenIDs' based on user choice. 

    Requirements: 
    
    -   'parentIDs' and 'tokenIDs' cannot be empty
    -   'parentIDs' and 'tokenIDs' must not be subsets. 
    -   'address(this)' must be an approved operator 
    -    Cannot update the leaf or root edge in the graph 
    -    This function can only be called internally by removeToken
    -    The size of 'weights' must match the size of 'parentIDs'

        Note to remove: Consider passing in a struct EdgeStruct myEdgeStruct that holds parentOfNodeIDs and childIDToRemove to 
        make more effiecient
     */
    function updateEdges(
        uint256[] calldata parentIDs,
        uint256[] calldata tokenIDs,
        uint256[] calldata weights
    ) external;

    /**
    @dev Removes the edge connection between 'parentIDs' and 'tokenID'. 

    Requirements: 

    -   'parentIDs' and 'tokenID' must not be subsets.
    -   'parentIDs' and 'tokenID' cannot be empty.
    -    This function can only be called internally by removeToken
     */
    function removeEdges(address[] calldata parentIDs, uint256 tokenID)
        external;

    // View Functions

    /**
    @dev This function determines how to distribute royalties from 'tokenID' to an 'orderedIDList' that includes all
    IDs in time chronological order below 'tokenID'. The functiona also returns a list 'royaltyAmounts' 
    associated directly with the 'orderedIDList'. 

    Reqirements: 

    -   This function must detect a redundant path and only credit a preceding token once. For instance: 
        1 -> 2 -> 4
          -> 3
        means that 1 -> 2,3 and 2,3 -> 4. Thus the return parameter 'orderedIDList' will be 1, 2, 3, not 1, 2, 1, 3.
    -   The return parameter 'orderedIDList' must be a set order time chronilogically from earliest -> latest
    -   The return parameter 'royaltyAmounts' must attribute a royalty for each ID in the same order as 'orderedIDList'
    -   'royaltyAmounts' must be a real number
     */
    function determineRoyaltyDistribution(uint256 tokenID)
        external
        view
        returns (
            uint256[] memory orderedIDList,
            uint256[] memory royaltyAmounts
        );

    /**
    @dev this function returns the weight for a 'tokenID'.

    Requirements: 

    -   'tokenID' must be a natural number not including zero
     */
    function getWeight(uint256 tokenID) external view returns (uint256 weight);

    /**
    @dev returns if a 'tokenID' is commercialized or not.

    Requirements: 

    -   'tokenID' must be a natural number not including zero
     */
    function tokenExists(uint256 tokenID) external view returns (bool exists);

    /**
    @dev Returns the amount of unique tokens in the graph. 
     */
    function tokenCount() external view returns (uint256);

    /**
    @dev returns if a set of edges between 'parentTokenIDs' and 'tokenID'  exist. 

    Requirements: 

    -   'parentIDs' and 'tokenID' must not be subsets.
    -   'parentIDs' and 'tokenID' cannot be empty.
    -   'weights' must be positive real numbers.
    -    The size of 'weights' must match the size of 'parentIDs'.
     */
    function edgesExist(
        uint256[] calldata parentTokenIDs,
        uint256 tokenID,
        uint256[] calldata weights
    ) external view returns (bool exists);

    /**
    @dev returns all edges behind 'tokenID'. 

    Note the data structure to return with is not decided
     */
    function getEdges(
        uint256 tokenID
    ) external view;

    /** 
    @dev returns an edges source which is the from in an edge. 

    Note the data structure to input as param and return with are not decided
    An edge struct object could be passed in
     */
    function edgeSource() external;

    /**
    @dev behaves the same as {edgeSource} but get the to argument in an edge
     */
    function edgeTarget() external;

    /** 
    @dev Returns the amount of edges in a graph
     */
    function edgeCount() external view returns (uint256);
}
