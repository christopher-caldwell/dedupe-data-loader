import RedisClient from 'ioredis'

import { CachingStrategy } from '@/data-load'
import { TestCacheItem, mockFetcher } from '../'

export const Redis = new RedisClient()

export const clear = async () => {
  const keys = await Redis.keys('*')
  if (!keys.length) return
  await Redis.del(...keys)
}

export const redisCachingStrategy: CachingStrategy<TestCacheItem> = async (keys) => {
  const rawPotentialItems = await Redis.mget(...(keys as string[]))
  const cachedItems: TestCacheItem[] = []
  for (const rawItem of rawPotentialItems) {
    if (!rawItem) continue
    try {
      cachedItems.push(JSON.parse(rawItem))
    } catch (e) {
      console.error('error parsing key', e)
    }
  }
  const missingFromCacheIds = []
  for (const key of keys) {
    const isKeyCached = !!cachedItems.find(({ key: cachedItemKey }) => cachedItemKey === key)
    if (isKeyCached) continue
    else missingFromCacheIds.push(key)
  }
  const freshlyGatheredData = await mockFetcher(missingFromCacheIds)
  const allItemsRequested = [...cachedItems, ...freshlyGatheredData]

  const cacheableAllItemsRequested: string[] = []

  for (const requestedItem of allItemsRequested) {
    cacheableAllItemsRequested.push(requestedItem.key as string)
    cacheableAllItemsRequested.push(JSON.stringify(requestedItem))
  }

  await Redis.mset(cacheableAllItemsRequested)

  return allItemsRequested
}
