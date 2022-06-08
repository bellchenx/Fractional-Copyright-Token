// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

/**
@dev Required interface for copyright master functions and data structure. 

This code is an interface for a directionally weighted-graph structure. 
It is a graph because it will use vertices and edges. 
It is weighted because it will store a metric (for instance, royalty cap model).
It is directional because no path will include any two vertices that are the same. 
In other words, there will be no graph loops.

For this interface, all vertices all called tokens and the data stored by a 
token is its id, weight, timestamp, and isBlacklisted boolean. All ids
are non-zero positive tntegers. This is because the zero id will act like a null id.

For this interface, all edges have a dynamic array of to destinations and weights so edges can be added to 
the graph.

Note the topology of all tokens is immutable when added to the graph.
This means that tokens and edge connections are immuable after being added to graph. 

Note that the weight of a token is mutable. 
When the owner of a token wants to change its token weight, it can update the number by calling a function.
Note that the isBlacklisted boolean is mutable. The state of being blacklisted can change. 

Token blacklisting is added in this interface instead of token deletion to save gas fees on chain. 
Instead of deleting a token, a token is instead blacklisted for potential features.

Based on reasearch from:
https://ethereum.stackexchange.com/questions/78333/efficient-solidity-storage-pattern-for-a-directional-weighted-graph

@author Elijah Mansur 
@title Interface Copyright Master
 */
interface ICopyrightMaster {
    /**
    @dev struct to store the edge data 'to' with a 'weight'. An edge points at the next token in the directional graph. 
    This data is immutable unless an edge is removed from the graph. 
     */
    struct Edge {
        uint256[] to;
        uint256[] weight;
    }

    /**
    @dev struct to store a token object with an 'id', 'weight', 'timeStamp', and 'isBlacklisted'. The 'weight' and 'isBlacklisted' in {Token} are mutable. 
    'edge' is an element of {token} to search quickly for edge connections to {token}.
     */
    struct Token {
        uint256 id;
        uint256 weight;
        uint256 timeStamp;
        bool isBlacklisted;
        Edge edge;
    }

    /**
    @dev Emitted when a new 'token' is added to the graph at a time. The 'token'
    is added to the graph as a new node that holds {edge} connections that represent
    all of the edge connections to 'token'.
     */
    event AddTokenToGraph(Token token);

    /**
    @dev Emitted when the function {changeTokenWeight} is called. 'id' represents 
    the id for which a 'newWeight' was added to {token}.
     */
    event ChangeTokenWeight(uint256 id, uint256 newWeight);

    /**
    @dev Emitted when the function {blacklistToken} is called. A {token} with an 'id' 
    is either blacklisted or unblacklisted. 
     */
    event TokenBlacklisted(uint256 id, bool isBlacklisted);

    /**
    @dev Creates a struct {token} that holds the edge connections to its parents. 

    Requirements: 

    -  'id' and 'parentIds' must not be subsets unless 'parentIds' is the zero ID
    -  'id' must not be zero 
    -   If 'parentIds' is not a set, this function must revert 
    -   If 'parentIds' have not been added to the graph, this function must revert
     */
    function insertToken(
        uint256[] memory parentIds,
        uint256[] memory parentWeights,
        uint256 id,
        uint256 weight
    ) external;

    /**
    @dev Makes the edge connections between 'parentIds' and 'id' with an array of 'parentWeights' for each of the
    'parentIds'. 

    Requirements:  

    -   'parentIds' and 'id' cannot be the zero token ID 
    -   'id' and 'parentIds' must not be subsets.
    -    If 'parentIds' is not a set, this function must revert 
    -    If 'parentIds' and 'id' have not been added to the graph, this function must revert
    -    If a potential edge connection that is to be added is redundant, this function must revert that there is redundant edge connection
    -    If an edge connection will create a graph loop, this function must revert
     */
    function insertEdges(
        uint256[] memory parentIds,
        uint256[] memory parentWeights,
        uint256 id
    ) external;

    /**
    @dev changes the weight in a 'token' struct to 'newWeight'

    Requirements: 

    -   'token' must allready exist in weighted graph
     */
    function changeTokenWeight(uint256 id, uint256 newWeight) external;

    /**
    @dev blacklists a {token} with 'id' to a boolean 'isBlacklisted'

    Requirements: 

    -   'id' must exist on the weighted graph and not be zero
     */
    function blacklistToken(uint256 id, bool isBlacklisted) external;

    /**
    @dev This function should find all of the 'tokens' in the path behind the chosen 'id' 
    and their 'weights'. How data is saved based on breadth first search is up to the 
    implementer and their application.

    Requirements: 

    -   'id' must exist on the weighted graph and not be zero

     */
    function bfsTraversal(uint256 id) external;

    // View and Pure Functions

    /**
    @dev returns if a {token} with 'id' is located on the graph.
     */
    function tokenExists(uint256 id) external view returns (bool exists);

    /**
    @dev Returns the amount of tokens in the graph. 
     */
    function tokenCount() external view returns (uint256);

    /**
    @dev Returns the 'id' associated with 'token'. All other functions behave similar with differerent 
    return values. 

    Requirements: 

    -   'token' must exist on graph
     */
    function returnId(Token memory token) external pure returns (uint256 id);

    function returnTokenWeight(uint256 id)
        external
        view
        returns (uint256 weight);

    function returnTime(uint256 id)
        external
        view
        returns (uint256 timeStamp);

    function returnIsBlacklisted(uint256 id)
        external
        view
        returns (bool isBlacklisted);

    /**
    @dev returns 'edge' object associated with 'id'. 

    Requirements: 

    -   'token' must exist on graph
     */
    function returnEdge(uint256 id) external view returns (Edge memory edge);

    /**
    @dev takes a 'id' and returns where the edges point to.

    Requirements: 

    -   'id' must exist on graph
     */
    function edgeTo(uint256 id)
        external
        view
        returns (uint256[] memory);

    /**
    @dev returns the 'weights' associated the {edge} object inside of {token} from 'id'.
     */
    function edgeWeights(uint256 id)
        external
        view
        returns (uint256[] memory weights);

    /** 
    @dev Returns the amount of edges in the graph
     */
    function edgeCount() external view returns (uint256);

    // NOTES AND THINGS TO functions to consider later LATER:

    // /**
    // @dev this function returns an array of 'weights' for each token in the struct array of 'tokens' and can be used after calling
    // {getTokensInPath}.

    // Requirements:

    // -   This function must detect a redundant path and must only place one of the two redunant paths in the array. For instance:
    //     1 -> 2 -> 4
    //       -> 3
    //     means that 1 -> 2,3 and 2,3 -> 4. Insead of returning (1,2), (1,3), (2,4), (3,4), instead return
    //     (1,2), (2,4), (3,4) or (1,3), (2,4), (3,4)
    // -    All 'tokens' must exist on the weighted graph and not be zero
    // -   Weights must coorespond to their tokens directly
    //  */
    // function getWeights(Token[] memory tokens)
    //     external
    //     returns (uint256[] memory weights);

    // /**
    // @dev returns if a set of edges between 'parentIds' and 'id' with a parameter 'weights' 'exists'.

    // Requirements:

    // -   'parentIDs' and 'id' must not be subsets.
    // -   'parentIDs' and 'id' cannot be empty.
    // -   'weights' must be positive real numbers.
    // -    The size of 'weights' must match the size of 'parentIDs'.
    //  */
    // function edgeExists(Edge memory edge) external view returns (bool exists);

    // /**
    // @dev returns the 'sourceID' for an 'edge'
    //  */
    // function edgeSource(Edge memory edge) external returns (uint256 sourceID);

    // /**
    // @dev returns the 'targetID' for an 'edge'
    //  */
    // function edgeTarget(Edge memory edge) external returns (uint256 targetID);

    //     /**
    // @dev This function determines the edges in the path to the chosen 'token'. Next, it returns an
    // array of edge connections, 'edges'.

    // Reqirements:

    // -   'token' must be a token that exists in the weighted graph
    //  */
    // function getEdgesInPath(uint256 id)
    //     external
    //     view
    //     returns (Edge[] memory edges);
    // /**
    // @dev Emitted when a 'token' is removed from the graph.
    //  */
    // event RemovedNodeFromGraph(uint256 indexed id);
    /** 
    // @dev removes 'tokenToRemove' from the graph. If the 'tokenToRemove' is a leaf token, 'tokenToRemove' and its 'edges' are removed. 
    // If 'tokenToRemove' is a middle token, 'tokenToRemove'  and its edges are removed. Next new edge connections are 
    // inserted between 'parentsOfTokenToRemove' and 'childrenOfTokenRemoved'. If 'tokenToRemove' is a root token, the edge connections between 
    // 'tokenToRemove' and 'childrenOfTokenRemoved' are removed. 'childrenOfTokenRemoved' then become the root tokens.
    
    // Requirements: 

    // -   If 'tokenToRemove' is a leaf token, grandchildIDs must be empty and 'parentIDs' cannot be empty
    // -   If 'tokenToRemove' is a root token, 'parentIDs' must be empty and 'grandchildIDs' cannot be empty. 
    // -   If 'tokenToRemove' is a middle token, all IDs must not be empty. 
    // -   'id', 'parentIds', and 'grandchildID' must not be subsets unless they are empty in stated cases above.
    // */
    // function removeToken(
    //     Token[] memory parentsOfTokenRemoved,
    //     uint256 id,
    //     Token[] memory childrenOfTokenRemoved
    // ) external;

    // /**
    // @dev Removes the edge connection for the array of struct 'edges'.

    // Requirements:

    // -    No elements in 'edges' can be subsets or empty
    // */
    // function removeEdges(uint256 id) external;
    // Note that a root token is a token with no prior edges on the weighted graph.
    // Note that a middle token is a token with edges before and after on the graph.
    // Note that a leaf token is a token with no edges after on the graph.
    // /**
    // @dev Emitted when the functions {updateEdges} or {removeEdges} are called.
    // This represents an array of 'edge' being removed at a 'timeStamp'.
    //  */
    // event RemovedEdgeFromGraph(Edge[] edges, uint256 timeStamp);

    // todo consider other data structures for edge connections and look at contract optimization
    // 1. mapping(uint256 => (uint256 => uint256)) _idToMappingOfDestinationToWeight
    // 2. Each represent a single 'to' and 'weight' value instead of an array

    // todo Other functions that could be implemented but are not necessary for this application
    // updateEdge
    // insertBetween
    // I do not believe this function is needed anymore for our applications. Other applications may need it
    // question should it be included?
    //     /**
    // @dev updates the edge connection between 'parentIDs' and 'ids' with a preset royalty cap for
    // each of the 'parentIDs' of 'weights'. This function can be used for the function {removeToken} and
    // for updating royalty amounts for 'parentIds' based on user choice.

    // Requirements:

    // -   'parentIDs' and 'ids' cannot be empty
    // -   'parentIDs' and 'ids' must not be subsets.
    // -   'address(this)' must be an approved operator
    // -    Cannot update the leaf or root edge in the graph
    // -    This function can only be called internally by removeToken
    // -    The size of 'weights' must match the size of 'parentIDs'

    //     Note to remove: Consider passing in a struct EdgeStruct myEdgeStruct that holds parentOfNodeIDs and childIDToRemove to
    //     make more effiecient
    //  */
    // function updateEdges(
    //     uint256[] memory parentIDs,
    //     uint256[] memory ids,
    //     uint256[] memory weights
    // ) external;
}
