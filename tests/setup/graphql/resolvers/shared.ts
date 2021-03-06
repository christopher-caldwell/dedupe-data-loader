import { DataLoader } from '@/index'

import { Author, BookData } from '../data'

export interface GraphQLContext {
  AuthorLoader: DataLoader<Author>
  BookLoader: DataLoader<BookData>
}
export type Resolver<ReturnType, Variables = Record<string, string>> = (
  variables: Variables,
  context: GraphQLContext,
) => Promise<ReturnType>
