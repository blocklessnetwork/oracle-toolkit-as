import { http } from "@blockless/sdk"
import { Date } from 'as-wasi/assembly'
import { BaseSource } from "../base"
import { SpotPriceData } from "../../types"

export class BinanceExchange extends BaseSource {
  protected symbol: string
  protected unit: string

  constructor(symbol: string, unit: string) {
    super('Binance Exchange', 'Exchange', symbol + unit)

    this.symbol = symbol
    this.unit = unit
  }

  /**
   * Fetches the spot price from the remote source.
   * 
   * @returns spot price and timestamp
   */
  fetchSpotPrice(): SpotPriceData {
    let spotPriceData = new SpotPriceData()

    const data = new http.Client().get(
      `https://data.binance.com/api/v3/ticker/price?symbol=${this.symbol}${this.unit}`
    )

    const price = data.getString('price')
    if (price) {
      spotPriceData.priceUnit = <f64>parseFloat(price._str)
      spotPriceData.priceLast = <f64>parseFloat(price._str)
      spotPriceData.ts = <i64>(Date.now() / 1000)
      spotPriceData.unit = this.unit
    }

    return spotPriceData
  }
}