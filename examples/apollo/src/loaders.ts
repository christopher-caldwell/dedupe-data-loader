import type { Key } from 'node-cache'
import { DataLoader } from '@caldwell619/data-loader'

import { BookData, Author, knex } from './db'

export const authorFetcher = async (ids: Key[]): Promise<Author[]> => {
  console.log('[Author Fetcher]: # of IDs', ids.length)
  const authors = await knex('author').select().whereIn('id', ids)
  return authors
}
export const AuthorLoader = new DataLoader<Author>({
  fetcher: authorFetcher,
})

export const bookFetcher = async (ids: Key[]): Promise<BookData[]> => {
  console.log('[Book Fetcher]: # of IDs', ids.length)
  const books = await knex('book').select().whereIn('id', ids)
  return books
}
export const BookLoader = new DataLoader<BookData>({
  fetcher: bookFetcher,
})
