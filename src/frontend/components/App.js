// directions for what do during and after minting 
import Mint from "./Mint.js";
import AfterMint from "./AfterMint.js";
import LoadingScreen from "./loadingScreen.js";
import WrongChain from "./wrongChain.js";
import "./App.css";

// react components
import React from "react";
import { useState, useEffect } from "react";

// web3 and css components
import Web3 from "web3";

// taking address and abi of STFounderCollection contract from json files
import address from "../contractsData/STFounderCollection-address.json";
import abi from "../contractsData/STFounderCollection.json";


// Import Biconomy
import { Biconomy } from "@biconomy/mexa";
require('dotenv').config();


let web3;
var goldThreshold = 3;

/**
 * @notice this app is responsible for signing the user into metamask and allowing the user to input an email 
 * to register an NFT for their email. It is also responsible for gasless metatransactions using biconomy. 
 */
function App() {

    // state variables for checking right chain 
    let chainID;
    const [isCorrectChainID, setCorrectChainID] = useState(true);

    // state of the app initial values
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");

    // Web3
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState([]);

    // On-chain Info
    const [balance, setBalance] = useState(0);
    const [email, setEmail] = useState("");
    let [id, setID] = useState(0);
    const [referralNum, setReferralNum] = useState(0);


    // details needed for an NFT account
    let _contract,
        _account = "",
        _id,
        _referralNum,
        _refer = "",
        _supplyCap,
        _allowTransfer,
        _email = "";


    // what is the url the user accessed this window from
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // if the url paramter has refer this means someone did the refferning
    // is this correct? 
    if (urlParams.has('refer')) {
        _refer = urlParams.get('refer');
    }

    // checks if the user is connected to metamask. If not they need to connect 
    // and reload the page
    // this runs right after the render of the page as a react component
    // https://reactjs.org/docs/hooks-effect.html
    useEffect(() => {
        function checkConnectedWallet() {
            try {
                const userData = JSON.parse(localStorage.getItem('userAccount'));
                /** commenting this out so user has to click button to start metamask
                if (userData != null) {
                    // call onConnect() function 
                    onConnect();
                }
                */
            } catch (err) {
                console.log(err);
                setErrorMessage("You are not connected to metamask. Please log into metamask and reload the page.")
            }
        }
        checkConnectedWallet();
    }, []);

    // Set reload of page to the starting area
    window.ethereum.on("accountsChanged", function () {
        setIsConnected(false);
        setLoading(false);
    });
    window.ethereum.on("chainChanged", function () {
        setIsConnected(false);
        setLoading(false);
    });

    /**
     * @notice onConnect is an async function that sets ups the users accounts and initializes biconomy to 
     * enable meta transactions is Mint.js. Note that the trusted forwarder account for biconomy is in deploy.js
     * @returns 
     */
    const onConnect = async () => {
        setLoading(true);

        // Load Web3
        // Loads in the metamask account window.ethereum 
        const provider = detectCurrentProvider();
        await provider.enable();
        setLoadingMessage("Initializing Biconomy ...");
        // iniitalizing biconomy with metamask as the provier and API key from biconomy
        const biconomy = new Biconomy(provider, { apiKey: "MLIqnbOMO1.11db6397-fb75-4c43-b647-c07b8492e0b3", debug: true });
        // starting new web3 wallet to sign and make transactions
        web3 = new Web3(biconomy);

        // getting the chain ID for your wallet
        chainID = await web3.eth.getChainId();

        // checking for the correct chainID for metamask to sign transactions 
        // in this case it must be polygon testnet
        if (chainID != 80001) {
            console.log("Please change your metamask account to polygon testnet and then reload the page.");
            setCorrectChainID(false);
            return;
        }



        // on an event biconomy initializes and is ready to use 
        biconomy.onEvent(biconomy.READY, async () => {

            // Load Users
            const userAccount = await window.ethereum.request({
                method: "eth_requestAccounts",
            });


            if (userAccount.length === 0) {
                setErrorMessage("Please add an account to the MetaMask. Go to https://chainlist.org/ and add MATIC polygon testnet to your account. ");
            }
            _account = userAccount[0];
            setAccount(_account);

            // Load ETH Balances
            let ethBalance = await web3.eth.getBalance(_account); // Get wallet balance
            ethBalance = web3.utils.fromWei(ethBalance, "ether"); //Convert balance to wei
            setBalance(ethBalance);

            // Save User Info
            saveUserInfo(ethBalance, _account, chainID);

            // Load Contract
            loadContract();

            await setIDFromChain();

            setIsConnected(true);
            setLoading(false);

            // the page is not loading any nire
            // code to report error messages for debugging
        }).onEvent(biconomy.ERROR, (error, message) => {
            console.log(error);
            console.log(message);
        });

    };

    /**
     * @notice loads in the contract using its address and abi using web3 components. 
     * Initializes new contract object
     */
    const loadContract = () => {
        const addressJson = address.address;
        const abiJson = abi.abi;
        _contract = new web3.eth.Contract(abiJson, addressJson);
        setContract(_contract);
    };

    /**
     * 
     * @param {*} ethBalance the balances the wallet has in ether
     * @param {*} account what account the wallet is linked to 
     * @param {*} chainId what chainID are they using - should be 80001 MATIC testnet
     */
    const saveUserInfo = (ethBalance, account, chainId) => {
        const userAccount = {
            account: account,
            balance: ethBalance,
            connectionid: chainId,
        };
        window.localStorage.setItem('userAccount', JSON.stringify(userAccount)); //user persisted data
    };

    /**
     * @notice detects the current provider of a web3 wallet. Looks for a metamask wallet and 
     * sets an error that no wallet was found if the user does not have metamask
     */
    const detectCurrentProvider = () => {
        try {
            let provider;
            if (window.ethereum) {
                provider = window.ethereum;
            } else {
                setErrorMessage("No Web3 wallet detected. Please download and install metamask");
            }
            return provider;
        } catch (err) {
            setErrorMessage("No Web3 wallet detected.");
        }
    };

    const setIDFromChain = async () => {
        _id = await _contract.methods._address2id(_account).call();
        console.log("The ID is", _id);
        // this is only a front end vairiable and cannot be accessed by
        setID(_id);
        if (_id != 0) {
            // the first token ID is zero. Will this work? 
            _email = await _contract.methods._id2email(_id).call();
            setEmail(_email);
            console.log("test");
            console.log("The email is", email);
            _referralNum = await _contract.methods.referrals(_id).call();
            console.log("The refferal Number is", _referralNum);
        }
    };



    return (
        <div className="App">
            <div className="react-container">
                <div>
                    {isCorrectChainID ? (<div>
                        {isConnected ? (
                            /*is the user connected to web3 wallet? If yes, do first case
                           */
                            <div>
                                <a
                                    href={`https://etherscan.io/address/${account}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-react-grey"
                                >
                                    <button>
                                        {"Address: " +
                                            account.slice(0, 4) +
                                            "..." +
                                            account.slice(38, 42)}
                                    </button>
                                </a>
                                <div>
                                    <div>
                                        {id > 0 ? (
                                            // if the NFT ID greater than zero
                                            <div>
                                                <AfterMint email={email} gold={referralNum > goldThreshold} referralNum={_referralNum} />
                                            </div>
                                            // If the NFT ID is 0, then mint an NFT for the account. ID relates to number of coins
                                        ) : (
                                            <Mint nft={contract} account={account} refer={_refer} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // if the user is not connected to wallet, the user clicks a button to connect the wallet
                            // dictating the position of the buttons 
                            <div>

                                <div>
                                    {isLoading ? (
                                        // if yes print loading screen 
                                        <LoadingScreen />
                                        // if not display the buttons
                                    ) : (
                                        <div className="nft-display-app">
                                            <img
                                                src="https://st.world/wp-content/uploads/2022/05/ezgif.com-gif-maker-13.gif"
                                            />
                                            <h2>Free NFT For Alpha Access</h2>
                                            <button className="btn-react" onClick={onConnect}>
                                                Connect Wallet
                                            </button>
                                            {errorMessage && (
                                                // if there is an error message, send user to resources

                                                <div className="error">
                                                    <br />
                                                    <p>{errorMessage}</p>
                                                    <a
                                                        href="https://www.geeksforgeeks.org/how-to-install-and-use-metamask-on-google-chrome/"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Setup Instruction
                                                    </a>
                                                </div>
                                            )}
                                            <a
                                                href={`https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-started-with-MetaMask`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <button className="btn-react">
                                                    Setup Your Blockchain Wallet Here
                                                </button>
                                            </a>
                                        </div>)}
                                </div>
                            </div>
                        )}
                    </div>) : (
                        <div>
                            <WrongChain chainID={chainID} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;