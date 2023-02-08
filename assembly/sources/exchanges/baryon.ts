import { u128 } from "as-bignum/assembly"
import { http, json } from "@blockless/sdk"
import { Date } from 'as-wasi/assembly'
import { PairReserves, PairToken } from "../types"
import { BaseSource, SpotPriceData } from "../base"

export class BaryonExchangeBSC extends BaseSource {
  protected source: string
  protected token0: PairToken
  protected token1: PairToken

  /**
   * Construct the exchange source class
   * 
   * @param source json api source
   */
  constructor(source: string, token0: PairToken, token1: PairToken) {
    super('Baryon Network', 'Binance AMM', source)

    this.source = source
    this.token0 = token0
    this.token1 = token1
  }

  getName(): string {
    return `${this.token0.symbol}/${this.token1.symbol} Baryon Network`
  }

  /**
   * Fetches the spot price from the remote source
   * 
   * @returns spot price and timestamp
   */
  fetchSpotPrice(): SpotPriceData {
    let spotPriceData = new SpotPriceData()

    const pairReserves = this.getPairReserves(this.source)

    // Fetching spot price for token1
    const priceCUSD = pairReserves.reserve0 / pairReserves.reserve1
    spotPriceData.priceUnit = priceCUSD
    spotPriceData.ts = <i64>(Date.now() / 1000)
    spotPriceData.unit = this.token0.symbol

    // Fetch unit price
    if (this.token0.symbol.toLowerCase() !== 'usd') {
      const unitPrice = this.getUsdUnitPrice(this.token0.symbol.toLowerCase())
      spotPriceData.priceLast = unitPrice * spotPriceData.priceUnit
    } else {
      spotPriceData.priceLast = spotPriceData.priceUnit
    }

    return spotPriceData
  }

  /**
   * Fetch pair reserve
   * 
   * @param pair 
   * @returns 
   */
  private getPairReserves(pair: string): PairReserves {
    let reserve0 = 0.0
    let reserve1 = 0.0

    const data = new http.Client().post(
      `https://bsc-dataseed.binance.org`,
      `{"jsonrpc":"2.0","id":2,"method":"eth_call","params":[{"data":"0x0902f1ac","to":"${pair}"},"latest"]}`
    )
    const result = data.getString('result')

    if (result) {
      let pos = 2
      const r0 = u128.fromString(result._str.slice(pos, pos += 64), 16)
      const r1 = u128.fromString(result._str.slice(pos, pos += 64), 16)

      reserve0 = r0.toF64() / 1e18
      reserve1 = r1.toF64() / 1e18
    }

    return new PairReserves(reserve0, reserve1)
  }

  /**
   * Fetch unit price from an external service
   * 
   * @param unit 
   * @returns 
   */
  private getUsdUnitPrice(unit: string): f64 {
    let unitPrice = 0.0
    const unitPriceData = new http.Client().get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${unit}&vs_currencies=USD`
    )

    if (unitPriceData && unitPriceData.has(unit)) {
      const unitUsd = unitPriceData.get(unit) as json.JSON.Obj

      if (unitUsd && unitUsd.has('usd')) {
        unitPrice = unitUsd.getFloat('usd')!._num
      }
    }

    return unitPrice
  }
}