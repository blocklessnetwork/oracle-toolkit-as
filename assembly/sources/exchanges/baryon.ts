import { http, json } from "@blockless/sdk"
import { Web3, PairToken } from "../../utils/web3"
import { BaseSource, SpotPriceData } from "../base"
import { Date } from "as-wasi/assembly"

export class Baryon extends BaseSource {
  protected source: string
  protected token0: PairToken
  protected token1: PairToken
  private web3Client: Web3

  /**
   * Construct the exchange source class
   * 
   * @param id unique identifier of the exchange source
   * @param source json api source
   */
  constructor(id: string, source: string, token0: PairToken, token1: PairToken, web3Client: Web3) {
    super(id, 'Baryon Pair ' + id)

    this.source = source
    this.token0 = token0
    this.token1 = token1
    this.web3Client = web3Client
  }

  /**
   * Fetches the spot price from the remote source
   * 
   * @returns spot price and timestamp 
   */
  fetchSpotPrice(): SpotPriceData {
    let spotPriceData = new SpotPriceData()

    const pairReserves = this.web3Client.getPairReserves(this.source)

    // Fetching spot price for token1
    const priceCUSD = pairReserves.reserve0 / pairReserves.reserve1
    spotPriceData.priceUnit = priceCUSD
    spotPriceData.ts = <i64>(Date.now() / 1000)
    spotPriceData.unit = this.token0.symbol

    const symbol = this.token0.symbol.toLowerCase()
    const unitPrice = new http.Client().get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=USD`)

    if (unitPrice && unitPrice.has(symbol)) {
      const unitUsd = unitPrice.get(symbol) as json.JSON.Obj
      if (unitUsd && unitUsd.has('usd')) {
        spotPriceData.priceLast = unitUsd.getFloat('usd')!._num * spotPriceData.priceUnit
      }
    }

    return spotPriceData
  }
}