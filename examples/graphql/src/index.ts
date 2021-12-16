import express from 'express'
import cors from 'cors'

import { runQuery } from './runQuery'
import { setupDb } from './db'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/graphql', async (req, res) => {
  const { query, variables, operationName } = req.body
  // Express is not great at handling async errors.
  // This WILL crash the app, even with a try/cacth if there are SQL errors.
  try {
    const result = await runQuery(query, variables, operationName)
    res.send(result)
  } catch (e) {
    console.error('Error', e)
    res.status(500).send(e)
  }
})

const main = async () => {
  await setupDb()
  app.listen(5001, () => {
    console.log(`🚀 Skynet is active`)
  })
}

main()
