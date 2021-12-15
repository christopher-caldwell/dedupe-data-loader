import { knex, BookData } from '../db'
import { ApolloResolver } from './shared'

export const book: ApolloResolver<BookData, { id: string }> = async (_, { id }, { BookLoader }) => {
  const targetBook = await BookLoader.load(id)
  if (targetBook) return targetBook

  throw new Error('Not found')
}

export const books: ApolloResolver<BookData[]> = async (_, {}, { AuthorLoader }) => {
  // Optionally, you could cache
  const allBooks = await knex('book').select()
  return allBooks
}
