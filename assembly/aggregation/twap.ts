import { json } from "@blockless/sdk"
import { RedisStorage } from '../utils/redis'
import { BaseAggregation } from "./base"
import { BaseSource } from "../sources/base"

export class TWAPAggregation extends BaseAggregation {
  private redisClient: RedisStorage

  /**
   * Construct the exchange source class
   * 
   * @param id unique identifier of the exchange source
   * @param source json api source
   */
  constructor(source: BaseSource, redisClient: RedisStorage) {
    super(source)
    this.redisClient = redisClient
  }

  /**
   * Fetches the mean price from twap data storage
   * 
   * @returns the mean price of the exchange
   */
  fetchPrice(): f64 {
    let value: f64 = 0.0

    const sourceData = this.redisClient.get(this.source.getSource() + '_twap')
    const sourceJson = <json.JSON.Obj>json.JSON.parse(sourceData)

    if (sourceJson.has('priceMean') && sourceJson.getFloat('priceMean')!._num > 0) {
      value = sourceJson.getFloat('priceMean')!._num
    }

    return <f64>value
  }

  /**
   * Fetch twap data from the database
   * 
   * @returns twap data object
   */
  fetchTwapData(): TwapData {
    let twapData = new TwapData()

    const twapResponse = this.redisClient.get(this.source.getSource() + '_twap')
    if (twapResponse) twapData.setData(twapResponse)

    return twapData
  }

  /**
   * Saves twap data to the database
   * 
   * @param twapData twap data object
   * @returns success state for the data storage
   */
  saveTwapData(twapData: TwapData): boolean {
    this.redisClient.set(this.source.getSource() + '_twap', twapData.toString())
    return true
  }

  /**
   * Execute a twap calculation on all recorded spot price data
   * 
   * @returns 
   */
  aggregateTwapData(): TwapData {
    const spotPrice = this.source.fetchSpotPrice()
    const twapData = this.fetchTwapData()

    if (spotPrice.priceLast) {
      twapData.insertSpotPrice(spotPrice.ts, spotPrice.unit, spotPrice.priceLast)

      let priceCumulative: f64 = 0.0
      let tsLast: i64 = 0
      let tsLatest: i64 = spotPrice.ts
      let tsElapsed: i64 = 0

      const pricesArray = twapData.prices._arr
      for (let i = 1; i < pricesArray.length; i++) {
        const price = <json.JSON.Obj>pricesArray[i]
        const priceLast = <json.JSON.Obj>pricesArray[i - 1]

        const priceTs = price.getInteger('ts')!._num
        const priceLastTs = priceLast.getInteger('ts')!._num
        const priceLastValue = <f64>priceLast.getFloat('value')!._num

        priceCumulative += priceLastValue * <f64>(priceTs - priceLastTs)
        if (i === 1) tsLast = priceLastTs
      }

      // Calc
      tsElapsed = tsLatest - tsLast
      const priceAverage = (priceCumulative / <f64>tsElapsed) || 0

      // Save New TWAP Data
      twapData.priceMean = priceAverage || spotPrice.priceLast
      this.saveTwapData(twapData)
    }

    return twapData
  }
}

export class TwapData {
  public ts: i64
  public priceMean: f64
  public unit: string
  public prices: json.JSON.Arr
  public isValid: boolean = false

  constructor() {
    this.ts = 0
    this.unit = 'USD'
    this.priceMean = 0.0
    this.prices = new json.JSON.Arr()
  }

  setData(dataStr: string): void {
    if (dataStr && dataStr !== '') {
      const parsedTwapData = <json.JSON.Obj>json.JSON.parse(dataStr)

      this.ts = <i64>parsedTwapData.getInteger('ts')!._num
      this.unit = parsedTwapData.getString('unit')!._str
      this.priceMean = <f64>parsedTwapData.getFloat('priceMean')!._num
      this.prices = parsedTwapData.getArr('prices')!
    }
  }

  insertSpotPrice(ts: i64, unit: string, priceLast: f64): void {
    const priceObj = new json.JSON.Obj()
    priceObj.set('ts', ts)
    priceObj.set('unit', unit)
    priceObj.set('value', priceLast)

    // Insert spot price
    this.prices.push(priceObj)
    this.ts = ts
    this.unit = unit

    // Keep only the last 10 records
    this.prices._arr = this.prices._arr.slice(-10)
  }

  toString(): string {
    const data = new json.JSON.Obj()
    data.set('ts', this.ts)
    data.set('unit', this.unit)
    data.set('priceMean', this.priceMean)
    data.set('prices', this.prices)

    return data.toString()
  }
}