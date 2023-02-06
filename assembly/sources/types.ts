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
