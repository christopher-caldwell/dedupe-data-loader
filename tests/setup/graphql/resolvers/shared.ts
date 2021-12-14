import { DataLoader } from '@/index'

import { Author } from '../data'

export interface GraphQLContext {
  AuthorDataLoader: DataLoader<Author>
}
export type Resolver<ReturnType, Variables = Record<string, string>> = (
  variables: Variables,
  context: GraphQLContext,
) => Promise<ReturnType>
