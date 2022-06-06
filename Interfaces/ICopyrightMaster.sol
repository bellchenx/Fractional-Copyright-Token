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
    @dev struct to store the edge data between two tokens 
     */
    struct EdgeStruct {
        uint256 sourceID;
        uint256 targetID;
        uint256 weight;
    }

    /**
    @dev Emitted when an address 'creator' commercializes a token 
    as type 'tokenID' with a royalty cap 'weight'
     */
    event CreateNewNode(address creator, uint256 tokenID, uint256 weight);

    /**
    @dev Emitted when a 'tokenID' purchases assets from 'parentTokenIDs' at a 'timeStamp'. The 'tokenID'
    is added to the graph as a new node with a preset royalty cap 'weight'. 
     */
    event AddNodeToGraph(
        uint256[] indexed parentTokenIDs,
        uint256 indexed tokenID,
        uint256 weight,
        uint256 timeStamp
    );
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
    function insertToken(
        uint256[] memory parentTokenIDs,
        uint256 tokenID,
        uint256 weight,
        uint256 timeStamp
    ) external returns (bool success);

    struct cup{
        uint value1;
        uint value2;
    }

    /**
    @dev adds edge connections between between 'parentTokenIDs' and 'tokenID' with a 
    preset royalty caps for each connection  'weights'. 

    Requirements:  

    -   'parentTokenIDs' and 'tokenID' cannot be the zero token ID 
    -   'tokenID' and 'parentTokenIDs' must not be subsets.
    -   'weights' must be positive real numbers
    -    The size of 'weights' must match the size of 'parentIDs'


    Note delete before submission The edge connections will defined by an array of struct EdgeStruct with: 
    source, target, and distance. 
     */
    function insertEdges(
        uint256[] calldata parentTokenIDs,
        uint256 tokenID,
        uint256[] calldata weights
    ) external returns (bool);

    /** 
    @dev removes 'removeID' from the graph due to user violations. It returns 'operationSuccess' for if the operation succeeded.  
    If the 'removeID' is a leaf token, 'removeID' and its edges with 'parentIDs' are removed. If 'removeID' is a middle token, 
    'removeID' is removed and the edge connections between 'parentIDs' and 'grandchildIDs' are updated by fetching the weights 
    from 'parentIDs'. If 'removeID' is a root token, the edge connections between 'removeID' and 'grandchildIDs' are removed. 
    'grandchildIDs then become root IDs.
    
    Requirements: 

    -   If 'removeID' is a leaf token, grandchildIDs must be empty and 'parentIDs' cannot be empty
    -   If 'removeID' is a root token, 'parentIDs' must be empty and 'grandchildIDs' cannot be empty. 
    -   In all other cases ('removeID' is a middle token), all IDs cannot be empty. 
    -   'tokenID', 'parentTokenIDs', and 'grandchildID' must not be subsets unless they are empty in special cases
    -   'address(this)' must be an approved operator 
    */
    function removeToken(
        uint256[] calldata parentIDs,
        uint256 removeID,
        uint256[] calldata grandchildIDs
    ) external returns (bool);

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
