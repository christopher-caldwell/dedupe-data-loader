import Cache, { Key, ValueSetItem } from 'node-cache'

import { CachingStrategy, Fetcher, DataFetchPromise, DataLoaderArgs } from './types'

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

  /** Batches calls into a queue, and invokes the fetcher once with the culmination of the necessary values. */
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

  /** Invokes the provided fetcher */
  fetch(keys: Key[]) {
    if (this.cachingStrategy) return this.cachingStrategy(keys)
    return this.defaultCachingStrategy(keys)
  }

  /** Takes an ID enabled object and returns the data in a version that can be cached */
  formatDataIntoCache = (data: TData, ttl: number): ValueSetItem => {
    return {
      key: data.id,
      val: data,
      ttl,
    }
  }

  //<------ BEGIN OWN CACHE METHODS - NOT USED IF USING OWN CACHING STRATEGY ----> //

  mSet(data: TData[], ttl: number = this.defaultCacheTtl) {
    const dataToBeCached = data.map((item) => this.formatDataIntoCache(item, ttl))
    return this.DataCache.mset(dataToBeCached)
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

  /** Returns all the cached data in this cache */
  all() {
    const allKeys = this.DataCache.keys()
    return this.mGet(allKeys)
  }

  /** Deletes all the keys in this cache  */
  clear() {
    const allKeys = this.DataCache.keys()
    return this.DataCache.del(allKeys)
  }

  /** Removes a key from the built in cache. Will have no effect if using your own `cachingStrategy` */
  delete(key: Key) {
    return this.DataCache.del(key)
  }

  /** Returns a list of keys that are not in the cache, out of the list provided. */
  getListOfNonCachedKeys = (keys: Key[]): Key[] => {
    const nonCachedKeys = []
    const cachedKeys = this.mGetKeys(keys)
    for (const key of keys) {
      if (!cachedKeys[key]) nonCachedKeys.push(key)
    }

    return nonCachedKeys
  }

  /** Used if no other strategy provided. Will check the cache, run the fetcher, and cache the result on the way out. */
  async defaultCachingStrategy(keys: Key[], fetcher?: Fetcher<TData>) {
    fetcher = fetcher || this.fetcher
    if (!fetcher) throw new Error('[defaultCachingStrategy]: No fetcher defined')
    const cachedData = this.mGet(keys)
    const nonCachedKeys = this.getListOfNonCachedKeys(keys)
    const freshlyFetchedData = await fetcher(nonCachedKeys)
    this.mSet(freshlyFetchedData)
    return [...cachedData, ...freshlyFetchedData]
  }
}
