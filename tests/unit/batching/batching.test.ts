import { TestDataLoader, mockFetcher } from '@setup/index'

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

  test('Adding IDs from a list, and injecting the result back into the list', () => {
    
  })
})
