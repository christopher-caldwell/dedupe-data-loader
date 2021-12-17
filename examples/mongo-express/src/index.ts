import express from 'express'
import cors from 'cors'

import { registerRoutes } from './routes'

const app = express()
app.use(cors())

registerRoutes(app)

app.listen(5001, () => {
  console.log(`🚀 Skynet is active`)
})
