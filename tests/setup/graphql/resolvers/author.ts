import { authors as allAuthors, Author } from '../data'
import { Resolver } from './shared'

export const author: Resolver<Author, { id: string }> = ({ id }, { AuthorLoader }) => AuthorLoader.load(id)

export const authors: Resolver<Author[]> = async ({}, { AuthorLoader }) => {
  const authorPromises: Promise<Author>[] = []
  allAuthors.forEach(({ id }) => {
    authorPromises.push(AuthorLoader.load(id))
  })
  return await Promise.all(authorPromises)
}
