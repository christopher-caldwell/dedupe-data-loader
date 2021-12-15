import express from 'express'
import cors from 'cors'
import { serializeError } from 'serialize-error'

import { registerRoutes } from './routes'
import { setupDb } from './db'

const app = express()
app.use(cors())

registerRoutes(app)

const main = async () => {
  try {
    await setupDb()
  } catch (e) {
    console.error('error setting up DB', serializeError(e))
    process.exit(1)
  }
  app.listen(5001, () => {
    console.log(`🚀 Skynet is active`)
  })
}

main()
