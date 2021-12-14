export const AuthorSchema = `#graphql
type Author {
  id: Int!
  name: String!
}
`

export const AuthorQueries = `#graphql
author(id: ID!): Author
authors: [Author!]!
`
