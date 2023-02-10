import { SpotPriceData } from "./types"

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