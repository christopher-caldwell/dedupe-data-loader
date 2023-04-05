import { LRU_TTL } from './cache'
import { CachingStrategy, Fetcher, DataFetchPromise, DataLoaderArgs } from './types'

export class DataLoader<TData extends { id: TKey }, TKey = TData['id']> {
  cachingStrategy: CachingStrategy<TData, TKey> | undefined
  fetcher: Fetcher<TData, TKey> | undefined
  DataCache: LRU_TTL<TKey, TData>
  defaultCacheTtl: number
  keysToFetch: TKey[] = []
  runner: NodeJS.Timeout | undefined
  dataFetchPromises: DataFetchPromise<TData, TKey>[] = []
  delayInterval: number = 10
  keyConverter: (key: Buffer | number) => string

  constructor({ cachingStrategy, fetcher, cacheOptions, delayInterval, keyConverter }: DataLoaderArgs<TData, TKey>) {
    if (!fetcher && !cachingStrategy)
      throw new Error('You must provide either a fetcher or a cachingStrategy if you want a custom solution.')
    this.cachingStrategy = cachingStrategy
    this.fetcher = fetcher
    this.keyConverter = keyConverter || defaultKeyConverter
    this.DataCache = new LRU_TTL(cacheOptions)
    this.defaultCacheTtl = Number(cacheOptions?.ttl) || Number(process.env.DDL_DEFAULT_CACHE_TTL || Infinity)
    if (delayInterval) this.delayInterval = delayInterval
  }

  /** Handles the equality check on Buffer keys */
  checkIfKeyEqual(key: TKey, keyToCompare: TKey) {
    const shouldCompareBuffer = Buffer.isBuffer(keyToCompare) && typeof key === 'string'
    return shouldCompareBuffer ? Buffer.compare(Buffer.from(key), keyToCompare) === 0 : key === keyToCompare
  }

  /** Batches calls into a queue, and invokes the fetcher once with the culmination of the necessary values. */
  async load(key: TKey) {
    const potentialItem = this.DataCache.get(key)
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
        const itemToResolve = items.find(({ id }) => this.checkIfKeyEqual(key, id))
        if (itemToResolve) resolve(itemToResolve)
        else reject(`Item ${key} was not found`)
      })
    }, 10)

    return dataFetchPromise
  }

  /** Invokes the provided fetcher */
  fetch(keys: TKey[]) {
    if (this.cachingStrategy) return this.cachingStrategy(keys)
    return this.defaultCachingStrategy(keys)
  }

  //<------ BEGIN OWN CACHE METHODS - NOT USED IF USING OWN CACHING STRATEGY ----> //

  mSet(data: TData[], ttl = this.defaultCacheTtl) {
    data.forEach((item) => {
      this.DataCache.set(item.id, item, ttl)
    })
  }

  set(key: TKey, data: TData, ttl = this.defaultCacheTtl) {
    return this.DataCache.set(key, data, ttl)
  }

  peekKeys(keys: TKey[]) {
    const successfulKeys = new Map<TKey, true>()
    for (const key of keys) {
      const isThere = this.DataCache.peek(key)
      if (isThere) successfulKeys.set(key, true)
    }
    return successfulKeys
  }

  mGet(keys: TKey[]) {
    const results: TData[] = []
    for (const key of keys) {
      const hit = this.DataCache.get(key) as TData
      if (hit) results.push(hit)
    }
    return results
  }

  /** Deletes all the keys in this cache  */
  clear() {
    return this.DataCache.clearAll()
  }

  /** Removes a key from the built in cache. Will have no effect if using your own `cachingStrategy` */
  delete(key: TKey) {
    return this.DataCache.delete(key)
  }

  /** Returns a list of keys that are not in the cache, out of the list provided. */
  getListOfNonCachedKeys = (keys: TKey[]): TKey[] => {
    const nonCachedKeys: TKey[] = []
    const cachedKeys = this.peekKeys(keys)
    for (const key of keys) {
      // TODO: need to do a check on Buffer here to hand to the fetcher.
      if (!cachedKeys.get(key)) nonCachedKeys.push(key)
    }

    return nonCachedKeys
  }

  /** Used if no other strategy provided. Will check the cache, run the fetcher, and cache the result on the way out. */
  async defaultCachingStrategy(keys: TKey[], fetcher?: Fetcher<TData, TKey>) {
    fetcher = fetcher || this.fetcher
    if (!fetcher) throw new Error('[defaultCachingStrategy]: No fetcher defined')
    const cachedData = this.mGet(keys)
    const nonCachedKeys = this.getListOfNonCachedKeys(keys)
    const freshlyFetchedData = await fetcher(nonCachedKeys)
    this.mSet(freshlyFetchedData)
    return [...cachedData, ...freshlyFetchedData]
  }
}

const defaultKeyConverter = (key: Buffer | number) => {
  return key.toString()
}

export * from './types'
