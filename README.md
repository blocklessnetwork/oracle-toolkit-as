# Price Oracle for CUSD built with Blockless

## Development

**Install dependencies**

`npm install`

**Prepare Environment Variables**

Copy `.env.example` to `.env`

See mandatory environment variables.


**Build and Execute**

Install the bls CLI and execute `run.sh`.

You may also run the following command:

```
bls function invoke \
  --env STORAGE_ENDPOINT={{ENTER_YOUR_UPSTASH_ENDPOINT}} \
  --env STORAGE_ACCESS_TOKEN={{ENTER_YOUR_UPSTASH_ACCESS_TOKEN}} \
  --env RPC_NODE_ACCESS_TOKEN={{ENTER_RPC_NODE_ACCESS_TOKEN}}
```

## Configuration

Use bls.toml to modify blockless function configuration.

**Permissions**

To access an external resource through the Http Client, include the resource base url under [deployment.permissions].

**Mandatory Environment Variables:**

| KEY                   | DESCRIPTION                           |
|-----------------------|---------------------------------------|
| STORAGE_ENDPOINT      | Upstash's redis HTTP access endpoint  |
| STORAGE_ACCESS_TOKEN  | Upstash's redis HTTP access token     |
| RPC_NODE_ACCESS_TOKEN | Access token for your chosen RPC node |


## Deploy

Login to your bls console and execute the following command.

```
bls function deploy
```

## Smart Contracts

All smart contracts associated with this function are located under /contracts.

**Deployed Contracts**

| TYPE                  | Address                                     |
|-----------------------|---------------------------------------------|
| CUSD Oracle           | 0x3B294b99DeDC3Fc8Ef490459434000B32B687547  |
