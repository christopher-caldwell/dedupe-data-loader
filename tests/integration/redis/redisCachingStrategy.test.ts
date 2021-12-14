import { DataLoader } from '@/data-load'
import { redisCachingStrategy, clear, mockFetcher } from '@setup/index'

beforeEach(async () => {
  await clear()
})

const TestDataLoader = new DataLoader({
  cachingStrategy: redisCachingStrategy,
})

describe('Redis Caching Strategy', () => {
  test('Requesting 5 separate IDs results in one invocation of the fetcher', async () => {
    const result = await Promise.all([
      TestDataLoader.load('1'),
      TestDataLoader.load('2'),
      TestDataLoader.load('3'),
      TestDataLoader.load('4'),
      TestDataLoader.load('5'),
    ])

    expect(result[0].key).toBe('1')
    expect(mockFetcher).toHaveBeenCalledTimes(1)
    expect.assertions(2)
  })
})
