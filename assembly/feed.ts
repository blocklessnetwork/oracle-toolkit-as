import { Date } from 'as-wasi/assembly'
import { json, http } from '@blockless/sdk'
import { BaseSource } from "./sources"
import { BaseAggregation } from "./aggregation"
import { FeedData, FeedPublishResponse, SpotPriceData } from './types'

export class Feed {
  public symbol: string
  public unit: string
  public name: string
  public description: string
  private deviationThreshold: f32
  private heartbeat: i32

  private aggregation: BaseAggregation | null
  private sources: Array<BaseSource>

  private publishHandler: ((data: FeedData) => FeedPublishResponse) | null = null

  /**
   * Create a data feed for a given symbol by including
   * data sources and aggregation methodologies
   * 
   * @param id - a unique id of the data feed
   * @param symbol - a short symbol for the data feed; eg. BTC 
   * @param unit - the unit of the data feed; eg. Bitcoin
   */
  constructor(symbol: string, unit?: string) {
    this.symbol = symbol
    this.unit = unit || 'USD'
    this.name = ''
    this.description = ''
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

  setName(name: string): void {
    this.name = name
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

  setPublishHandler(handler: (request: FeedData) => FeedPublishResponse): void {
    this.publishHandler = handler
  }

  /**
   * Return a JSON response with feed data
   * 
   */
  getFeedData(): FeedData {
    let ts = 0
    let price = 0.0

    return {
      ts,
      price
    }
  }

  /**
   * Renders a JSON response for the data feed.
   * 
   * @returns http.Response
   */
  render(): http.Response {
    const body = new json.JSON.Obj
    
    body.set('name', this.name)
    body.set('symbol', this.symbol)
    body.set('unit', this.unit)
    if (this.description) body.set('description', this.description)

    if (this.aggregation) {
      const aggregationData = this.aggregation!.fetchData()
      
      body.set('aggregationType', this.aggregation!.getType())
      body.set('deviationThreshold', this.deviationThreshold.toString())
      body.set('heartbeat', this.heartbeat.toString())

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
      body.set('ts', parseInt((Date.now() / 1000).toString(), 10))
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
   * Render ...
   * 
   */
  doServe(): void {
    // const data = this.getFeedData()
    // const response = new http.Response(JSON.stringify<FeedData>(data))
    //   .header('Content-Type', 'application/json')
    //   .status(200)

    http.HttpComponent.send(this.render())
  }

  /**
   * Execute an aggregate response if available
   * 
   */
  doAggregate(): void {
    if (this.aggregation) {
      this.aggregation!.aggregate(this.sources)
    }
  }

  /**
   * Execute a publish response if defined
   * 
   * @returns void
   * 
   */
  doPublish(): void {
    if (this.publishHandler) {
      const feedData = this.getFeedData()
      const response = this.publishHandler(feedData)
      http.HttpComponent.send(new http.Response(response.toString()))
    }
  }
 
  /**
   * Entry point of the data feed with modes.
   * By default the.
   * 
   * 1. Aggregate
   * 2. Serve
   * 3. Report
   */
  serve(): void {
    const request = http.HttpComponent.getRequest()
    
    if (request.query.has('aggregate')) {
      this.doAggregate()
    } else if (request.query.has('publish')) {
      this.doPublish()
    } else {
      this.doServe()
    }
  }
}