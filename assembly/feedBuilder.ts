import { BaseSource } from "./sources/base"
import { Feed } from "./feed"
import { MedianAggregation } from "./aggregation/median"
import { RedisStorage } from "./utils/redis"
import { TWAPAggregation } from "./aggregation/twap"

export class FeedBuilder {
  private id: string
  private feed: Feed

  constructor(symbol: string, name: string) {
    this.id = `${symbol}`
    this.feed = new Feed(this.id, symbol, name)
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

  setAggregation(type: string, storageClient: RedisStorage): FeedBuilder {
    if (type === 'median') {
      this.feed.setAggregation(new MedianAggregation(this.id, storageClient))
    } else if (type === 'twap') {
      this.feed.setAggregation(new TWAPAggregation(this.id, storageClient))
    }
    return this
  }

  addSource(source: BaseSource): FeedBuilder {
    this.feed.addSource(source)
    return this
  }

  serve(): void {
    this.feed.serve()
  }
}