// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13; 

// inhereting IERC1155 contract from open zepplin
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
@dev This interface defines the methods used to create a token collection for
many different users using one smart contract. It has methods to mint tokens, 
batch mint tokens for many addresses, transfer tokens, batch transfer tokens to 
many addresses, and do a multiswap trade where users will be able to trade multiple 
different coins for multiple other coins. It will also keep track of the token 
IDs for each token, and how many tokens each user will have. 

@author Elijah Mansur 
@title Interface ERC 1155 Tokens for Fractional Copyright
 */
interface I1155Token { 
    
    
    /**
    @dev emitted when a set of tokens are swapped between two users. 
    For instance, user 1 has tokenIds 1,2, and 4 while user 2 has tokenIds 
    4,5,6,and 9. Then decide to transfer a certain amount of these tokens 
    to eachother
     */
    event swapTokenSet(address indexed operator, address indexed from, address indexed to, uint256[] fromIDs, uint256[] toIDs, uint256[] fromValue, uint256[] toValue);

    /** 
    @dev emitted when a token is removed from circulation for breaking terms 
    and conditions. 
     */
    event tokenRemoved(address indexed user, uint256[] whichTokens);

    
    /**
    @dev function for transfering a token for money. This function must make 
    sure that both the seller and the buyer authorize the purchase 
    or 
    an operator calls the funcion for the users. 
     */
    function transferTokenPayable(
        address from,
        address to,
        uint256 id,
        uint256 tokenAmount,
        bytes calldata data,
        uint256 price
    ) external;
    
    /**
    @dev same as above but can transfer multiple tokens
     */
    function transferBatchTokenPayable( 
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data,
        uint256 price
    ) external;

    /**
    @dev function for users to swap sets of tokens to eachother. This 
    will call transferBatchTokenPayable twice, one for each reciever. 

    @param isFromPaying: is the from user paying for the transaction (true/false). 
    Since it is a trade, only one person will end having to pay the other. 
     */
    function swapTokenSetPayable(
        address from,
        address to,
        uint256[] calldata fromIds,
        uint256[] calldata fromAmounts,
        uint256[] calldata toIds,
        uint256[] calldata toAmounts,
        bytes calldata data,
        uint256 price,
        bool isFromPaying
    ) external;




    /**
    Functions Open Zepplin allready defines: 
    balanceOf
    balanceOfBatch
    setApprovalForAll
    isApprovedForAll
    safeTransferFrom
    safeBatchTransferFrom
    _mint
    _mintBatch
    _burn
    _burnBatch
    _setApprovalForAll
    _beforeTokenTransfer -- override this
    _afterTokenTransfer
    _doSafeTransferAcceptanceCheck
    _doSafeBatchTransferAcceptanceCheck

    @dev events open zepplin uses in its interface. The operator represents what front end is transfering the tokens. 
    
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);

    @dev emitted when this smart contract recieves money and from whom. 
    This event is tied to a solidity fallback function. 
    May be in revenue contract instead

    event ReceivedMoney(address, uint256);
    */
}
