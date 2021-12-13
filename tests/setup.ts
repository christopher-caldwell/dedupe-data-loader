import { DataLoader } from '@/data-load'

export const mockFetcher = jest.fn(async (ids: (string | number)[]): Promise<TestCacheItem[]> => {
  return ids.map((id) => ({ id }))
})

export const TestDataLoader = new DataLoader<TestCacheItem>({ fetcher: mockFetcher })

beforeEach(() => {
  TestDataLoader.clear()
})

type TestCacheItem = {
  id: string | number
}
