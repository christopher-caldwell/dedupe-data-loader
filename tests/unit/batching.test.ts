import { Key, DataLoader } from '@/index'
import { TestDataLoader, mockFetcher, TestCacheItem } from '@setup/index'

describe('Batching', () => {
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

  test('Duplicate IDs given to loader', async () => {
    const result = await Promise.all([
      TestDataLoader.load('1'),
      TestDataLoader.load('1'),
      TestDataLoader.load('1'),
      TestDataLoader.load('4'),
    ])

    expect(mockFetcher).toHaveBeenCalledTimes(1)
    expect(result[0]?.id).toBe('1')
    expect(result[1]?.id).toBe('1')
    expect(result[2]?.id).toBe('1')
    expect(result[3]?.id).toBe('4')

    expect.assertions(5)
  })

  test('Duplicate IDs given to loader only pass the unique IDs to the fetcher', async () => {
    const duplicateMockFetcher = jest.fn(async (ids: Key[]): Promise<TestCacheItem[]> => {
      expect(ids).toHaveLength(2)
      return ids.map((id) => ({ id }))
    })
    const DuplicateDataLoader = new DataLoader({
      fetcher: duplicateMockFetcher,
    })

    const result = await Promise.all([
      DuplicateDataLoader.load('1'),
      DuplicateDataLoader.load('1'),
      DuplicateDataLoader.load('1'),
      DuplicateDataLoader.load('4'),
    ])

    expect(duplicateMockFetcher).toHaveBeenCalledTimes(1)
    expect(result[0]?.id).toBe('1')
    expect(result[1]?.id).toBe('1')
    expect(result[2]?.id).toBe('1')
    expect(result[3]?.id).toBe('4')

    expect.assertions(6)
  })

  test('Adding IDs from a list, and injecting the result back into the list', () => {})
})
