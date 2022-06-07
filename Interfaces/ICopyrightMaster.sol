// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

/**
@dev Required interface for copyright master functions and data structure. 

This code is an interface for a directionally weighted-graph structure. 
It is a graph because it will use vertices and edges. 
It is weighted because it will store a metric (for instance, royalty cap model).
It is directional because no path will include any two vertices that are the same.

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
        uint256 timeStamp;
    }

    /**
    @dev Emitted when a new token is added to the graph at a 'timeStamp'. The 'tokenID'
    is added to the graph as a new node with Edge connections 'edges' that represent the 
    sourceID, targetID, and weight of each edge. 
     */
    event AddNodeToGraph(Edge[] edges, Token token);

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
    @dev Creates a struct 'token' that represents the 'tokenID' and 'weight' and returns bool for if the operation works. 

    Requirements: 

    -   If 'parentTokenIDs' is null, an inserted token must be a leaft token with no edges yet
    -  'tokenID' and 'parentTokenIDs' must not be subsets unless 'parentTokenIDs' is the zero ID
    -  'tokenID' must not be zero 
     */
    function insertToken(
        Token[] memory parentTokenIDs,
        uint256 tokenID,
        uint256 weight
    ) external;

    /**
    @dev Makes the edge connections between 'parentTokenIDs' and 'tokenID' with an array of 'weights' for each of the
    'parentTokenID' and returns bool for if the operation works. 

    Requirements:  

    -   'parentTokenIDs' and 'tokenID' cannot be the zero token ID 
    -   'tokenID' and 'parentTokenIDs' must not be subsets.
    -    The size of 'weights' must match the size of 'parentIDs'
     */
    function insertEdges(
        Token[] memory parentTokenIDs,
        Token memory token
    ) external;

    /**
    @dev changes the weight in a 'token' struct to 'newWeight'

    Requirements: 

    -   'token' must allready exist in weighted graph
     */
    function changeTokenWeight(Token memory token, uint256 newWeight)
        external;

    /** 
    @dev removes 'tokenToRemove' from the graph. If the 'tokenToRemove' is a leaf token, 'tokenToRemove' and its 'edges' are removed. 
    If 'tokenToRemove' is a middle token, 'tokenToRemove'  and its edges are removed. Next new edge connections are 
    inserted between 'parentsOfTokenToRemove' and 'childrenOfTokenRemoved'. If 'tokenToRemove' is a root token, the edge connections between 
    'tokenToRemove' and 'childrenOfTokenRemoved' are removed. 'childrenOfTokenRemoved' then become the root tokens.
    
    Requirements: 

    -   If 'tokenToRemove' is a leaf token, grandchildIDs must be empty and 'parentIDs' cannot be empty
    -   If 'tokenToRemove' is a root token, 'parentIDs' must be empty and 'grandchildIDs' cannot be empty. 
    -   If 'tokenToRemove' is a middle token, all IDs must not be empty. 
    -   'tokenID', 'parentTokenIDs', and 'grandchildID' must not be subsets unless they are empty in stated cases above.
    */
    function removeToken(
        Token[] memory parentsOfTokenRemoved,
        Edge[] memory edges,
        Token memory tokenToRemove,
        Token[] memory childrenOfTokenRemoved
    ) external;

    /**
    @dev Removes the edge connection for the array of struct 'edges'. 

    Requirements: 

    -    No elements in 'edges' can be subsets or empty
    */
    function removeEdges(Edge[] memory edges, Token memory tokenToRemove) external;

    // View Functions

    /**
    @dev This function determines the edges in the path to the chosen 'token'. Next, it returns an 
    array of edge connections, 'edges', in time chronilogical order from earliest to latest that lead to 'token'.

    Reqirements: 

    -   'token' must be a token that exists in the weighted graph
    -   The return parameter 'edges' must be a set ordered time chronilogically from earliest -> latest
     */
    function getEdgesInPath(Token memory token)
        external
        view
        returns (Edge[] memory edges);

    /**
    @dev this function returns an array of 'weights' for each edge in the struct array of 'edges' and can be used after calling 
    {determineEdgesInPath}.

    Requirements: 

        -   This function must detect a redundant path and must only place one of the two redunant paths in the array. For instance: 
        1 -> 2 -> 4
          -> 3
        means that 1 -> 2,3 and 2,3 -> 4. Insead of returning (1,2), (1,3), (2,4), (3,4), instead return
        (1,2), (2,4), (3,4) or (1,3), (2,4), (3,4)
        -   Edges must not be empty
        -   'Weights' must be in time chronilogical order from earliest -> latest according to 'edges'
     */
    function getWeights(Edge[] memory edges)
        external
        returns (uint256[] memory weights);

    /**
    @dev returns if a 'token' is located on the graph.
     */
    function tokenExists(Token memory token) external view returns (bool exists);

    /**
    @dev Returns the amount of tokens in the graph. 
     */
    function tokenCount() external view returns (uint256);

    /**
    @dev returns if a set of edges between 'parentTokenIDs' and 'tokenID' with a parameter 'weights' 'exists'. 

    Requirements: 

    -   'parentIDs' and 'tokenID' must not be subsets.
    -   'parentIDs' and 'tokenID' cannot be empty.
    -   'weights' must be positive real numbers.
    -    The size of 'weights' must match the size of 'parentIDs'.
     */
    function edgesExist(
        uint256[] memory parentTokenIDs,
        uint256 tokenID,
        uint256[] memory weights
    ) external view returns (bool exists);

    /** 
    @dev returns the 'sourceID' for an 'edge'
     */
    function edgeSource(Edge memory edge) external returns(uint256 sourceID);

    /**
    @dev returns the 'targetID' for an 'edge'
     */
    function edgeTarget(Edge memory edge) external returns(uint256 targetID);

    /**
    @dev returns the 'weight' for an 'edge'
     */
    function edgeWeight(Edge memory edge) external returns(uint256 weight);

    /** 
    @dev Returns the amount of edges in the graph
     */
    function edgeCount() external view returns (uint256);

    // todo Other functions that could be implemented but are not necessary for this application 
    // updateEdge
    // insertBetween
    // I do not believe this function is needed anymore for our applications. Other applications may need it 
    // question should it be included? 
    //     /**
    // @dev updates the edge connection between 'parentIDs' and 'tokenIDs' with a preset royalty cap for
    // each of the 'parentIDs' of 'weights'. This function can be used for the function {removeToken} and
    // for updating royalty amounts for 'parentTokenIDs' based on user choice.

    // Requirements:

    // -   'parentIDs' and 'tokenIDs' cannot be empty
    // -   'parentIDs' and 'tokenIDs' must not be subsets.
    // -   'address(this)' must be an approved operator
    // -    Cannot update the leaf or root edge in the graph
    // -    This function can only be called internally by removeToken
    // -    The size of 'weights' must match the size of 'parentIDs'

    //     Note to remove: Consider passing in a struct EdgeStruct myEdgeStruct that holds parentOfNodeIDs and childIDToRemove to
    //     make more effiecient
    //  */
    // function updateEdges(
    //     uint256[] memory parentIDs,
    //     uint256[] memory tokenIDs,
    //     uint256[] memory weights
    // ) external;
}
