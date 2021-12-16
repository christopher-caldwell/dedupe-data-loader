# Vanilla GraphQL Data Loader Example

An example of using the data loader in a vanilla GraphQL API powered by Express. This is **not* using any express-graphql middleware. I't just an express server, with a single route at `/graphql`. 

I run GraphQL in serverless environments a lot, so this is the style I use there ( without Express ). You invoke the `graphql` runner explicity which you can see in [runQuery](./src/runQuery.ts)

## Data Store

The app uses Knex to reach an SQL Lite db stored in a file. This simulates a hosted DB somewhere, that you are making queries to.

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


## Field Resolver

The power of GraphQL is harnessed in a field resolver. Instead of your object needing to be the actual data, you can provide a function that will run and replace itself with the result

### Resolver

The result to the client will be the result of `getAuthor`, as GraphQL will run the provided function before returning the result.

```ts
// id here is the variable given to the resolver by the client
const book = async ({ id }) => {
  const book = await getBook(id)
  return {
    ...book,
    author: () => getAuthor(book.authorId)
  }
}
```

### Result

The result to the client will be the result of `getAuthor`, as GraphQL will run the provided function before returning the result.

```json
{
  "id": 1,
  "title": "The Illiad",
  "author": {
    "id": 1,
    "name": "Homer"
  }
}
```

## The Problem

This is great, but what if you have 100 books? This means `getAuthor` will be ran 100 times. If you aren't preparing something to handle this, that means 100 queries to you DB. 

## The Solution

In comes the data loader. Instead of making your calls directly to the DB, you ask the loader to load the id. After it has been loaded, it will aggreagte all these IDs into an array of unique IDs, then pass them to your fetcher.

```ts
// 2nd argument is the context given at the root load
const book = async ({ id }, { AuthorLoader }) => {
  const book = await getBook(id)
  return {
    ...book,
    author: () => AuthorLoader.load(book.authorId)
  }
}
```

This will group everything, and resolve it the wy you want.