var Web3 = require('web3');
// importing json file for abi and byte code
// change paths for the chosen computer
var copyrightGraphJson = require('/Users/ovad/Documents/GitHub/Fractional-Copyright-Token/artifacts/contracts/copyrightGraph.sol/copyrightGraph.json');
var setJson = require('/Users/ovad/Documents/GitHub/Fractional-Copyright-Token/artifacts/contracts/Set.sol/Set.json');
var queueJson = require('/Users/ovad/Documents/GitHub/Fractional-Copyright-Token/artifacts/contracts/Queue.sol/Queue.json');
var erc1155Json = require('/Users/ovad/Documents/GitHub/Fractional-Copyright-Token/artifacts/contracts/ERC1155.sol/ST1155Tokens.json');
// used for saving files to json 
const fs = require('fs');

async function main() {

    // deploy to mumbai testnet
    const rpcURL = "https://polygon-mumbai.g.alchemy.com/v2/MPuQ5F5IBMT3ZoJRgSTZcEeN_AlWDYoO";

    // deploy to polygon mainnet 
    // const rpcURL = process.env.API_URL;

    // deploy to localhost
    // const rpcURl = 'http://localhost:3000';

    // address to deploy contract
    // in this case hardhat
    const deployerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const hardhatPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    var web3 = new Web3(rpcURL);

    // getting all of the data for contract deployment 
    // 1
    const setJsonABI = setJson.abi;
    const setJsonBytecode = setJson.bytecode;

    let set_contract = new web3.eth.Contract(setJsonABI);

    const setDeployContract = set_contract.deploy({
        data: setJsonBytecode
    });

    const createTransaction = await web3.eth.accounts.signTransaction(
        {
            from: deployerAddress,
            data: setDeployContract.encodeABI(),
            gas: '5000000',
        },
        hardhatPrivateKey
    );

    const createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    console.log('Contract deployed at address', createReceipt.contractAddress);

    // saving address to json 
    saveFrontendFiles("setContract", createReceipt.contractAddress);

    // 2
    const queueJsonABI = queueJson.abi;
    const queueJsonBytecode = queueJson.bytecode;
    let queue_contract = new web3.eth.Contract(queueJsonABI);

    const queueDeployContract = queue_contract.deploy({
        data: queueJsonBytecode
    });

    createTransaction = await web3.eth.accounts.signTransaction(
        {
            from: deployerAddress,
            data: queueDeployContract.encodeABI(),
            gas: '5000000',
        },
        hardhatPrivateKey
    );

    createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    console.log('Contract deployed at address', createReceipt.contractAddress);

    // saving address to json 
    saveFrontendFiles("queueContract", createReceipt.contractAddress);

    // 3
    const copyrightGraphABI = copyrightGraphJson.abi;
    const copyrightGraphBytecode = copyrightGraphJson.bytecode;
    let copyright_contract = new web3.eth.Contract(copyrightGraphABI);

    const copyrightDeployContract = copyright_contract.deploy({
        data: copyrightGraphBytecode
    });

    createTransaction = await web3.eth.accounts.signTransaction(
        {
            from: deployerAddress,
            data: copyrightDeployContract.encodeABI(),
            gas: '5000000',
        },
        hardhatPrivateKey
    );

    createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    console.log('Contract deployed at address', createReceipt.contractAddress);

    // saving address to json 
    saveFrontendFiles("copyrightContract", createReceipt.contractAddress);

    // 4
    const erc1155JsonABi = erc1155Json.abi;
    const erc1155JsonBytecode = erc1155Json.bytecode;
    let erc1155Contract = new web3.eth.Contract(erc1155JsonABi);

    const erc1155DeployContract = erc1155Contract.deploy({
        data: erc1155JsonBytecode,
        arguments: ["myURI"],
    });

    createTransaction = await web3.eth.accounts.signTransaction(
        {
            from: deployerAddress,
            data: erc1155DeployContract.encodeABI(),
            gas: '5000000',
        },
        hardhatPrivateKey
    );

    createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    console.log('Contract deployed at address', createReceipt.contractAddress);

    // saving address to json 
    saveFrontendFiles("erc1155", createReceipt.contractAddress);
}

function saveFrontendFiles(name, Addr) {
    const fs = require("fs");
    const contractsDir = "/frontEndFiles";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + `/${name}-address.json`,
        JSON.stringify({ address: Addr }, undefined, 2)
    );

    const contractArtifact = artifacts.readArtifactSync(name);

    fs.writeFileSync(
        contractsDir + `/${name}.json`,
        JSON.stringify(contractArtifact, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
