import { authors as allAuthors, Author } from '../data'
import { Resolver } from './shared'

export const author: Resolver<Author, { id: string }> = ({ id }, { AuthorDataLoader }) => AuthorDataLoader.load(id)

export const authors: Resolver<Author[]> = async ({}, { AuthorDataLoader }) => {
  const authorPromises: Promise<Author>[] = []
  allAuthors.forEach(({ id }) => {
    authorPromises.push(AuthorDataLoader.load(id))
  })
  return await Promise.all(authorPromises)
}
