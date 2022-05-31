import React from "react";
import { useState } from "react";
import { Biconomy } from "@biconomy/mexa";
import LoadingScreen from "./loadingScreen.js";
import AfterMint from "./AfterMint.js";
import "./Mint.css";

var goldThreshold = 3;

// function that checks if the email returned is valid 
function ValidateEmail(inputText) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/;
    if (inputText.match(mailformat)) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * @notice this function mints a token for the user if they have not allready minted a token 
 * @param {*} nft the contract to mint a token at  
 * @param {*} account the address to mint for 
 * @param {*} refer who is reffering the user to update blockchain info 
 */
const Mint = ({ nft, account, refer }) => {


    const [isLoading, setLoading] = useState(false);
    const [isAfterMint, setAfterMint] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    // terms of service widget
    let doesUserAgree = false;

    // On-chain Info
    const [ID, setID] = useState(0);
    const [email, setEmail] = useState("");
    const [supplyCap, setSupplyCap] = useState(0);
    const [allowTransfer, setAllowTransfer] = useState(0);
    const [referral, setReferral] = useState(refer);
    const [referralNumber, setReferralNumber] = useState(0);
    // the max ID for the contract
    const [maxIDRegistered, setMaxIDRegistered] = useState(0);


    // details needed for accessing on chain information
    let
        _id,
        _maxIDRegistered,
        _emailID,
        _referralEmailID,
        _supplyCap,
        _allowTransfer,
        _referralNum,
        _email


    /**
     * @notice async mint function that checks all preconditions to mint a token for the STFounderCollection 
     * contract 
     */
    const mint = async () => {
        // checking if user agrees to terms of service
        if (doesUserAgree) {
        try {
            if (email === "") {
                setErrorMessage("Please enter an email and reload the page.");
                return;
            }
            // if the address is registered by checking if it has an ID mapped to it 
            // if email is valid 
            if (ValidateEmail(email)) {
                const shouldContinue = await loadOnChainInfoMint();
                if (shouldContinue) {
                    // if refferal field is empty 
                    console.log("The max ID registered is", maxIDRegistered);
                    console.log("The supply cap is: ", supplyCap);
                    if (maxIDRegistered <= supplyCap) {
                        if (!allowTransfer) {
                            if (referral === "") {
                                setLoading(true);
                                //Call your target method (must be registered on the dashboard)
                                var tx = nft.methods.mint(email).send({
                                    from: account,
                                    signatureType: Biconomy.EIP712_SIGN,
                                    //optionally you can add other options like gasLimit
                                });
                                tx.on("transactionHash", function (hash) {
                                    console.log(`Transaction hash is ${hash}`);
                                    setLoading(false);
                                    setAfterMint(true);
                                    // showInfoMessage(`Transaction sent. Waiting for confirmation ..`);
                                }).once("confirmation", function (confirmationNumber, receipt) {
                                    console.log("The receipt is", receipt);
                                    console.log("The transaction hash is", receipt.transactionHash);
                                    console.log("The confirmation number is", confirmationNumber);

                                });
                            } else {
                                setLoading(true);
                                if (email != referral) {
                                    setLoading(true);
                                    let tx = nft.methods.mintWithRefferal(email, referral).send({
                                        from: account,
                                        signatureType: Biconomy.EIP712_SIGN,
                                    });

                                    await loadOnChainInfoAfterMint();

                                    tx.on("transactionHash", function (hash) {
                                        console.log(`Transaction hash is ${hash}`);
                                        setLoading(false);
                                        setAfterMint(true);
                                    }).once("confirmation", function (confirmationNumber, receipt) {
                                        console.log(receipt);
                                        console.log(receipt.transactionHash);
                                        console.log(confirmationNumber);

                                    });
                                } else {
                                    setErrorMessage("Cannot set refferal as yourself");
                                    return;
                                }
                            }
                        } else {
                            setErrorMessage("Minting is not allowed at this stage.");
                            return;
                        }
                    } else {
                        setErrorMessage("The max supply of tokens were minted. ");
                        return;
                    }
                } else {
                    return;
                }
            }
        } catch (err) {
            console.log(err);
            setErrorMessage(
                "Fail to send the transaction. If this happens repeatedly, please report in our Discord."
            );
            return;
        }
    } else { 
        setErrorMessage("Please agree to terms of service");
    }

    };


    /**
 * @notice accessing onChain info from the contract STFounderCollection. This function access address -> id 
 * mappings and id -> email mappings so the code can determine if the user has allready reffered people twice. 
 * @return boolean that indicates if the address is allready registered 
 */
    const loadOnChainInfoMint = async () => {
        console.log("This is on chain info for the mint function");
        _id = await nft.methods._address2id(account).call();
        console.log("The ID is", _id, "and should be zero to mint");
        // the first token ID is zero. Only an ID of zero for an address is acceptable
        setID(_id);
        if (ID == 0) {
            // plugging in the email and seeing if it allready registered
            _emailID = await nft.methods._email2id(email).call();
            console.log("The email written should have an ID of zero: emailID =", _emailID);
            if (_emailID == 0) {
                _referralEmailID = await nft.methods._email2id(referral).call();
                console.log("The refferal should be empty or if written allready registered.", _referralEmailID);
                if (referral != "" && _referralEmailID == 0) {
                    setErrorMessage("The referral email is not registered");
                    return 0;
                }
            } else {
                setErrorMessage("The email you put is allready registered.");
                return 0;
            }
        } else {
            setErrorMessage("Your address allready owns an NFT.");
            return 0;
        }
        // getting the supply cap for this contract
        _supplyCap = await nft.methods.supplyCap().call();
        setSupplyCap(_supplyCap);
        // getting the max ID registered currently 
        _maxIDRegistered = await nft.methods.tokenCount().call();
        setMaxIDRegistered(_maxIDRegistered);
        // finding if transfers are allowed
        _allowTransfer = await nft.methods.allowTransfer().call();
        setAllowTransfer(_allowTransfer);

        return 1;
    };

    const loadOnChainInfoAfterMint = async () => {
        /**
        * Setting the email and referral number since ID must be > 0 now 
        */
        _id = await nft.methods._email2id(referral).call();
        console.log("The referal ID is", _id);
        _referralNum = await nft.methods.referrals(_id).call();
        setReferralNumber(_referralNum);
    }

    const userAgreement = () => { 
        console.log("The user agrees? ", !doesUserAgree);
        doesUserAgree = !doesUserAgree;
    }

    // const ADMIN = async() => {
    //     await nft.methods
    //         .transferFrom(account, "0xD8e766A237a8b6AaB72D06c03bb2CCF6E72dd84b", 1)
    //         .send({ from: account });
    //     await nft.methods
    //         .changeAllowTransfer(true)
    //         .send({ from: account });
    // }

    return (
        <div className="Mint">
            <div>

                {isAfterMint ? (
                    <div>
                        <AfterMint email={email} gold={referralNumber > goldThreshold} referralNum={referralNumber} />
                    </div>
                ) : (
                    <div>
                        {isLoading ? (
                            <LoadingScreen chainID={80001} />
                        ) : (
                            <div>
                                <input
                                    className="react-input"
                                    type="text"
                                    placeholder="Email Address (Required)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    className="react-input"
                                    type="text"
                                    placeholder="Referral Email (Optional)"
                                    // value={referPrefix + referral}
                                    readOnly={refer}
                                    onChange={(e) => setReferral(e.target.value)}
                                />
                                <input type="checkbox" className="checkmark" onClick={userAgreement} />
                                <a href={`https://etherscan.io/address/${account}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="serviceterms"
                                >
                                    Read our terms of service here:
                                </a>
                                <button className="btn-react-mint" onClick={mint}>
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <br />
            <div>
                {errorMessage && (
                    <div className="error">
                        <p>{errorMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mint;