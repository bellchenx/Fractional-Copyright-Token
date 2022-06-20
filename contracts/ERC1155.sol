// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

// inhereting IERC1155 contract from open zepplin
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./copyrightGraph.sol";

contract ST1155Tokens is ERC1155, copyrightGraph {
    uint256 totalTokenCount = 0;

    // creator address -> Id
    mapping(address => uint256) public _address2Id;

    // Id -> creator address
    mapping(uint256 => address) public _id2Address;

    // token IDs -> URI
    // can I use bytes instead or bytes 32? area for reasarch
    mapping(uint256 => string) private _ID2uri;

    constructor(string memory uri) ERC1155(uri) {
        admin = msg.sender;
    }

    // not yet finished
    // idea call parents weights instead
    function _mintAndAddToGraph(
        address to,
        uint256 amount,
        bytes memory data,
        uint256 
        uint256[] memory parentIds,
        uint256[] memory parentWeigths
    ) internal onlyAdmin {
        require(to == address(0), "The to address is zero");
        totalTokenCount++;
        _address2Id[to] = totalTokenCount;
        _id2Address[totalTokenCount] = to;
        // calling open zepplins mint function
        super._mint(to, totalTokenCount, amount, data);
        _idToIsERC1155[totalTokenCount] = true; 
        copyrightGraph.insertToken(parentIds, parentWeights, totalTokenCount, );
    }

    // functions to write: 
    /** 
    mintWithNode
    batchMintWithNode    
     */
    function setURI(string memory newuri) public {
        _setURI(newuri);
    }
}
