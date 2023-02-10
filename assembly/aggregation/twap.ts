import { Date } from 'as-wasi/assembly'
import { json } from "@blockless/sdk"
import { RedisStorage } from '../utils/redis'
import { BaseAggregation } from "./base"
import { BaseSource } from "../sources/base"
import { AggregationData } from './types'

export class TWAPAggregation extends BaseAggregation {
  /**
   * Creates a TWAP aggregator to fetch the last average spot price and
   * return a TWAP result.
   * 
   * @param id unique id of the source
   * @param storageClient a KV storage client reference
   */
  constructor(id: string, storageClient: RedisStorage) {
    super(id, 'twap', storageClient)
  }

  private avgLastPrice(sources: Array<BaseSource>): f64 {
    let priceCumulative: f64 = 0.0

    for (let i = 0; i < sources.length; i++) {
      const dataSource = sources[i]
      const spotPriceData = dataSource.fetchSpotPrice()

      priceCumulative += <f64>spotPriceData.priceLast
    }

    return sources.length > 0 ? priceCumulative / sources.length : priceCumulative
  }

  /**
   * Inserting the latest spot price and return the TWAP
   * value for all prices within the given window
   * 
   * @returns twap aggregated price data
   */
  aggregate(sources: Array<BaseSource>): AggregationData {
    const data = this.fetchData()

    if (sources.length > 0) {
      const ts = <i64>(Date.now() / 1000)
      const avgLastPrice = this.avgLastPrice(sources)
      data.insertSpotPrice(ts, 'USD', avgLastPrice)

      let priceCumulative: f64 = 0.0
      let tsLast: i64 = 0
      let tsLatest: i64 = ts
      let tsElapsed: i64 = 0

      const pricesArray = data.prices._arr
      for (let i = 1; i < pricesArray.length; i++) {
        const price = <json.JSON.Obj>pricesArray[i]
        const priceLast = <json.JSON.Obj>pricesArray[i - 1]

        const priceTs = price.getInteger('ts')!._num
        const priceLastTs = priceLast.getInteger('ts')!._num
        const priceLastValue = <f64>priceLast.getFloat('value')!._num

        priceCumulative += priceLastValue * <f64>(priceTs - priceLastTs)
        if (i === 1) tsLast = priceLastTs
      }

      tsElapsed = tsLatest - tsLast
      const priceAverage = (priceCumulative / <f64>tsElapsed) || 0

      // Save New TWAP Data
      data.price = priceAverage || avgLastPrice
      this.saveData(data)
    }
    
    return data
  }
}