# Vanilla GraphQL Data Loader Example

An example of using the data loader in a vanilla GraphQL API powered by Express. This is **not* using any express-graphql middleware. I't just an express server, with a single route at `/graphql`. 

I run GraphQL in serverless environments a lot, so this is the style I use there ( without Express ). You invoke the `graphql` runner explicity which you can see in [runQuery](./src/runQuery.ts)

## Data Store

// SQL

## Running the server

Install the dependencies with `yarn`.

```shell
#  Starting the server
yarn start
```

```shell
#  Starting the server in dev mode ( re-runs on code change )
yarn dev
```