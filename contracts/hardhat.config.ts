import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-ethers"
import { HardhatUserConfig } from "hardhat/config"

require('dotenv').config()

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    localhost: {
      forking: {
        url: process.env.RPC_NODE_ENDPOINT as string
      }
    }
  },
  paths: {
    sources: './src'
  }
}

export default config