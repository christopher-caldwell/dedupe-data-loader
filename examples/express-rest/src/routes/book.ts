import { Express } from 'express'

import { knex } from '../db'

export const bookRoutes = (app: Express): void => {
  app.get('/books', async (_, res) => {
    try {
      const books = await knex('book')
      res.send(books)
    } catch(e) {
      res.status(500).send(e)
    }
  })

  app.get<{ id: number }>('/book', async (req, res) => {
    try {
      const id = req.params.id
      const book = await knex('book').where('id', id).first()
      res.send(book)
    } catch(e) {
      res.status(500).send(e)
    }
  })
}
