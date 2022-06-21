import { ExecutionResult, graphql } from 'graphql'
import { Key } from 'node-cache'

import { DataLoader } from '@/index'

import { schema } from './schema'
import { Author, authors, BookData, books } from './data'
import { resolvers } from './resolvers'

/** Mocks DB persistence layer */
export const authorFetcher = jest.fn(async (ids: Key[]): Promise<Author[]> => {
  return authors.filter(({ id: authorId }) => ids.includes(authorId))
})
export const AuthorLoader = new DataLoader<Author>({
  fetcher: authorFetcher,
})

export const bookFetcher = jest.fn(async (ids: Key[]): Promise<BookData[]> => {
  return books.filter(({ id: bookId }) => ids.includes(bookId))
})
export const BookLoader = new DataLoader<BookData>({
  fetcher: bookFetcher,
})

export const runQuery = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<ExecutionResult<TData>> => {
  const result = await graphql({
    schema,
    contextValue: { AuthorLoader, BookLoader },
    rootValue: resolvers,
    source: query,
    variableValues: variables,
  })
  return result as unknown as ExecutionResult<TData>
}

export * from './queries'
export * from './data'
