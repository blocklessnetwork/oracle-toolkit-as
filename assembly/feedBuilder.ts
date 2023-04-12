import { Feed } from "./feed"
import { BaseSource } from "./sources/base"
import { MedianAggregation } from "./aggregation/median"
import { RedisStorage } from "./utils/redis"
import { TWAPAggregation } from "./aggregation/twap"
import { FeedData, FeedPublishResponse } from "./types"

export class FeedBuilder {
  private feed: Feed

  /**
   * A helper class to build the data feed
   *  
   * @param symbol a short symbol for the data feed; eg. BTC 
   * @param unit the unit of the data feed; eg. Bitcoin
   */
  constructor(symbol: string, unit: string) {
    this.feed = new Feed(symbol, unit)
  }

  setName(name: string): FeedBuilder {
    this.feed.setName(name)
    return this
  }

  setDescription(description: string): FeedBuilder {
    this.feed.setDescription(description)
    return this
  }

  setHeartbeat(heartbeat: i32): FeedBuilder {
    this.feed.setHeartbeat(heartbeat)
    return this
  }
  
  setDeviationThreshold(deviationThreshold: f32): FeedBuilder {
    this.feed.setDeviationThreshold(deviationThreshold)
    return this
  }

  setAggregation(type: string, storageClient: RedisStorage | null = null): FeedBuilder {
    const id = `${this.feed.symbol}-${this.feed.unit}`

    if (storageClient && type === 'median') {
      this.feed.setAggregation(new MedianAggregation(id, storageClient))
    } else if (storageClient && type === 'twap') {
      this.feed.setAggregation(new TWAPAggregation(id, storageClient))
    }

    return this
  }

  addSource(source: BaseSource): FeedBuilder {
    this.feed.addSource(source)
    return this
  }

  onPublish(handler: (request: FeedData) => FeedPublishResponse): FeedBuilder {
    this.feed.setPublishHandler(handler)
    return this
  }

  start(): void {
    this.feed.serve()
  }
}