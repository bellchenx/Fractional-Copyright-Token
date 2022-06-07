/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
   const accounts = await hre.ethers.getSigners();
 
   for (const account of accounts) {
     console.log(account.address);
   }
 });

module.exports = {
  solidity: "0.8.6",
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test"
  },
  defaultNetwork: "localhost",
   networks: {
      hardhat: {},
      /*
      matic: {
         url: process.env.API_URL,
         accounts: [process.env.PRIVATE_KEY],
      },
      mumbai: {
         url: process.env.API_URL_MUMBAI,
         accounts: [process.env.PRIVATE_KEY],
      }
      */
   },
};
