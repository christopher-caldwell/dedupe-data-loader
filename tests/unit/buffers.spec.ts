import { BufferDataLoader } from '@setup/index'

const testId = Buffer.from('123')

describe('Buffers', () => {
  test('[load] Using buffers as keys is valid', async () => {
    const result = await BufferDataLoader.load(testId)
    expect(Buffer.compare(result.id as Buffer, testId)).toBe(0)
  })
  test('[mSet] Using buffers as keys is valid', () => {
    BufferDataLoader.mSet([{ id: testId }])
    const result = BufferDataLoader.mGet([testId])
    expect(result).toHaveLength(1)
  })
})
