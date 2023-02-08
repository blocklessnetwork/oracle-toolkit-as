export abstract class BaseSource {
  protected name: string
  protected type: string
  protected source: string

  constructor(name: string, type: string, source: string) {
    this.name = name
    this.type = type
    this.source = source
  }

  getName(): string {
    return this.name
  }
  
  getType(): string {
    return this.type
  }

  getSource(): string {
    return this.source
  }

  abstract fetchSpotPrice(): SpotPriceData
}

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