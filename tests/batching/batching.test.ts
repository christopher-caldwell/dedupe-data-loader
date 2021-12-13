import { TestDataLoader, mockFetcher } from '../setup'

describe('Batching', () => {
  test('Requesting 5 separate IDs results in one invocation of the fetcher', async () => {
    await TestDataLoader.batch('1')
    await TestDataLoader.batch('2')
    await TestDataLoader.batch('3')
    await TestDataLoader.batch('4')
    await TestDataLoader.batch('5')
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })
})