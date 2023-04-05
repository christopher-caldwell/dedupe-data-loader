import Cache, { ValueSetItem } from 'node-cache'

import { Key, CachingStrategy, Fetcher, DataFetchPromise, DataLoaderArgs } from './types'

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

  handleKeyIn(key: Key) {
    const isBuffer = Buffer.isBuffer(key)
    return isBuffer ? key.toString() : key
  }
  handleKeyOut(key: Key, shouldBeBuffer: boolean) {
    return shouldBeBuffer ? Buffer.from(key as string) : key
  }

  /** Batches calls into a queue, and invokes the fetcher once with the culmination of the necessary values. */
  async load(incomingKey: Key) {
    const isBuffer = Buffer.isBuffer(incomingKey)
    const key = this.handleKeyIn(incomingKey)
    const potentialItem = this.DataCache.get<TData>(key)
    if (potentialItem) return potentialItem

    const dataFetchPromise = new Promise<TData>((resolve, reject) => {
      this.dataFetchPromises.push({ key, resolve, reject })
    })

    this.keysToFetch.push(key)
    if (this.runner) clearTimeout(this.runner)
    this.runner = setTimeout(async () => {
      // TODO consider uniqueness here - test out multiple keys
      const items = await this.fetch([...new Set(this.keysToFetch)])
      this.dataFetchPromises.forEach(({ key, resolve, reject }) => {
        const itemToResolve = items.find(({ id: keyItem }) => keyItem === key)
        if (itemToResolve) resolve({ ...itemToResolve, id: this.handleKeyOut(itemToResolve.id, isBuffer) } as TData)
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
    const key = this.handleKeyIn(data.id)
    return {
      key,
      val: data,
      ttl,
    }
  }

  //<------ BEGIN OWN CACHE METHODS - NOT USED IF USING OWN CACHING STRATEGY ----> //

  mSet(data: TData[], ttl: number = this.defaultCacheTtl) {
    const dataToBeCached = data.map((item) => this.formatDataIntoCache(item, ttl))
    return this.DataCache.mset(dataToBeCached)
  }

  set(incomingKey: Key, data: TData, ttl: number = this.defaultCacheTtl) {
    const key = this.handleKeyIn(incomingKey)
    return this.DataCache.set(key, data, ttl)
  }

  mGetKeys(incomingKeys: Key[]) {
    const keys = incomingKeys.map((key) => this.handleKeyIn(key))
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
  delete(incomingKey: Key) {
    const key = this.handleKeyIn(incomingKey)
    return this.DataCache.del(key)
  }

  /** Returns a list of keys that are not in the cache, out of the list provided. */
  getListOfNonCachedKeys = (keys: Key[]): Key[] => {
    const nonCachedKeys = []
    const cachedKeys = this.mGetKeys(keys)
    for (const incomingKey of keys) {
      const key = this.handleKeyIn(incomingKey)
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

export * from './types'
