import { json } from "@blockless/sdk"
import { RedisStorage } from "../utils/redis"
import { BaseSource } from "../sources"
import { AggregationData } from "../types"

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

