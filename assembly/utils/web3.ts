import { u128 } from "as-bignum/assembly"
import { http, json } from "@blockless/sdk"

/**
 * Web3 APIs wrapper for Moralis
 * 
 */
export class Web3 {
  private httpClient: http.Client
  private chain: string

  /**
   * Initialize an instance of Redis Storage
   * 
   */
  constructor(endpoint: string, secret: string, chain?: string) {
    const httpClientHeaders = new Map<string, string>()
    httpClientHeaders.set('Accept', 'application/json')
    httpClientHeaders.set('X-API-Key', secret)

    const httpClientOptions = new http.ClientOptions(
      endpoint,
      httpClientHeaders
    )

    this.chain = chain || 'ethereum'
    this.httpClient = new http.Client(httpClientOptions)
  }

  getBlock(): i32 {
    let value = 0

    if (this.httpClient) {
      const response = this.httpClient.get(`/dateToBlock?chain=${this.chain}`)
      
      console.log('response: ' + response.toString())
    }

    return value
  }

  getLastTransaction(address: string): json.JSON.Obj {
    let value = new json.JSON.Obj

    if (this.httpClient) {
      const response = this.httpClient.get(`/${address}?chain=${this.chain}&limit=1`)
      const results = response.getArr('result')!._arr
      
      if (results.length > 0) {
        value = results[0] as json.JSON.Obj
      }
    }

    return value
  }

  getPairReserves(pair: string): PairReserves {
    let reserve0 = 0.0
    let reserve1 = 0.0

    if (this.httpClient) {
      const response = this.httpClient.get(`/${pair}/reserves?chain=${this.chain}`)

      const r0 = u128.fromString(response.getString('reserve0')!.toString()).toF64()
      const r1 = u128.fromString(response.getString('reserve1')!.toString()).toF64()

      reserve0 = (r0 / 1e18)
      reserve1 = (r1 / 1e18)
    }

    return new PairReserves(reserve0, reserve1)
  }
}

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
