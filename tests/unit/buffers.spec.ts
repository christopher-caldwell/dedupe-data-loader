import { TestDataLoader } from '@setup/index'

const testId = Buffer.from('123')

describe('Buffers', () => {
  test('[load] Using buffers as keys is valid', async () => {
    const result = await TestDataLoader.load(testId)
    expect(Buffer.compare(result.id as Buffer, testId)).toBe(0)
  })
  test('[mSet] Using buffers as keys is valid', () => {
    TestDataLoader.mSet([{ id: testId }])
    const result = TestDataLoader.mGet([testId])
    expect(result).toHaveLength(1)
  })
})
