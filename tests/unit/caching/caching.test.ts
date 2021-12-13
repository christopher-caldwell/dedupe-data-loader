import { TestDataLoader, mockFetcher } from '../../setup'

describe('Caching', () => {
  test('Retreiving keys returns the appropriate array', () => {
    TestDataLoader.mSet([{ key: '1' }])
    const result = TestDataLoader.mGet(['1'])
    expect(result).toHaveLength(1)
  })
  test('Retreiving keys of un-cached IDs returns the cached IDs', () => {
    TestDataLoader.mSet([{ key: '1' }])
    const result = TestDataLoader.mGet(['1', '2', '3'])
    expect(result).toHaveLength(1)
  })
  test('Asking for a list of non cached IDs returns the non-cached IDs', () => {
    TestDataLoader.mSet([{ key: '1' }])
    const result = TestDataLoader.getListOfNonCachedKeys(['1', '2', '3'])
    expect(result).toHaveLength(2)
    expect(result.includes('1')).toBeFalsy()
    expect(result.includes('2')).toBeTruthy()
    expect(result.includes('3')).toBeTruthy()
  })

  test('Default Caching Strategy', async () => {
    const result = await TestDataLoader.defaultCachingStrategy(['1', '2', '3'], async (ids) => {
      expect(ids).toHaveLength(3)
      return mockFetcher(ids)
    })
    expect(result).toHaveLength(3)
    const secondResult = await TestDataLoader.defaultCachingStrategy(['1', '2', '3', '4'], async (ids) => {
      expect(ids).toHaveLength(1)
      return mockFetcher(ids)
    })
    expect(secondResult).toHaveLength(4)
    expect.assertions(4)
  })
})
