// change to check
const { ethers } = require('hardhat');

async function main() {

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // deploying this contract is not needed for biconomy
    //const MinimalForwarder = await ethers.getContractFactory('MinimalForwarder');
    //const forwarder  = await MinimalForwarder.deploy();

    // deploy contracts here:
    const NFT = await ethers.getContractFactory("STFounderCollection");
    // trusting the minimum forwarder address provided by biconomy
    // https://docs.biconomy.io/misc/contract-addresses
    const nft = await NFT.deploy("0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b");

    saveFrontendFiles(nft, "STFounderCollection");

    console.log("NFT contract address", nft.address);
    
    
    //console.log("Minimal forwarder contract address", forwarder.address);
    // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
    //saveFrontendFiles(forwarder, "MinimalForwarder");
}

function saveFrontendFiles(contract, name) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../../frontend/contractsData";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + `/${name}-address.json`,
        JSON.stringify({ address: contract.address }, undefined, 2)
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
