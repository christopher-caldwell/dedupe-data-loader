import { DataLoader } from '@/data-load'
import { Key } from 'node-cache'

export const mockFetcher = jest.fn(async (ids: Key[]): Promise<TestCacheItem[]> => {
  return ids.map((id) => ({ id }))
})

export const TestDataLoader = new DataLoader<TestCacheItem>({ fetcher: mockFetcher })

export type TestCacheItem = {
  id: Key
}

beforeEach(() => {
  TestDataLoader.clear()
})
