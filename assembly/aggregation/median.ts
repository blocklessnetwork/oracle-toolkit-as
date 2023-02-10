import { Date } from 'as-wasi/assembly'
import { RedisStorage } from '../utils/redis'
import { BaseAggregation } from "./base"
import { BaseSource } from "../sources/base"
import { json } from '@blockless/sdk'
import { AggregationData } from './types'

export class MedianAggregation extends BaseAggregation {
  /**
   * Construct the exchange source class
   * 
   * @param id unique identifier of the exchange source
   * @param source json api source
   */
  constructor(id: string, storageClient: RedisStorage) {
    super(id, 'median', storageClient)
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
   * Run a median calculation on recorded spot price data
   * 
   * @returns 
   */
  aggregate(sources: Array<BaseSource>): AggregationData {
    const data = this.fetchData()
    
    if (sources.length > 0) {
      const ts = <i64>(Date.now() / 1000)
      const prices: Array<f64> = []
      const avgLastPrice = this.avgLastPrice(sources)
      data.insertSpotPrice(ts, 'USD', avgLastPrice)
      
      const pricesArray = data.prices._arr
      for (let i = 0; i < pricesArray.length; i++) {
        const priceObj = <json.JSON.Obj>pricesArray[i]
        if (priceObj) {
          prices.push(priceObj.getFloat('value')!._num)
        }
      }
      
      prices.sort((a, b) => <i32>(a - b))
      const mid = <i32>Math.floor(prices.length / 2)
      
      if (prices.length % 2 !== 0) {
        data.price = prices[mid];
      } else {
        data.price = (prices[mid - 1] + prices[mid]) / 2;
      }

      data.ts = ts
      this.saveData(data)
    }

    return data
  }
}