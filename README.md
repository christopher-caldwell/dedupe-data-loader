# De-duping Data Loader

 Gets passed a list of ids, caches each individually, returns result

## Fetcher

 Fetcher mirrors data loader, gets passed a list of IDs that pretain to relationships stored in various locations.

 Runs user provided fetcher, then caches result before returning.

## Caching

Results are cached in a de-duped format. This is done with an mget to grab the various pieces of data information and only query for what is not in the cache.

### Example

You have an author with 5 books. You want the books, and you have the author ID. 
Your data fetcher would be something like _"get books where author id = 1". This will return the 5 books.

Need to think about this. It was clearer earlier.. Watch Bens video again.

The idea is that if your id list has 1,2,3,4,5, books 1,2,3,4,5 will be cached separately. So the next time you go to get these books, all the ids will be checked before running the DD query to see if they can be pulled from the cache instead of coming from the DB. 

Say you add a book, and run the same author query. This would only fetch book 6, as 1-5 are cached. Need to think it through.

<!-- You could write your own query in SQL, or do the -->

### Caching Middleware

Add the ability to provide persistencce middleware that overrides default in mem caching. 
This can be Redis, or whatever. The idea is that the user can manage their own caching if required.