import { Author, knex, BookData } from '../db'
import { ApolloResolver } from './shared'

export const author: ApolloResolver<Author, { id: string }> = (_, { id }, { AuthorLoader }) => AuthorLoader.load(id)

export const authors: ApolloResolver<Author[]> = async (_, {}, { AuthorLoader }) => {
  // This is optional, you may not want to cache this, ans that's fine. If you do, remember to invalidate it upon updte.
  const cachedAuthors = AuthorLoader.all()
  if (cachedAuthors.length) return cachedAuthors

  const allAuthors = await knex('author').select()
  AuthorLoader.mSet(allAuthors)
  return allAuthors
}

export const authorFieldResolver: ApolloResolver<Author, undefined, BookData> = async (parent, _, { AuthorLoader }) => {
  return AuthorLoader.load(parent.author_id)
}
