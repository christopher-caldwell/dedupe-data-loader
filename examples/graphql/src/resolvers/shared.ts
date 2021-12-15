import { DataLoader } from '@caldwell619/data-loader'

import { Author, BookData } from '../db'

export interface GraphQLContext {
  AuthorLoader: DataLoader<Author>
  BookLoader: DataLoader<BookData>
}
export type Resolver<ReturnType, Variables = Record<string, string>> = (
  variables: Variables,
  context: GraphQLContext,
) => Promise<ReturnType>
