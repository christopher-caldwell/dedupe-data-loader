import { BookSchema, knex } from '../db'
import { Resolver } from './shared'

export const book: Resolver<BookSchema, { id: string }> = async ({ id }, { AuthorLoader, BookLoader }) => {
  const targetBook = await BookLoader.load(id)
  if (targetBook) {
    return {
      ...targetBook,
      author: () => AuthorLoader.load(targetBook.author_id),
    }
  }
  throw new Error('Not found')
}

export const books: Resolver<BookSchema[]> = async ({}, { AuthorLoader }) => {
  // Optionally, you could cache
  const allBooks = await knex('book').select()
  const books: BookSchema[] = allBooks.map((bookOption) => ({
    ...bookOption,
    author: () => AuthorLoader.load(bookOption.author_id),
  }))
  return books
}
