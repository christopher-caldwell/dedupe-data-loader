import { DataLoader } from '@/data-load'
import { mockFetcher } from '@setup/index'

const TestDataLoader = new DataLoader({
  fetcher: mockFetcher,
})

describe('Default Caching Strategy', () => {
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
  test('Not providing a fetcher nor a caching strategy throws an error', () => {
    const setup = () => {
      new DataLoader({})
    }
    expect(setup).toThrowError()
    expect.assertions(1)
  })
})
