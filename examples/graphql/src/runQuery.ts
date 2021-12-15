import { ExecutionResult, graphql } from 'graphql'
import { Key } from 'node-cache'

import { DataLoader } from '@caldwell619/data-loader'

import { schema } from './schema'
import { BookData, Author, knex } from './db'
import { resolvers } from './resolvers'

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

export const runQuery = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string,
): Promise<ExecutionResult<TData>> => {
  const result = await graphql({
    schema,
    contextValue: { AuthorLoader, BookLoader },
    rootValue: resolvers,
    source: query,
    variableValues: variables,
    operationName,
  })
  return result as unknown as ExecutionResult<TData>
}

export * from './queries'
