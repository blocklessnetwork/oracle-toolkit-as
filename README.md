# Oracle Toolkit built for Blockless Network

The Oracle Toolkit is a collection of tools, sources, and aggregators to create DIY oracle feeds using WebAssembly with the Blockless Network.

## Usage

The Oracle Toolkit is designed to be highly customizable and can be used to meet the specific needs of your project.

To get started, add this module to your Blockless assembly script function.

```
@blockless/oracle-toolkit
```

After which you may use the `FeedBuilder` to create your own data feed.

```ts
import "wasi"
import { FeedBuilder, Sources, RedisStorage } from "@blockless/oracle-toolkit"
import { memory } from "@blockless/sdk"

const oracleFeed = new FeedBuilder('CUSD', 'Coin98 Dollar')
  .setDescription('CUSD price feed for Efficiency DAO, powered by Blockless')
  .setDeviationThreshold(0.5)
  .setHeartbeat(10)

// Add Sources
oracleFeed.addSource(
  new Sources.BaryonExchangeBSC(
    '0x889ae28947e6b1fba8d1bddf9b6e02d8636c5dcd',
    new Sources.PairToken(0, 'BUSD', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'),
    new Sources.PairToken(1, 'CUSD', '0xFa4BA88Cf97e282c505BEa095297786c16070129')
  )
)
oracleFeed.addSource(
  new Sources.BaryonExchangeBSC(
    '0xa49df16b1b085356081c37b02028e47979d395f9',
    new Sources.PairToken(0, 'COIN98', '0xaec945e04baf28b135fa7c640f624f8d90f1c3a6'),
    new Sources.PairToken(1, 'CUSD', '0xFa4BA88Cf97e282c505BEa095297786c16070129')
  )
)

// Set data aggreagation and provide data storage
oracleFeed.setAggregation(
  'twap',
  new RedisStorage(
    memory.EnvVars.get('STORAGE_ENDPOINT'),
    memory.EnvVars.get('STORAGE_ACCESS_TOKEN')
  )
)

// Serve
oracleFeed.serve()
```

## Playground

Visit the Blockless Playground to [https://play.bls.dev/oracle](https://play.bls.dev/oracle)