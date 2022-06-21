import RedisClient from 'ioredis'

export const Redis = new RedisClient()

afterAll(() => {
  Redis.disconnect()
})

export const clear = async () => {
  const keys = await Redis.keys('*')
  if (!keys.length) return
  await Redis.del(...keys)
}
