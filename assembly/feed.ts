import { http, json } from "@blockless/sdk"
import { Date } from 'as-wasi/assembly'
import { BaseSource, SpotPriceData } from "./sources"
import { BaseAggregation } from "./aggregation/base"

export class Feed {
  private id: string
  private symbol: string
  private name: string
  private description: string
  private currency: string
  private deviationThreshold: f32
  private heartbeat: i32

  private aggregation: BaseAggregation | null
  private sources: Array<BaseSource>

  /**
   * Create a data feed for a given symbol by including
   * data sources and aggregation methodologies
   * 
   * @param id a unique id of the data feed
   * @param symbol a short symbol for the data feed; eg. BTC 
   * @param name the name of the data feed; eg. Bitcoin
   */
  constructor(id: string, symbol: string, name: string) {
    this.id = id
    this.symbol = symbol
    this.name = name
    this.description = ''
    this.currency = 'USD'
    this.deviationThreshold = 0.5
    this.heartbeat = 10

    this.sources = new Array<BaseSource>()
    this.aggregation = null
  }

  addSource(source: BaseSource): void {
    this.sources.push(source)
  }

  setAggregation(aggregation: BaseAggregation): void {
    this.aggregation = aggregation
  }

  setDescription(description: string): void {
    this.description = description
  }

  setHeartbeat(heartbeat: i32): void {
    this.heartbeat = heartbeat
  }
  
  setDeviationThreshold(deviationThreshold: f32): void {
    this.deviationThreshold = deviationThreshold
  }

  runAggregation(): void {
    if (this.aggregation) {
      this.aggregation!.aggregate(this.sources)
    }
  }

  /**
   * Renders a JSON response for the data feed.
   * 
   * @returns http.Response
   */
  render(): http.Response {
    const body = new json.JSON.Obj

    body.set('symbol', this.symbol)
    body.set('name', this.name)
    if (this.description) body.set('description', this.description)
    body.set('currency', this.currency)

    if (this.aggregation) {
      const aggregationData = this.aggregation!.fetchData()
      
      body.set('aggregationType', this.aggregation!.getType())
      body.set('price', aggregationData.price)
      body.set('ts', aggregationData.ts)
    } else {
      let totalAnswer = 0.0

      for (let i = 0; i < this.sources.length; i++) {
        let spotPriceData: SpotPriceData
        const dataSource = this.sources[i]
        spotPriceData = dataSource.fetchSpotPrice()
        totalAnswer += spotPriceData.priceLast
      }
      
      body.set('aggregationType', 'none')
      body.set('price', totalAnswer / this.sources.length)
      body.set('ts', parseInt((Date.now() / 1000).toString()))
    }

    if (this.sources.length > 0) {
      const sources = new json.JSON.Arr

      for (let i = 0; i < this.sources.length; i++) {
        const source = this.sources[i]
        const jsonData = new json.JSON.Obj

        jsonData.set('name', source.getName())
        jsonData.set('type', source.getType())
        jsonData.set('source', source.getSource())
        
        sources.push(jsonData)
      }

      body.set('sources', sources)
    }

    return new http.Response(body.stringify())
      .header('Content-Type', 'application/json')
      .status(200)
  }
  
  /**
   * Serve data feed response and handle action flats
   * 
   */
  serve(): void {
    const request = http.HttpComponent.getRequest()

    if (request.query.has('aggregate')) {
      this.runAggregation()
      http.HttpComponent.send(this.render())
    } else {
      http.HttpComponent.send(this.render())
    }
  }
}