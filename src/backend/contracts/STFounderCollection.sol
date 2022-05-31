// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract STFounderCollection is
    ERC721,
    Pausable,
    AccessControl,
    ERC2771Context
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ALLOW_TRANSACTIONS_ROLE =
        keccak256("ALLOW_TRANSACTIONS_ROLE");
    bytes32 public constant INCREASE_TOKEN_CAP_ROLE =
        keccak256("INCREASE_TOKEN_CAP_ROLE");

    address public admin;
    bool public allowTransfer = false;
    uint256 public tokenCount = 1;
    uint256 public supplyCap = 100;

    // map ID -> number of people who have been refered by said ID 
    mapping(uint256 => uint256) public referrals;

    // ID -> email
    mapping(uint256 => string) public _id2email;

    // email -> ID
    mapping(string => uint256) public _email2id;

    mapping(address => uint256) public _address2id;

    // setting a base URI that can change whenever the users URI will be able to change
    string private _customBaseURI = "https://st.world/nft/";
    address public trustedForwarder;

    constructor(address forwarder)
        ERC2771Context(forwarder)
        ERC721("STFounderCollection", "STFC")
    {
        trustedForwarder = forwarder;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, forwarder);

        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(ALLOW_TRANSACTIONS_ROLE, msg.sender);
        _grantRole(INCREASE_TOKEN_CAP_ROLE, msg.sender);
    }

    function setTrustedForwarder(address _trustedForwarder)
        public
        onlyRole(MINTER_ROLE)
    {
        trustedForwarder = _trustedForwarder;
    }

    // Function to change the base URI if someone is upgrading their token
    // not complete but works
    function setBaseURI(string memory newBaseURI) public {
        _customBaseURI = newBaseURI;
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mintWithRefferal(string memory _email, string memory _referral)
        public
    {
        require(
            tokenCount <= supplyCap,
            "Token Cap reached. Contact bell@st.world."
        );
        require(
            keccak256(bytes(_email)) != keccak256(bytes(_referral)),
            "Cannot refer yourself!"
        );
        require(
            _address2id[_msgSender()] == 0,
            "Please remove referral field. You allready own the NFT."
        );
        require(_email2id[_email] == 0, "Email is already registered.");
        require(_email2id[_referral] != 0, "Referral email is not registered.");
        require(!allowTransfer, "No new minting at this stage");

        _safeMint(_msgSender(), tokenCount);
        tokenCount ++;
        _address2id[_msgSender()] = tokenCount;
        _id2email[tokenCount] = _email;
        _email2id[_email] = tokenCount;
        // couting the number of refferals
        referrals[_email2id[_referral]]++;
    }

    function mint(string memory _email) public {
        require(
            tokenCount < supplyCap,
            "Token Cap reached. Contact bell@st.world."
        );
        require(_email2id[_email] == 0, "Email is already registered.");
        require(!allowTransfer, "No new minting at this stage");

        // default value for address -> ID/any mapping is zero
        _safeMint(_msgSender(), tokenCount);
        tokenCount++;

        _address2id[_msgSender()] = tokenCount;
        _id2email[tokenCount] = _email;
        _email2id[_email] = tokenCount;
    }

    // function which allows the user to
    function changeEmail(string memory _email) public onlyRole(MINTER_ROLE) {
        // override email address for your existing NFT
        uint256 id = _address2id[_msgSender()];
        string memory prevEmail = _id2email[id];
        _email2id[prevEmail] = 0;
        _id2email[id] = _email;
        _email2id[_email] = id;
    }

    function increaseTokenCap(uint256 _amount)
        external
        onlyRole(INCREASE_TOKEN_CAP_ROLE)
    {
        supplyCap += _amount;
    }

    function changeAllowTransfer(bool allow)
        external
        onlyRole(ALLOW_TRANSACTIONS_ROLE)
    {
        allowTransfer = allow;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);

        _address2id[from] = 0;
        _address2id[to] = tokenId;
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
