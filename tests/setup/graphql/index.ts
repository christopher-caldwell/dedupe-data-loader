import { ExecutionResult, graphql } from 'graphql'
import { Key } from 'node-cache'

import { DataLoader } from '@/index'

import { schema } from './schema'
import { Author, authors } from './data'
import { resolvers } from './resolvers'

/** Mocks DB persistence layer */
export const authorFetcher = jest.fn(async (ids: Key[]): Promise<Author[]> => {
  return authors.filter(({ id: authorId }) => ids.includes(authorId))
})
export const AuthorDataLoader = new DataLoader<Author>({
  fetcher: authorFetcher,
})

export const runQuery = async <TData>(query: string, variables?: Record<string, unknown>): Promise<ExecutionResult<TData>> => {
  const result = await graphql({
    schema,
    contextValue: { AuthorDataLoader },
    rootValue: resolvers,
    source: query,
    variableValues: variables,
  })
  return result as unknown as ExecutionResult<TData>
}

export * from './queries'
