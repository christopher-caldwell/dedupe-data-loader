import * as bookResolvers from './book'
import { author, authors, authorFieldResolver } from './author'

export * from './shared'

export const resolvers = {
  Book: {
    author: authorFieldResolver
  },
  Query: {
    ...bookResolvers,
    authors, 
    author,
  }
};