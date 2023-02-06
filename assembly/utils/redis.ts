import { http } from "@blockless/sdk"

export class RedisStorage {
  private storageClient: http.Client

  /**
   * Initialize an instance of Redis Storage
   * 
   */
  constructor(endpoint: string, secret: string) {
    const storageClientHeaders = new Map<string, string>()
    storageClientHeaders.set('Authorization', `Bearer ${secret}`)

    const storageClientOptions = new http.ClientOptions(
      endpoint,
      storageClientHeaders
    )

    this.storageClient = new http.Client(storageClientOptions)
  }

  get(key: string): string {
    let value = ''

    if (this.storageClient) {
      const response = this.storageClient.get('/get/' + key)

      if (response.has('result') && !response.get('result')!.isNull) {
        value = response.getString('result')!.toString()
      }
    }

    return value
  }

  set(key: string, value: string): void {
    if (this.storageClient) {
      this.storageClient.get('/set/' + key + '/' + value)
    }
  }
}