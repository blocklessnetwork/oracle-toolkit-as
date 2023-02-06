import { BaseSource } from "../sources/base"

export abstract class BaseAggregation {
  public source: BaseSource
  public description: string

  constructor(source: BaseSource) {
    this.source = source
  }

  abstract fetchPrice(): f32
}