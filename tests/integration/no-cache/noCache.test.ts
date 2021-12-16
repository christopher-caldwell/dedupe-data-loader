import { Key } from 'node-cache'

import { DataLoader } from '@/index'
import { TestCacheItem } from '@setup/index'

describe('No Cache - Caching Strategy', () => {
  test('Providing own caching strategy without caching results in no cache', async () => {
    const noCacheCachingStrategy = jest.fn(async (ids: Key[]) => {
      expect(ids).toHaveLength(5)
      // No caching being done in own custom `cachingStrategy`
      // means there will be no caching by the loader either
      return ids.map((id) => ({ id }))
    })
    const NoCacheDataLoader = new DataLoader<TestCacheItem>({
      cachingStrategy: noCacheCachingStrategy,
    })

    const firstResult = await Promise.all([
      NoCacheDataLoader.load('1'),
      NoCacheDataLoader.load('2'),
      NoCacheDataLoader.load('3'),
      NoCacheDataLoader.load('4'),
      NoCacheDataLoader.load('5'),
    ])

    const secondResult = await Promise.all([
      NoCacheDataLoader.load('1'),
      NoCacheDataLoader.load('2'),
      NoCacheDataLoader.load('3'),
      NoCacheDataLoader.load('4'),
      NoCacheDataLoader.load('5'),
    ])

    expect(firstResult[0].id).toBe('1')
    expect(secondResult[0].id).toBe('1')
    expect(noCacheCachingStrategy).toHaveBeenCalledTimes(2)
    expect.assertions(5)
  })
})
