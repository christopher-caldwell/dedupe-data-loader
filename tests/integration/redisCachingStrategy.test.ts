import { DataLoader } from '@/index'
import { redisCachingStrategy } from '@/caching-strategies/redis'
import { clear, mockFetcher, Redis, TestCacheItem } from '@setup/index'

beforeEach(async () => {
  await clear()
})

const TestDataLoader = new DataLoader<TestCacheItem>({
  cachingStrategy(keys) {
    return redisCachingStrategy(keys, Redis, mockFetcher)
  },
})

describe('Redis Caching Strategy', () => {
  afterAll(async () => {
    await Redis.quit()
  })
  test('Requesting 5 separate IDs results in one invocation of the fetcher', async () => {
    const result = await Promise.all([
      TestDataLoader.load('1'),
      TestDataLoader.load('2'),
      TestDataLoader.load('3'),
      TestDataLoader.load('4'),
      TestDataLoader.load('5'),
    ])

    expect(result[0].id).toBe('1')
    expect(mockFetcher).toHaveBeenCalledTimes(1)
    expect.assertions(2)
  })
})
