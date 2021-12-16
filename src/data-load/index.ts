import Cache, { Key, ValueSetItem, Options as CacheOptions } from 'node-cache'

export class DataLoader<TData extends { id: Key }> {
  cachingStrategy: CachingStrategy<TData> | undefined
  fetcher: Fetcher<TData> | undefined
  DataCache: Cache
  defaultCacheTtl: number
  keysToFetch: Key[] = []
  runner: NodeJS.Timeout | undefined
  dataFetchPromises: DataFetchPromise<TData>[] = []
  delayInterval: number = 10

  constructor({ cachingStrategy, fetcher, cacheOptions, delayInterval }: DataLoaderArgs<TData>) {
    if (!fetcher && !cachingStrategy)
      throw new Error('You must provide either a fetcher or a cachingStrategy if you want a custom solution.')
    this.cachingStrategy = cachingStrategy
    this.fetcher = fetcher
    this.DataCache = new Cache(cacheOptions)
    this.defaultCacheTtl = cacheOptions?.stdTTL || Number(process.env.DDL_DEFAULT_CACHE_TTL || Infinity)
    if (delayInterval) this.delayInterval = delayInterval
  }

  /** Batches calls into a queue, and invokes the fetcher once with the culmination of the necessary values */
  async load(key: Key) {
    if (this.DataCache.has(key)) {
      return this.DataCache.get<TData>(key)!
    }

    const dataFetchPromise = new Promise<TData>((resolve, reject) => {
      this.dataFetchPromises.push({ key: key, resolve, reject })
    })

    this.keysToFetch.push(key)
    if (this.runner) clearTimeout(this.runner)
    this.runner = setTimeout(async () => {
      // TODO consider uniqueness here - test out multiple keys
      const items = await this.fetch([...new Set(this.keysToFetch)])
      this.dataFetchPromises.forEach(({ key, resolve, reject }) => {
        const itemToResolve = items.find(({ id: keyItem }) => keyItem === key)
        if (itemToResolve) resolve(itemToResolve)
        else reject(`Item ${key} was not found`)
      })
    }, 10)

    return dataFetchPromise
  }

  fetch(keys: Key[]) {
    if (this.cachingStrategy) return this.cachingStrategy(keys)
    if (this.fetcher) return this.defaultCachingStrategy(keys, this.fetcher)
    throw new Error('Both the caching strategy and the fetcher are falsy')
  }

  formatDataIntoCache = (data: TData, ttl: number): ValueSetItem => {
    return {
      key: data.id,
      val: data,
      ttl,
    }
  }

  // BEGIN OWN CACHE METHODS - NOT USED IF USING OWN CACHING STRATEGY

  mSet(data: TData[], ttl: number = this.defaultCacheTtl) {
    const cachableData = data.map((item) => this.formatDataIntoCache(item, ttl))
    return this.DataCache.mset(cachableData)
  }

  set(key: Key, data: TData, ttl: number = this.defaultCacheTtl) {
    return this.DataCache.set(key, data, ttl)
  }

  mGetKeys(keys: Key[]) {
    return this.DataCache.mget<TData>(keys)
  }

  mGet(keys: Key[]) {
    const mgetKeyResponse = this.mGetKeys(keys)
    return Object.values(mgetKeyResponse)
  }

  all() {
    const allKeys = this.DataCache.keys()
    return this.mGet(allKeys)
  }

  clear() {
    const allKeys = this.DataCache.keys()
    return this.DataCache.del(allKeys)
  }

  delete(key: Key) {
    return this.DataCache.del(key)
  }

  getListOfNonCachedKeys = (keys: Key[]): Key[] => {
    const nonCachedKeys = []
    const cachedKeys = this.mGetKeys(keys)
    for (const key of keys) {
      if (!cachedKeys[key]) nonCachedKeys.push(key)
    }

    return nonCachedKeys
  }

  // TODO: consider not requiring a fetcher for this, and using the class one instead..

  /** Used if no other staregy provkeyed. Will check the cache, run the fetcher, and cahe the result on the way out. */
  async defaultCachingStrategy(keys: Key[], fetcher: Fetcher<TData>) {
    const cachedData = this.mGet(keys)
    const nonCachedKeys = this.getListOfNonCachedKeys(keys)
    const freshlyFetchedData = await fetcher(nonCachedKeys)
    this.mSet(freshlyFetchedData)
    return [...cachedData, ...freshlyFetchedData]
  }
}

// TODO: How to make types better, want to not allow both fetcher and caching, but want to require on or the other
/** If you wish to provide your own caching strategy, you will need to get the cached, fetch the uncached, and cache the result.
 * If you wish not to cahce anything, simply run your `fetcher` as your `cachingStrategy`.
 */
type DataLoaderArgs<TData extends { id: Key }> = {
  cacheOptions?: CacheOptions
  cachingStrategy?: CachingStrategy<TData>
  fetcher?: Fetcher<TData>
  /** Time given to catch the next `load` call. The loader will wait n for another call to load data.
   * For example, if you provide `100`, the loader will wait 100ms after the last call to load before invoking your fetcher.
   * This timeout will be reset each call to `load`.
   * @default 10ms
   */
  delayInterval?: number
}

/** The method in which cached values are retrieved. This defaults to `node-cache`, but can be substituted for Redis, or whatever other means you wish.  */
export type CachingStrategy<TData extends { id: Key }> = (keys: Key[]) => Promise<TData[]>
export type Fetcher<TData> = (keys: Key[]) => Promise<TData[]>
export interface DataFetchPromise<TData> {
  key: Key
  resolve: (value: TData | PromiseLike<TData>) => void
  reject: (reason?: unknown) => void
}
