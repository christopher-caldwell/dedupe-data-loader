import { books as allBooks, BookSchema } from '../data'
import { Resolver } from './shared'

export const book: Resolver<BookSchema, { id: string }> = async ({ id }, { AuthorDataLoader }) => {
  const targetBook = allBooks.find(({ id: bookId }) => {
    // console.log('book id', bookId)
    return bookId === id
  })
  if (targetBook) {
    return {
      ...targetBook,
      author: () => AuthorDataLoader.load(targetBook.authorId),
    }
  }
  throw new Error('Not found')
}

export const books: Resolver<BookSchema[]> = async ({}, { AuthorDataLoader }) => {
  const books: BookSchema[] = allBooks.map((bookOption) => ({
    ...bookOption,
    author: () => AuthorDataLoader.load(bookOption.authorId),
  }))
  return books
}
