# Apollo Data Loader Example

An example of using the data loader in a GraphQL API powered by Apollo. Apollo is likely the most popular GraphQL severver client, and the data loader works well with it.

## Shoutout

Thank you Ben Awad for your video 2 years before writing this lol.

- Ben's data loader [example repo](https://github.com/benawad/graphql-n-plus-one-example)

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

## Fetcher

In this example we are using knex to query SQLite and get what we care about

```ts
export const authorFetcher = async (ids: Key[]): Promise<Author[]> => {
  const authors = await knex('author').select().whereIn('id', ids)
  return authors
}

export const AuthorLoader = new DataLoader<Author>({
  fetcher: authorFetcher,
})
```

## Field Resolver

In Apollo specifically, your field resolvers can be declared in a specific way. With vanilla GraphQL, your object returned from the resolver must include your field resolver. For an example of this, see the [vanilla GraphQL example](../graphql/README.md#field-resolver).

Apollo field resolvers can be declared on your resolver object.

```ts
const resolvers = {
  Book: {
    author: () => {
      console.log('I will run when the query requests the author field')
    },
  },
  Query: {
    book: () => {
      console.log('I will run when the query requests a book, regardless of it also requests an author')
    },
  },
}
```

## Data Loader in Apollo

This is a bit easier than vanilla, albeit at a significantly higher bundle cost. If that's no big deal, you're running a static server that doesn't care about bundle size, great. If you're in a serverless environment where bundle size matters a lot, consider your specific use case. Anyway..

Using the loader in Apollo is easy:

```ts
const resolvers = {
  Book: {
    author: (parent: Book, variables: undefined, context: { AuthorLoader: DataLoader<Author> }) => {
      return context.AuthorLoader.load(parent.authorId)
    },
  },
  Query: {
    book: (
      parent: undefined,
      variables: { id: number },
      context: { BookLoader: DataLoader<Book>; AuthorLoader: DataLoader<Author> },
    ) => {
      // Optional, you can just get it yourself without using the loader
      const book = await context.BookLoader.load(variables.id)
      // You don't have to do anything else here for the author.
      // Apollo will intercept this, and run the `Book.author` field resolver above.
      return book
    },
  },
}
```

## Caching

Caching is largely up to you.

### Providing a Fetcher

If you provide a fetcher, the data loader will cache for you. There is no intervention needed, unless the data changes on your persistence. Then you will need to manipulate the cache. For instructions, see [this section on cache manipulation](../../README.md#manipulating-the-built-n-cache).

#### Define the Loader Outside the Request

This will persist caching as long as your server is running. You are able to pass a `stdTTL` via the `cacheOptions` to the constructor, or you can set the env variable `DDL_DEFAULT_CACHE_TTL` to be the global TTL.

Nearly every example does this.

#### Define the Loader Every Request

If you do not want caching across requests, you can define the loader in each call.

```ts
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: () => {
    return {
      AuthorLoader: new DataLoader<Author>({ fetcher }),
      BookLoader: new DataLoader<Book>({ fetcher }),
    }
  },
})
```

With Apollo, nothing else needs to change. Your loader will be created on every request, ensuring that no caching is done after the request is over.

This does mean that subsequent queries will run your fetcher for every request.

### Caching Strategy

If you provide a caching strategy, everything is up to you. For an easy way to not cache anything, simply provide your fetcher as the caching strategy. This will elimate in built caching completely.

There are other caching strageties you can use, such as a [Redis box](../../tests/integration/redis/redisCachingStrategy.test.ts). The tool is designed to be flexible to fit your tech stack needs, while also providing a default if you don't need it.
