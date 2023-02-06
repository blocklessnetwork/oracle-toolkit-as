import { http, json } from "@blockless/sdk"
import { BaseSource } from "./sources/base"
import { RedisStorage } from "./utils/redis"

export class FeedBuilder {
  private id: string
  private description: string
  private deviationThreshold: f32
  private heartbeat: i32

  private sources: Array<BaseSource>

  constructor(id: string) {
    this.id = id
    this.sources = new Array<BaseSource>()
  }

  setDescription(description: string): FeedBuilder {
    this.description = description
    return this
  }

  setHeartbeat(heartbeat: i32): FeedBuilder {
    this.heartbeat = heartbeat
    return this
  }
  
  setDeviationThreshold(deviationThreshold: f32): FeedBuilder {
    this.deviationThreshold = deviationThreshold
    return this
  }

  addSource(source: BaseSource): FeedBuilder {
    this.sources.push(source)
    return this
  }

  renderHeartbeat() {
    // @TODO: Run heartbeat action

    return new http.Response('success')
      .status(200)
  }

  render() {
    // Build Response
    const body = new json.JSON.Obj
    const sources = new json.JSON.Arr
    let totalAnswer = 0.0

    // for (let i = 0; i < this.sources.length; i++) {
    //   let twapData: TwapData
    //   const dataSource = this.sources[i]
    //   twapData = dataSource.fetchTwapData()
      
    //   const jsonData = new json.JSON.Obj

    //   jsonData.set('name', dataSource.description)
    //   jsonData.set('unit', twapData.unit)
    //   jsonData.set('price', twapData.priceMean)
    //   jsonData.set('ts', twapData.ts)

    //   totalAnswer += twapData.priceMean

    //   sources.push(jsonData)
    // }

    body.set('id', this.id)
    body.set('description', this.description)
    body.set('currency', 'USD')
    body.set('latestAnswer', totalAnswer / this.sources.length)
    body.set('lastResponded', parseInt((Date.now() / 1000).toString()))
    body.set('sources', sources)

    return new http.Response(body.stringify())
      .header('Content-Type', 'application/json')
      .status(200)
  }
  
  serve() {
    http.HttpComponent.serve((request: http.Request) => {
      if (request.query.has('aggregate')) {
        return this.renderHeartbeat()
      } else {
        return this.render()
      }
    })
  }
}