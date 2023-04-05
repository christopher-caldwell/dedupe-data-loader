import type { Redis } from 'ioredis'

import type { Key } from '../types'

/** Checks Redis for the all of the requested IDs, then fetches the ones that are not cached. Caches them on the way out  */
export const redisCachingStrategy = async <TData extends { id: Key }>(
  keys: Key[],
  Cache: RedisLikeCache,
  getByIds: (ids: Key[]) => Promise<TData[]>,
  logger: AdzeLikeLogger,
) => {
  const potentialItems = await Cache.mget([...keys] as string[])
  const rawItems = potentialItems.filter(Boolean) as string[]
  const cachedItems: TData[] = rawItems.map((item) => JSON.parse(item))
  logger.info(`Found ${cachedItems.length} / ${keys.length} from the cache.`)

  const missingFromCacheIds = keys.filter((key) => {
    if (typeof key !== 'string') throw new Error(`Expected all keys to be strings. Got: ${key}`)
    const isKeyCached = !!cachedItems.find(({ id: cachedItemKey }) => cachedItemKey === key)
    if (!isKeyCached) return key
  })

  if (!missingFromCacheIds.length) {
    logger.success('All keys were cached, no need to fetch')
    return cachedItems
  }

  logger.info(`Fetching ${missingFromCacheIds.length} ID(s)`)
  const freshlyGatheredData = await getByIds(missingFromCacheIds)
  const allItemsRequested = [...cachedItems, ...freshlyGatheredData]

  const cachableAllItemsRequested: string[] = allItemsRequested.reduce<string[]>(
    (total, requestedItem) => [...total, requestedItem.id as string, JSON.stringify(requestedItem)],
    [],
  )

  logger.info(`Caching ${cachableAllItemsRequested.length / 2} items`)
  await Cache.mset(cachableAllItemsRequested)

  logger.success(`Returning ${allItemsRequested.length} items`)
  return allItemsRequested
}

export interface RedisLikeCache {
  mset: Redis['mset']
  mget: Redis['mget']
}

export interface AdzeLikeLogger {
  info: (...args: unknown[]) => void
  success: (...args: unknown[]) => void
}
