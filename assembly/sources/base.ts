export class SpotPriceData {
  public ts: i64
  public unit: string
  public priceLast: f64
  public priceUnit: f64

  constructor() {
    this.ts = 0
    this.unit = 'USD'
    this.priceLast = 0.0
    this.priceUnit = 0.0
  }

  setData(ts: i64, unit: string, priceLast: f64): void {
    this.ts = ts
    this.unit = unit
    this.priceLast = priceLast
  }

  toString(): string {
    return this.priceLast.toString() + ' ' + this.unit + ' @ ' + this.ts.toString()
  }
}

export abstract class BaseSource {
  public id: string
  public description: string

  constructor(id: string, description: string) {
    this.id = id
    this.description = description
  }

  abstract fetchSpotPrice(): SpotPriceData
}