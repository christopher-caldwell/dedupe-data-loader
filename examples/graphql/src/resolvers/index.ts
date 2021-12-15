import * as bookResolvers from './book'
import * as authorResolvers from './author'

export * from './shared'
export const resolvers = {
  ...bookResolvers,
  ...authorResolvers,
}
