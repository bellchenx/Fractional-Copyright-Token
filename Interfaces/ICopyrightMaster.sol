// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13; 

/**
@dev Required interface for copyright master functions and data structure. 

This code is an interface for a directional-weighted-graph structure. 
It is a graph because it will use vertices and edges. 
It is weighted because it will store the preset royalty cap.

Note the topology of all vertices is immutable when added to the graph.
When the owner of a vertice wants to change its royalty amout, they can update the number by calling a function.

Based on reasearch from: 
https://ethereum.stackexchange.com/questions/78333/efficient-solidity-storage-pattern-for-a-directional-weighted-graph
https://www.softwaretestinghelp.com/java-graph-tutorial/

@author Elijah Mansur 
@title Interface Copyright Master
 */
interface ICopyrightMaster { 
    /**
    @dev Emitted when an address 'creator' commercializes a token 
    as type 'tokenID'
     */
    event CreateNewNode(address creator, uint256 tokenID);

    /**
    @dev Emitted when a 'tokenID' purchases assets from 'parentTokenIDs' at a 'timeStamp'. The 'tokenID'
    is added to the graph as a new node with a preset royalty cap 'weight'. 
     */
    event AddNodeToGraph(uint256[] indexed parentTokenIDs, uint256 indexed tokenID, uint weight, uint256 timeStamp);
    // Question What does indexed mean? Indexed means that the data indexed is stored in an order according to 
    // when the event occured. This can be accessed later for a front end . 

    /**
    @dev Emitted when a 'tokenID' is removed from the graph at a 'timeStamp'. 
     */
    event RemovedNodeFromGraph(uint256 indexed tokenID, uint256 timeStamp);

    /**
    @dev Returns 'success' for if inserting a new token was successful. 

    Requirements: 

    -  If 'parentTokenIDs' is zero, this means a new token is being commercialized 
    -  'tokenID' and 'parentTokenIDs' must not be subsets unless 'parentTokenIDs' is the zero ID
    -  'tokenID' must not be zero 
    -  'weight' must be a positive real number
    -  'address(this)' must be an approved operator to insert a token into graph
    -  'tokenID' must not be a subset of 'parentTokenIDs'


    Note delete before submission The tokens can be arranged as a set of tokens at each level in the graph
     */
    function insertToken(uint256[] memory parentTokenIDs, uint256 tokenID, uint256 weight, uint256 timeStamp) external returns(bool success);

    /**
    @dev adds an edge connection between between 'parentTokenIDs' and 'tokenID' with a 
    preset royalty cap 'weight'. 

    Requirements:  

    -   'parentTokenIDs' and 'tokenID' cannot be the zero token ID 
    -   'tokenID' and 'parentTokenIDs' must not be subsets.
    -   'weight' must be a positive real number


    Note delete before submission The edge connections will defined by an array of struct EdgeStruct with: 
    source, target, and distance. 
     */
    function insertEdge(uint256[] calldata parentTokenIDs, uint256 tokenID, uint256 weight) external returns(bool);

    /** 
    @dev removes 'removeID' from the graph due to user violations. It returns 'operationSuccess' for if the operation succeeded.  
    If the 'removeID' is a leaf token, 'removeID' and its edges with 'parentIDs' are removed. If 'removeID' is a middle token, 
    'removeID' is removed and the edge connection between 'parentIDs' and 'grandchildID' is updated by fetching the weight 
    from 'parentIDs'.
    
    Requirements: 

    -   Cannot remove the first token in the graph. 
    -   If 'removeID' is a leaf token, grandchildID must be zero. Else 'grandchildID' cannot be zero 
    -   'parentIDs' cannot be empty
    -   'removeID' cannot be empty
    -   'tokenID', 'parentTokenIDs', and 'grandchildID' must not be subsets.
    -   'address(this)' must be an approved operator 
    */
    function removeToken(uint256[] calldata parentIDs, uint256 removeID, uint256 grandchildID) external returns (bool);

    /**
        @dev updates the edge connection between two token when a token is removed from the graph

        Consider passing in a struct EdgeStruct myEdgeStruct that holds parentOfNodeIDs and childIDToRemove to 
        make more effiecient
     */
    function updateEdge(uint256[] calldata parentIDs, uint256 grandchildID, uint256 graphdistance) external;

    /**
    @dev same as update edge but removed the edge instead. Used for leaf tokenes being removed
     */
    function removeEdge(address[] calldata parents, uint256 tokenID, uint256 distance) external;

    // View Functions 

    /**
    @dev This function is used for determining how to distribute royalties. 
    Note there can be only one tokenID per graph

    Time: earliest -> latest

    If multiple paths consolidate into one path, then the tokenIDs are ordered according from ealiest to latest using a timestamp
    If else, the tokenIds are listed in chronilogical order

    Should detect redundancy in a path and only put address in once. For instance: 
    3 -> 1 -> 2 -> 1 -> 4 will return 3,1,2,4

    @param distance amount of tokenes in path 

    @return orderedIDList list of addresses in chronological order
    @return royaltyAmount the amount of royalty requested from each address 
     */
    function returnOrderedPath(uint256 distance, uint256 tokenID) external view returns(uint256[] memory orderedIDList, uint256[] memory royaltyAmount);

    // Todo Need rewrite
    // /**
    // @dev this function gets the path number for a node with address user. 

    // @param tokenID the token ID for this user since the user may have multiple creations 
    // @return weight the path to find
    //  */
    // function getWeight(uint256 tokenID) external view returns(uint256 weight);

    /**
    @dev checks if a token exists
     */
    function tokenExists(uint256 tokenID) external view returns(bool exists);

    /**
    @dev checks if an edge exists
     */
    function edgeExists(uint256 tokenID) external view returns(bool exists);

    /**
    @dev Counts the weighted tokenes in graph
     */
    function tokenCount() external view returns(uint256);

    /**
    @dev this function returns the royalty at a token since a token is just 
    the royalty amount. 
    Not 100% what arguements to put since I do not know the data structure Ill be using. 
     */
    function gettoken(/* Todo What args to put here*/) external view returns(uint256 royaltyAmount);

    /** 
    @dev Counts the amount of edges in a graph
     */
    function edgeCount() external view returns(uint256);
}