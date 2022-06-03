// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13; 

/**
@dev Required interface for copyright master functions 
and data structures 

This code is an interface for a directional-weighted-graph structure. 
It is a graph because it will use vertexes and edges. 
It is weighted because it will use distance to update the length of a path at a point.

The vertexes are the royalty amount. 
The edge is the distance of graph, and the tokenID from and to 

Note that all vertices are immutable when added to the graph.
When a vertice wants to change its royalty amout, a new graph is made with that vertex as the start.  

Based on reasearch from: 
https://ethereum.stackexchange.com/questions/78333/efficient-solidity-storage-pattern-for-a-directional-weighted-graph
https://www.softwaretestinghelp.com/java-graph-tutorial/

@author Elijah Mansur 
@title Interface Copyright Master
 */
interface ICopyrightMaster { 
    /**
    @dev Emitted when a user decides to commercialize their product to the market 
     */
    event CreateStartNode(address user, uint256 tokenID);

    /**
    @dev Emitted when a user purchases content from a preceding vertex. 
    @param parentTokenIDs preceding vertexes for the new object. This is plural if a user buys two things from the same level
    @param child the new node  
    @param timeStamp The time when the new node was added to the graph
    @param tokenID ERC1155 token from child 
     */
    event AddNodeToGraph(uint256[] indexed parentTokenIDs, address indexed child, uint256 tokenID, uint256 timeStamp);

    event RemovedNodeFromGraph();

    /**
    @dev returns boolean for vertex insertion success

    The vertexes can be arranged as a set of vertexes at each level in the graph

    @param whichGraph represents the chosen graph to add a vertex to. 
     */
    function insertVertex(uint256 whichGraph, uint256[] memory parentTokenIDs, uint256 tokenID, uint256 weight, uint256 royaltyAmount) external returns(bool);

    /**
    @dev adds an edge connection between two vertexes from parents to a child. 

    The edge connections will defined by an array of struct EdgeStruct with: 
    source, target, and distance. 
     */
    function insertEdge(uint256 whichGraph, address[] calldata parents, uint256 tokenID, uint256 weight) external returns(bool);

    /** 
    This function is useful for cases of copyright infringement where vertexes need to be removed. 

    @dev removes the vertex from the graph. Cannot remove the first vertex in the graph. 

    Leaf Vertex: removes the last vertex and edge to last vertex
    Middle Nodes: removes the middle vertex and connects the vertex before and after together, also adjusting the edge. 

    @param parentIDs tokens representing parents of the node that is removed
    @param childIDToRemove node to remove because of user violations 
    @param grandchildID vertex which will be connected to parentsOfNodeToRemoved
    @param graphdistance the graphdistance of the node to remove. This is by design if a node is repeated multiple times

    @return operationSuccess does the attempted removal work or not. 
    */
    function removerVertex(uint256 whichGraph, uint256[] calldata parentIDs, uint256 childIDToRemove, uint256 grandchildID, uint256 graphdistance) external returns (bool);

    /**
        @dev updates the edge connection between two vertices when a vertex is removed from the graph

        Consider passing in a struct EdgeStruct myEdgeStruct that holds parentOfNodeIDs and childIDToRemove to 
        make more effiecient
     */
    function updateEdge(uint256 whichGraph, uint256[] calldata parentIDs, uint256 grandchildID, uint256 graphdistance) external;

    /**
    @dev same as update edge but removed the edge instead. Used for leaf vertexes being removed
     */
    function removeEdge(uint256 whichGraph, address[] calldata parents, uint256 tokenID, uint256 distance) external;

    /**
    @dev blacklists a node so that it cannot recieve funds even though it is still on the graph. 
     */
    function blacklistVertex(uint256 whichGraph, uint256[] calldata parentIDs, uint256 childIDToRemove, uint256 graphdistance) external returns(bool);

    // View Functions 

   /**
    @dev This function is used for determining how to distribute royalties. Note there can be only one tokenID per graph

    Time: earliest->latest

    If multiple paths consolidate into one path, then the tokenIDs are ordered according from ealiest to latest using a timestamp
    If else, the tokenIds are listed in chronilogical order

    Should detect redundancy in a path and only put address in once. For instance: 
    3 -> 1 -> 2 -> 1 -> 4 will return 3,1,2,4

    @param distance amount of vertexes in path 

    @return orderedIDList list of addresses in chronological order
    @return royaltyAmount the amount of royalty requested from each address 
     */
    function returnOrderedPath(uint256 whichGraph, uint256 distance, uint256 tokenID) external view returns(uint256[] memory orderedIDList, uint256[] memory royaltyAmount);

    /**
    @dev this function gets the path number for a node with address user. 

    @param tokenID the token ID for this user since the user may have multiple creations 
    @return distance the path to find
     */
    function getdistance(uint256 whichGraph, uint256 tokenID) external view returns(uint256 distance);

    /**
    @dev checks if a vertex exists
     */
    function vertexExists(uint256 whichGraph, uint256 tokenID) external view returns(bool exists);

    /**
    @dev checks if an edge exists
     */
    function edgeExists(uint256 whichGraph, uint256 tokenID) external view returns(bool exists);

    /**
    @dev Counts the weighted vertexes in graph
     */
    function vertexCount(uint256 whichGraph) external view returns(uint256);

    /**
    @dev this function returns the royalty at a vertex since a vertex is just 
    the royalty amount. 
    Not 100% what arguements to put since I do not know the data structure Ill be using. 
     */
    function getVertex(/*What args to put here*/) external view returns(uint256 royaltyAmount);

    /** 
    @dev Counts the amount of edges in a graph
     */
    function edgeCount(uint256 whichGraph) external view returns(uint256);



}