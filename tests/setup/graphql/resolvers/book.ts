import { books as allBooks, BookSchema } from '../data'
import { Resolver } from './shared'

export const book: Resolver<BookSchema, { id: string }> = async ({ id }, { AuthorLoader, BookLoader }) => {
  const targetBook = await BookLoader.load(id)
  if (targetBook) {
    return {
      ...targetBook,
      author: () => AuthorLoader.load(targetBook.authorId),
    }
  }
  throw new Error('Not found')
}

export const books: Resolver<BookSchema[]> = async ({}, { AuthorLoader }) => {
  const books: BookSchema[] = allBooks.map((bookOption) => ({
    ...bookOption,
    author: () => AuthorLoader.load(bookOption.authorId),
  }))
  return books
}
