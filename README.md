# De-duping Data Loader

Multi use data loader, with built in de-duped caching. This is heavily influenced by the original [data loader](https://github.com/graphql/dataloader), whith the ability to introduce your own caching middleware.

[![NPM](https://img.shields.io/npm/v/@caldwell619/data-loader.svg)](https://www.npmjs.com/package/@caldwell619/data-loader) [![NPM](https://img.shields.io/bundlephobia/min/@caldwell619/data-loader)](https://bundlephobia.com/package/@caldwell619/data-loader) [![](https://img.shields.io/github/last-commit/christopher-caldwell/dedupe-data-loader)]() [![](https://img.shields.io/npm/types/typescript)]()

If you're wonder what is a data loader, the TL;DR is that it efficiently fetches your data in batches rather than sending n number of requests. For a more detailed explanation, keep reading.

## Installation

For the copy / paste.

```shell
yarn add @cladwell619/data-loader
```

## Usgae

There is only one required argument to the constructor, and that is a way to get your data. It is one of 2 options, a [caching strategy](#caching-strategy) or a [fetcher](#fetcher).

### Fetcher

The fetcher is the core of your usage with the data loader. It's your persistence layer. This can be anything, SQL, Dynamo, Mongo, JSON DB, whatever.

You are given an array of IDs and it's up to you to get the data relevant to those IDs. If you provide a `fetcher` in this manner, the data loader will use the default caching strategy.

```ts
// Using a simple fetcher, built in caching
const AuthorLoader = new DataLoader({
  fetcher: async (ids) => {
    // do something with IDs, return the result to be cached.
  },
})
```

### Caching Strategy

This library comes with it's own caching stragety using [node-cache](https://github.com/node-cache/node-cache). Each instance of the data loader will have it's own cache.

If you have your own caching method, you can inject it into the data loader via the `cachingStrategy`. There is an example of this for [Redis](./tests/integration/redis/redisCachingStrategy.test.ts) and a [no-cache approach](./tests/integration/no-cache/noCache.test.ts) in the examples.

```ts
// Using a simple fetcher, built in caching
const AuthorLoader = new DataLoader({
  cachingStrategy: async (ids) => {
    // Your own solution, completely custom. Here you would define how your data is cached.
    // This can be Redis, or even no caching. You just need to run your fetcher and be on with it.
  },
})
```

### Manipulating the Built In Cache

There are at least 2 ways to approach using the built in caching. You can instantiate the loader each request to ensure there is no stale data, or you can do it outside of the request and manipulate the cache when necessary

<details>
<summary>
Busting the cache when an item is updated
</summary>

```ts
const AuthorLoader = new DataLoader<Author>({
  fetcher: async (ids) => { ... }
})

app.get('/books', () => {
  // Do books logic, see express example
})

app.patch('/book/:id', (req, res) => {
  const id = req.params.id
  // book gets updated
  const newBook = await updateBook()
  AuthorLoader.set(id, newBook)
})

app.delete('/book/:id', (req, res) => {
  const id = req.params.id
  // book gets deleted
  AuthorLoader.delete(id)
})
```

</details>
<br/>

This is an additional layer of overhead, and it's up to your use case whether or not you choose to cache.

### Options

| Name              | Type                                                                                                                        | Description                                                                                                                                                                               | Required? |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| `fetcher`         | <code>\<TData>(ids: (string \| number)[]) => Promise<TData[]></code>                                                        | Function to fetch your data based on the array of IDs given. The result will be cached for you.                                                                                           | :warning: |
| `cachingStrategy` | <code>\<TData>(ids: (string \| number)[]) => Promise<TData[]></code>                                                        | Function to override default caching behavior. With this, you will be responsible for caching and fetching your own data.                                                                 | :warning: |
| `cacheOptions`    | [CacheOptions](https://github.com/node-cache/node-cache/blob/1e5c75e84f91d47728655f0976ee6246a7ed8664/index.d.ts#L149-L228) | The options given to [node-cache](https://github.com/node-cache/node-cache). Only used if **not** using your own `cachingStrategy`                                                        |    :x:    |
| `delayInterval`   | `number`                                                                                                                    | The amount of time alloted between the last `load` call and the execution of the `fetcher`. Defaults to **10ms**. This means that 10ms after the last call to load, the fetcher will run. |    :x:    |

### Caveats :warning:

You **cannot** provide nothing to the constructor. If you omit both the `fetcher` and the `cachingStrategy`, an error will be thrown.

This is explicitly called out, because I am struggling with the types for this. If you provide a `fetcher`, you should not be providing a `cachingStrategy` and vice versa. They are an either / or, rather than both.

If this is ignored and both are provided, the `cachingStrategy` will take priority.

```ts
const AuthorLoader = new DataLoader({
  cachingStrategy: async (ids) => {
    ...
  },
  fetcher: ❌ <-- NO!
})
```

```ts
const AuthorLoader = new DataLoader({
  fetcher: async (ids) => {
    ...
  },
  cachingStrategy: ❌ <-- NO!
})
```

### Default Caching Strategy

If a `cachingStrategy` is not provided, the data loader will use the default one.
It's a de-duped way of caching the IDs, singularly rather than at the meta request level.

For example, if you have 5 IDs, 1,2,3,4,5 and request them, they will all be cached as individual keys, rather than the totality of the cumulative list.

This means that if you add an ID and request 1,2,3,4,5,6, your fetcher will only be given `[6]` to lighten the load on your data store. This is done to reduce the potential strain on the fetcher, as the request would have been passed 6 IDs rather than 1.

If this is not for you, you can easily roll your own with the `cachingStrategy` argument.

## Cons of Usage

For the first version, a drawback is that your items need to have IDs, in the form of `id`. Your items need to have the property `id` on them for caching.

This is annoying, and will be worked on in the future.

## Loading Data

The core functionality of a data loader is to batch many calls into one efficient one. An example of this is when there is an ID stored on an entity, and you would then have to fetch this ID, via SQL or whatever.

Without any intervention, you have an [N+1 problem](https://youtu.be/uCbFMZYQbxE). This is primarly found in GraphQL, but can be applicable in REST as well.

Say for example, you fetch a list of books, with an `authorId` on them. You can iterate through the books, fetch the author by ID and call it a day. This would leave you with as many queries as there are books, as you would need to know the author of each book.

This is where the laoder comes in. Instead of waiting for each query, you `.load()` the ID into the loader. See [this one](tests/unit/batching/batching.test.ts) for a non-GraphQL example, and this section on [usage with GraphQL](#usage-with-graphql)

<details>
  <summary>Express Example</summary>

```ts
interface Author {
  id: number
  name: string
}
interface Book {
  id: number
  name: string
  authorId: number
  author?: Author
}

const AuthorLoader = new DataLoader<Author>({
  fetcher: async (ids) => { ... },
})

app.get('/books', async (req, res) => {
  const books: Book[] = await getBooks()
  const authorPromises: Promise<Author>[] = []
  books.forEach(book => {
    // Do not await this load call.
    const authorPromise = AuthorLoader.load(book.authorId)
    /** Add the promise resolving to an author into the array of author promises.
     * This does not mean that each `load` call will result in a DB call. It just means you can resolve the promise
     * when you are ready.
     * */
    authorPromises.push(authorPromise)
  })

  const authors = await Promise.all(authorPromises)

  // You could also do this based on the index on book, as it _should_ be the same as the author
  const booksWithAuthors = books.map(book => {
    const thisBooksAuthor = authors.find((author) => author.id === book.authorId)
    return {
      ...book,
      // Keep in mind this can be undefined in this example.
      author: thisBooksAuthor
    }
  })

  res.send(booksWithAuthors)
})

```

</details>

## Using the Caching Strategy as a Standalone

The primary usecase for a data loader is with GraphQL. However the loader, and the caching strategy can be used independently of GraphQL.

For a detailed example, look at the [Express example](./examples/express/README.md).

```ts
const AuthorDataLoader = new DataLoader({
  fetcher: async (ids) => {
    // Some sort of persistence logic, a DB call, etc
    return getAuthorsByIds(ids)
  },
})

const result = await AuthorDataLoader.defaultCachingStrategy(['1', '2', '3'], AuthorDataLoader.fetcher!)

expect(result).toHaveLength(3)
```

By using this, you get all the benefits of simplified, de-duped caching. This can be useful in a REST API where you're fetching a list of items that have entities on them via an ID. Checkout an [example of this](./examples/express/src/routes/book.ts). It's not a "super clean, slick" solution, but it really helps the issue of over fetching.

In summary: If your list of 20 items has the same relationship ID 6 times, this tool does the work for you to not make 5 redundant requests, but rather 1 necessary request for the 6th ID so you can give all of them back to the entity without making uneccesary persistence calls.

## Usage with GraphQL

The main purpose of this loader is to fetch relationships during a GraphQL query.

Using the books again, if someone requests that book's author in the query, you don't want to have to run n ( # of books ) number requests to your persistence layer asking for n authors.

### Without the Loader

Without a loader, you would have to make a query for each ID. This leads to the n+1 issue previously mentioned, as you need to make as many queries as you have items.

<details>
<summary>
A query to get the books
</summary>

```graphql
# The query to get books
{
  query
  Books {
    books {
      id
      name
      author {
        id
        name
      }
    }
  }
}
```

</details>
<details>
<summary>
The books resolver without a loader
</summary>

Using pseduo syntax for the [pg](https://node-postgres.com/) library here.

```ts
// A Book resolver without a data loader

const getAuthor = async (authorId: number): Promise<Author> => {
  const { rows } = await dq.query<Author>('select * from author where id = $1', [authorId])

  return rows[0]
}

const books = () => {
  return [
    {
      id: 1,
      name: 'Goblet of Fire',
      author: () => getAuthor(1), // <-- This will run once for every book
    },
    {
      id: 1,
      name: 'Order of the Phoenix',
      author: () => getAuthor(1), // <-- This will run once for every book
    },
  ]
}
```

</details>

### Using the Loader

Introducing the loader. Now instead of running the query once per book, you write a `fetcher` that will use all of the IDs to make one query, returning all you need.

<details>
<summary>
The above example, subbing for a data loader
</summary>

```ts
// A Book resolver without a data loader

const getAuthors = async (authorIds: number[]): Promise<Author[]> => {
  const { rows } = await dq.query<Author>(`select * from author where 'id' in ( unnest($1) )`, [authorIds])
  return rows
}

/** This would normally be passed down via context. For an example, see the GraphQL- tests */
const AuthorLoader = new DataLoader({
  fetcher: getAuthors,
})

const books = () => {
  return [
    {
      id: 1,
      name: 'Goblet of Fire',
      /** This function will still run once per book, but your DB query will only run once, after all the IDs have been collected */
      author: () => AuthorLoader.load(1),
    },
    {
      id: 1,
      name: 'Order of the Phoenix',
      author: () => AuthorLoader.load(1),
    },
  ]
}
```

</details>
<br/>

Using a loader for a single item works the same way as many items.
