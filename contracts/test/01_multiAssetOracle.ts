import hre from "hardhat"
import { expect } from "chai"
import { MultiAssetPriceOracleV1 } from "../typechain-types"
import { BigNumber } from "ethers"

/**
 * Test access control for MultiAssetPriceOracleV1
 * 
 */
describe("MultiAssetPriceOracleV1 Access", function () {
  let multiAssetOracle: MultiAssetPriceOracleV1

  before(async () => {
    const Oracle = await hre.ethers.getContractFactory("MultiAssetPriceOracleV1")
    multiAssetOracle = await Oracle.deploy('Test Oracle', 'This is a test orarcle contract', 8)
  })

  it("Should initialize with an owner", async function () {
    const [owner] = await hre.ethers.getSigners()

    const contractOwner = await multiAssetOracle.owner()
    expect(owner.address).to.equal(contractOwner)
  })

  it("Should pass when an updater address is autorized", async function () {
    const [owner] = await hre.ethers.getSigners()

    // Add owner as an authorized Oracle Updater
    await multiAssetOracle.authorizeUpdater(owner.address)

    // Check if oracle is authorized
    expect(await multiAssetOracle.isUpdaterAuthorized(owner.address)).to.equal(true)
  })

  it("Should fail when an updater address is autorized", async function () {
    const [owner] = await hre.ethers.getSigners()

    // Add owner as an authorized Oracle Updater
    await multiAssetOracle.deauthorizeUpdater(owner.address)

    // Check if oracle is authorized
    expect(await multiAssetOracle.isUpdaterAuthorized(owner.address)).to.equal(false)
  })
})

/**
 * Test data update and retrieval
 */
describe("MultiAssetPriceOracleV1 Data", function () {
  let multiAssetOracle: MultiAssetPriceOracleV1

  before(async () => {
    const Oracle = await hre.ethers.getContractFactory("MultiAssetPriceOracleV1")
    multiAssetOracle = await Oracle.deploy('Test Oracle', 'This is a test orarcle contract', 8)
  })

  it("Should result an empty dataset", async function () {
    const [ price ] = await multiAssetOracle.latestData('BNB')
    expect(price).to.equal(BigNumber.from(0))
  })

  it("Should update dataset with price", async function() {
    const [owner] = await hre.ethers.getSigners()
    
    const symbol = 'BNB'
    const price  = 232 * 1e8
    const timestamp = Math.floor(Date.now() / 1000)

    // Authorize the updater
    await multiAssetOracle.authorizeUpdater(owner.address);

    await expect(multiAssetOracle.updatePrice(symbol, price, timestamp))
      .to.emit(multiAssetOracle, "NewAnswer")
  })

  it("Should result dataset with price", async function () {
    const matchPrice = 232 * 1e8
    const [price] = await multiAssetOracle.latestData('BNB')
    expect(price).to.equal(BigNumber.from(matchPrice))
  })

})