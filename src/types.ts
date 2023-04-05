import { Key as CacheKey, Options as CacheOptions } from 'node-cache'

type AllKeys<T> = T extends unknown ? keyof T : never
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never
type _ExclusiveUnion<T, K extends PropertyKey> = T extends unknown
  ? Id<T & Partial<Record<Exclude<K, keyof T>, never>>>
  : never
type ExclusiveUnion<T> = _ExclusiveUnion<T, AllKeys<T>>

interface FetcherPart<TData extends { id: TKey }, TKey = Key> {
  /** Function used to fetch from your data persistence.
   * This function will be given a list of IDs, and be expected to return the corresponding data for those IDs
   */
  fetcher: Fetcher<TData, TKey>
  /** The options given to the node-cache. This is where you would control the cache TTL */
  cacheOptions?: CacheOptions
  /** You cannot use a caching strategy while using a fetcher function */
  cachingStrategy?: never
}

interface CachingStrategyPart<TData extends { id: TKey }, TKey = Key> {
  /** Override the built in caching. If you need to handle your own caching, this is where it's done.
   *
   * Should **not** be used in conjunction with `fetcher`
   */
  cachingStrategy: CachingStrategy<TData, TKey>
  /** You cannot use a fetcher function while using a caching strategy */
  fetcher?: never
  /** You cannot use a specify cacheOptions while using a custom caching strategy */
  cacheOptions?: never
}
// TODO: How to make types better, want to not allow both fetcher and caching, but want to require on or the other
/** If you wish to provide your own caching strategy, you will need to get the cached, fetch the uncached, and cache the result.
 * If you wish not to cache anything, simply run your `fetcher` as your `cachingStrategy`.
 */
export type DataLoaderArgs<TData extends { id: TKey }, TKey = Key> = {
  /** Time given to catch the next `load` call. The loader will wait n for another call to load data.
   * For example, if you provide `100`, the loader will wait 100ms after the last call to load before invoking your fetcher.
   * This timeout will be reset each call to `load`.
   * @default 10ms
   */
  delayInterval?: number
  bufferEncoding?: BufferEncoding
} & ExclusiveUnion<FetcherPart<TData, TKey> | CachingStrategyPart<TData, TKey>>

export type Key = string | number | Buffer

/** The method in which cached values are retrieved. This defaults to `node-cache`, but can be substituted for Redis, or whatever other means you wish.  */
export type CachingStrategy<TData extends { id: TKey }, TKey = Key> = (keys: TKey[]) => Promise<TData[]>
export type Fetcher<TData, TKey = Key> = (keys: TKey[]) => Promise<TData[]>
export interface DataFetchPromise<TData> {
  key: CacheKey
  resolve: (value: TData | PromiseLike<TData>) => void
  reject: (reason?: unknown) => void
}
