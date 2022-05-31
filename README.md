# ST Founder Medal NFT

## Technology Stack & Tools

- Solidity (Writing Smart Contract)
- Javascript (React & Testing)
- [Ethers](https://docs.ethers.io/v5/) (Blockchain Deployment)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Web3.js](https://web3js.readthedocs.io/en/v1.7.3/) (Blockchain Interaction)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/), should work with any node version below 16.5.0
- Install [Hardhat](https://hardhat.org/)

## Setting Up
### 1. Install Dependencies:
```
$ npm install
```
### 2. Boot up local development blockchain
```
$ npx hardhat node
```

### 3. Connect development blockchain accounts to Metamask
- Copy private key of the addresses and import to Metamask
- Connect your metamask to hardhat blockchain, network 127.0.0.1:8545.
- If you have not added hardhat to the list of networks on your metamask, open up a browser, click the fox icon, then click the top center dropdown button that lists all the available networks then click add networks. A form should pop up. For the "Network Name" field enter "Hardhat". For the "New RPC URL" field enter "http://127.0.0.1:8545". For the chain ID enter "31337". Then click save.  

## Common Command
### 1. Deploy Smart Contracts
`npx hardhat run src/backend/scripts/deploy.js`

### 2. Run Test Cases
`$ npx hardhat test`

### 3. Launch Frontend Locally
`$ npm run start`

## Steps to get list of contract functions you can use: I used public accessible keys for the example
First you need to setup your deploy function. Then: 
- npx hardhat run src/backend/scripts/deploy.js --network localhost
- NFT contract address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- npx hardhat console --network localhost
- const contract = await ethers.getContractAt("STFounderCollection", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
- Type "contract": Lists all of the methods and state for that contract
- Can call other methods from here to see the “state”

