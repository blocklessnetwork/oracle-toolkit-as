import { json } from "@blockless/sdk"
import { RedisStorage } from "../utils/redis"
import { BaseSource } from "../sources"

export abstract class BaseAggregation {
  protected id: string
  protected type: string
  protected storageClient: RedisStorage

  constructor(id: string, type: string, storageClient: RedisStorage) {
    this.id = id
    this.type = type
    this.storageClient = storageClient
  }

  private getId(): string {
    return (this.id + '_' + this.type + '_data').toLowerCase()
  }

  getType(): string {
    return this.type
  }

  /**
   * Fetch data from the database
   * 
   * @returns data object
   */
  fetchData(): AggregationData {
    let data = new AggregationData()

    const response = this.storageClient.get(this.getId())
    if (response) data.setData(response)

    return data
  }

  /**
   * Saves data to the database
   * 
   * @param data twap data object
   * @returns success state for the data storage
   */
  saveData(data: AggregationData): boolean {
    this.storageClient.set(this.getId(), data.toString())
    return true
  }

  /**
   * Fetches the mean price from twap data storage
   * 
   * @returns the mean price of the exchange
   */
  fetchPrice(): f64 {
    let value: f64 = 0.0

    const sourceData = this.storageClient.get(this.getId())
    const sourceJson = <json.JSON.Obj>json.JSON.parse(sourceData)

    if (sourceJson.has('price') && sourceJson.getFloat('price')!._num > 0) {
      value = sourceJson.getFloat('price')!._num
    }

    return <f64>value
  }

  abstract aggregate(sources: Array<BaseSource>): AggregationData
}

export class AggregationData {
  public ts: i64
  public price: f64
  public unit: string
  public prices: json.JSON.Arr
  public isValid: boolean = false

  constructor() {
    this.ts = 0
    this.unit = 'USD'
    this.price = 0.0
    this.prices = new json.JSON.Arr()
  }

  setData(dataStr: string): void {
    if (dataStr && dataStr !== '') {
      const parsedTwapData = <json.JSON.Obj>json.JSON.parse(dataStr)

      this.ts = <i64>parsedTwapData.getInteger('ts')!._num
      this.unit = parsedTwapData.getString('unit')!._str
      this.price = <f64>parsedTwapData.getFloat('price')!._num
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
    data.set('price', this.price)
    data.set('prices', this.prices)

    return data.toString()
  }
}

