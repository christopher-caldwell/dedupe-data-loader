import { Key, DataLoader } from '@/index'

export const mockFetcher = jest.fn(async (ids: Key[]): Promise<TestCacheItem[]> => {
  return ids.map((id) => ({ id }))
})

export const bufferMockFetcher = jest.fn(async (ids: Buffer[]): Promise<BufferTestCacheItem[]> => {
  return ids.map((id) => ({ id }))
})

export const TestDataLoader = new DataLoader<TestCacheItem>({
  fetcher: mockFetcher,
})

export const BufferDataLoader = new DataLoader<BufferTestCacheItem, Buffer>({
  fetcher: jest.fn(async (ids) => {
    return ids.map((id) => ({ id }))
  }),
})

export type TestCacheItem = {
  id: Key
}
export type BufferTestCacheItem = {
  id: Buffer
}

beforeEach(() => {
  TestDataLoader.clear()
})
