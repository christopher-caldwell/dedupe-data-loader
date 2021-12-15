import { buildSchema } from 'graphql'

import { AuthorQueries, AuthorSchema } from './author'
import { BookQueries, BookSchema } from './book'

/** Joins segments of GraphQL schemas */
export const stitchSchema = (...schemas: string[]): string => {
  return schemas.reduce((accumulator, currentValue) => accumulator + '\n' + currentValue, '')
}

const Queries = `#graphql
  type Query {
    ${stitchSchema(AuthorQueries, BookQueries)}
  }
`

const schemas = stitchSchema(AuthorSchema, BookSchema)

export const schema = buildSchema(stitchSchema(schemas, Queries))
