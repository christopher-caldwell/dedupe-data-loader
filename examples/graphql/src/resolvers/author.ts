import { Author, knex } from '../db'
import { Resolver } from './shared'

export const author: Resolver<Author, { id: string }> = ({ id }, { AuthorLoader }) => AuthorLoader.load(id)

export const authors: Resolver<Author[]> = async ({}, { AuthorLoader }) => {
  // This is optional, you may not want to cache this, ans that's fine. If you do, remember to invalidate it upon updte.
  const cachedAuthors = AuthorLoader.all()
  if (cachedAuthors.length) return cachedAuthors

  const allAuthors = await knex('author').select()
  AuthorLoader.mSet(allAuthors)
  return allAuthors
}
