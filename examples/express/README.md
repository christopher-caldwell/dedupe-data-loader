# Express Rest API Data Loader Example

An example of using the data loader in a traditional REST API powered by Express.

## Benefit

To be blunt, there is a good amount of overhead with this. The benefit here is caching. With the extra step of using the loader, you get built in de-duped caching. If you're already caching, there is little benefit for you to use this with a traditional REST API. This is roughly the same amount of work as just doing these things manually.

## Data Store

The data store here is any sort of Mongo / Elastic / Dynamo NoSQL type of data. There are many times where this data is not "grouped" in the way you need.

Consider the following:

```json
{
  "id": 1,
  "name": "Jim",
  "classId": 1
}
```

If you want to get the class, you have to query for it. This data usually comes back in an array, and you have to somehow do some whacky logic to get the IDs of the classes, and then fetch them all.

Data loader can help with that.

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

## Routes

`http://localhost:5001` is the base url. From here, there are 2 entities you can request, `/books` and `/authors`. You can also get a single entity by appending the ID after. `/authors/1`.

## Fetcher

If you call `/books`, you'll see a console log for the loader running. You'll also notice that this does not log again on subsequent requests, as your fetcher is not being called. The data is coming from the cache.

Try out different combinations of requests and see what logs.

```shell
curl http://localhost:5001/authors/1
curl http://localhost:5001/authors/2
curl http://localhost:5001/authors
```

In the logs, you should see:

```text
[Author Fetcher]: # of IDs 1
[Author Fetcher]: # of IDs 1
[Author Fetcher]: # of IDs 1
```

1 and 2 are standard, but you see only one ID when asking for all 3. This is essence, what this library does.
