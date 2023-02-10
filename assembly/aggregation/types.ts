import { json } from "@blockless/sdk"

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