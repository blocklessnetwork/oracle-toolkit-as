export class PairToken {
  public index: number
  public symbol: string
  public contract: string

  constructor(index: number, symbol: string, contract: string) {
    this.index = index
    this.symbol = symbol
    this.contract = contract
  }
}

export class PairReserves {
  public reserve0: f64
  public reserve1: f64

  constructor(reserve0: f64, reserve1: f64) {
    this.reserve0 = reserve0
    this.reserve1 = reserve1
  }
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