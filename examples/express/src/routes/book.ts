import { Express } from 'express'
/** Here, books is simulating a NoSQL type of data store. This could be Elastic Search, Mongo, Dynamo, etc.
 * The reason this is not SQL is because you could very easily construct an SQL query that does what the loader does
 * `select * from book join author on book.author_id = auhtor.id`
 * From here, you could build the author object with code, or you could even use something like Postgres' `json_build_object`
 */
import { AuthorLoader, BookLoader, books } from '../db'


export const bookRoutes = (app: Express): void => {
  app.get('/books', async (_, res) => {

    // Optionally, you could cache the books here:
    // BookLoader.mSet(books)

    const authorPromises = books.map(({ authorId }) => AuthorLoader.load(authorId))
    const authors = await Promise.all(authorPromises)

    const booksWithAuthors = books.map((book) => ({
      ...book,
      author: authors.find(({ id: authorId }) => authorId === book.authorId),
    }))

    res.send(booksWithAuthors)
  })

  app.get<{ id: string }>('/books/:id', async (req, res) => {
    const id = parseInt(req.params.id || '0')
    const book = await BookLoader.load(id)
    if (!book) return res.sendStatus(404)
    const author = await AuthorLoader.load(book.authorId)
    res.send({ ...book, author })
  })
}
