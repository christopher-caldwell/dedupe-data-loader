import Cache, { ValueSetItem, Options as CacheOptions } from 'node-cache'

export class DataLoader<TData extends { id: string | number }> {
  cachingStrategy: CachingStrategy<TData> | undefined
  fetcher: Fetcher<TData>
  DataCache: Cache
  defaultCacheTtl: number
  idsToFetch: (number | string)[] = []
  runner: NodeJS.Timeout | undefined

  constructor({ cachingStrategy, fetcher, cacheOptions }: DataLoaderArgs<TData>) {
    this.cachingStrategy = cachingStrategy
    this.fetcher = fetcher
    this.DataCache = new Cache(cacheOptions)
    this.defaultCacheTtl = cacheOptions?.stdTTL || Number(process.env.DDL_DEFAULT_CACHE_TTL || Infinity)
  }

  /** Batches calls into a queue, and invokes the fetcher once with the culmination of the necessary values */
  async load(id: string | number) {
    if (this.DataCache.has(id)) {
      return this.DataCache.get<TData>(id)!
    }
    // create a promise and push it into the class. return the promise and re-write the set timeout to resolve all the various promises with the cached data / fetcher data
    this.idsToFetch.push(id)
    if (this.runner) clearTimeout(this.runner)
    this.runner = setTimeout(() => {
      console.log('runner', this.idsToFetch)
    }, 10)
  }

  fetch(ids: string[]) {
    if (this.cachingStrategy) return this.cachingStrategy(ids)
    return this.defaultCachingStrategy(ids, this.fetcher)
  }

  formatDataIntoCache = (data: TData, ttl: number): ValueSetItem => {
    return {
      key: data.id,
      val: data,
      ttl,
    }
  }

  mSet(data: TData[], ttl: number = this.defaultCacheTtl) {
    const cachableData = data.map((item) => this.formatDataIntoCache(item, ttl))
    return this.DataCache.mset(cachableData)
  }

  mGetKeys(ids: string[]) {
    return this.DataCache.mget<TData>(ids)
  }

  mGet(ids: string[]) {
    const mgetKeyResponse = this.mGetKeys(ids)
    return Object.values(mgetKeyResponse)
  }

  clear() {
    const allKeys = this.DataCache.keys()
    return this.DataCache.del(allKeys)
  }

  delete(id: string | number) {
    return this.DataCache.del(id)
  }

  getListOfNonCachedIds = (ids: string[]): string[] => {
    const nonCachedIds = []
    const cachedIds = this.mGetKeys(ids)
    for (const id of ids) {
      if (!cachedIds[id]) nonCachedIds.push(id)
    }

    return nonCachedIds
  }

  /** Used if no other staregy provided. Will check the cache, run the fetcher, and cahe the result on the way out. */
  async defaultCachingStrategy(ids: string[], fetcher: Fetcher<TData>) {
    const cachedData = this.mGet(ids)
    const nonCachedIds = this.getListOfNonCachedIds(ids)
    const freshlyFetchedData = await fetcher(nonCachedIds)
    this.mSet(freshlyFetchedData)
    return [...cachedData, ...freshlyFetchedData]
  }
}

interface DataLoaderArgs<TData extends { id: string | number }> {
  cachingStrategy?: CachingStrategy<TData>
  fetcher: Fetcher<TData>
  cacheOptions?: CacheOptions
}

// need to work out batching in the indiviudal calls

/** The method in which cached values are retrieved. This defaults to `node-cache`, but can be substituted for Redis, or whatever other means you wish.  */
export type CachingStrategy<TData extends { id: string | number }> = (ids: string[]) => Promise<TData[]>
export type Fetcher<TData> = (ids: (string | number)[]) => Promise<TData[]>
