import { DataLoader } from '@/data-load'
import { Key } from 'node-cache'

export const mockFetcher = jest.fn(async (ids: Key[]): Promise<TestCacheItem[]> => {
  return ids.map((key) => ({ key }))
})

export const TestDataLoader = new DataLoader<TestCacheItem>({ fetcher: mockFetcher })

beforeEach(() => {
  TestDataLoader.clear()
})

export type TestCacheItem = {
  key: Key
}
