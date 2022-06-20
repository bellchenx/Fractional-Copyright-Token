// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

// inhereting IERC1155 contract from open zepplin
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./copyrightGraph.sol";

contract ST1155Tokens is ERC1155, copyrightGraph {
    uint256 totalTokenCount = 0;

    bool private isBurningAllowed = false; 

    // creator address -> Id
    mapping(address => uint256) public _address2Id;

    // Id -> creator address
    mapping(uint256 => address) public _id2Address;

    // token IDs -> URI
    // can I use bytes instead or bytes 32? area for reasarch
    mapping(uint256 => string) private _ID2uri;

    // function to control if burning is allowed. Right now burning is not implemented yet.
    modifier burningAllowed() {
        require(isBurningAllowed, "Burning is not allowed at this point in time.");
        _;
    }
    constructor(string memory uri) ERC1155(uri) {
        admin = msg.sender;
    }

    // batch mint will not occur as if this point. Only regular mint 
    function _mintAndAddToGraph(
        address to,
        uint256 amount,
        bytes memory data,
        uint256 weight,
        uint256[] memory parentIds,
        uint256[] memory parentWeights
    ) internal onlyAdmin {
        require(to == address(0), "The to address is zero");
        totalTokenCount++;
        _address2Id[to] = totalTokenCount;
        _id2Address[totalTokenCount] = to;
        // calling open zepplins mint function
        super._mint(to, totalTokenCount, amount, data);
        _idToIsERC1155[totalTokenCount] = true;
        // even if parentIds is empty the other function
        // will process this information correctly
        copyrightGraph.insertToken(
            parentIds,
            parentWeights,
            totalTokenCount,
            weight
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(address(to) != address(0), "Cannot send to zero address");
        require(address(from) != address(0), "Cannot send from zero address");
        require(
            id <= totalTokenCount,
            "The ID being sent has not yet been created"
        );
        uint256 balance = balanceOf(from, id);
        require(
            amount <= balance,
            "The amount being transferered is greater than the amount in circulation"
        );
        require(
            !_idToTokenStruct[id].isBlacklisted,
            "The token id trying to be transfered is blacklisted"
        );
        safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        require(from != address(0), "from cannot be the zero address");
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                _idToIsERC1155[ids[i]] == true,
                "One of the IDs trying to be transferered is not a registered token Id."
            );
            require(
                !_idToTokenStruct[ids[i]].isBlacklisted,
                "One of the token ids trying to be transfered is blacklisted"
            );
            // checking that the token amounts are correct are done in the open zepplin function
            // that is being overridden
        }
        // this function will check that the person caling the transfer from function is an approved operator
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function setURI(string memory newuri) public {
        _setURI(newuri);
    }
}
