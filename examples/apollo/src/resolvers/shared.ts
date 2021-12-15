import { DataLoader } from '@caldwell619/data-loader'

import { Author, BookData } from '../db'

export interface GraphQLContext {
  AuthorLoader: DataLoader<Author>
  BookLoader: DataLoader<BookData>
}
export type ApolloResolver<ReturnType, Variables = Record<string, string>, TParent = undefined> = (
  parent: TParent,
  variables: Variables,
  context: GraphQLContext,
) => Promise<ReturnType>
