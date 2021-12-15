import { Express } from 'express'

import { knex } from '../db'

export const authorRoutes = (app: Express): void => {
  app.get('/authors', async (_, res) => {
    try {
      const authors = await knex('author')
      res.send(authors)
    } catch(e) {
      res.status(500).send(e)
    }
  })

  app.get<{ id: number }>('/author', async (req, res) => {
    try {
      const id = req.params.id
      const author = await knex('author').where('id', id).first()
      res.send(author)
    } catch(e) {
      res.status(500).send(e)
    }
  })
}
