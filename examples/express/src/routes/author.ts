import { Express } from 'express'

import { authors, AuthorLoader } from '../db'

export const authorRoutes = (app: Express): void => {
  app.get('/authors', async (_, res) => {
    try {
      // TODO: make Mongo setup to show fetch for NoSQL style data
      const authorPromises = authors.map(({ id }) => AuthorLoader.load(id))
      const resolvedAuthors = await Promise.all(authorPromises)
      res.send(resolvedAuthors)
    } catch (e) {
      res.status(500).send(e)
    }
  })

  app.get<{ id: string }>('/authors/:id', async (req, res) => {
    try {
      const id = req.params.id
      const author = await AuthorLoader.load(parseInt(id))
      res.send(author)
    } catch (e) {
      res.status(500).send(e)
    }
  })
}
