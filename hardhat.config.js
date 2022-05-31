/**
* @type import('hardhat/config').HardhatUserConfig
*/

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
  solidity: "0.8.13",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  defaultNetwork: "localhost",
   networks: {
      hardhat: {},
      /** 
      mainnet: {
         url: API_URL2,
         accounts: [`0x${PRIVATE_KEY}`],
         gasPrice: 25000000000
      },
      */
      mumbai: {
         url: 'https://polygon-mumbai.g.alchemy.com/v2/MPuQ5F5IBMT3ZoJRgSTZcEeN_AlWDYoO',
         accounts: [process.env.PRIVATE_KEY],
      }
   },
};