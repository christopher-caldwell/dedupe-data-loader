export const BookSchema = `#graphql
type Book {
  id: Int!
  name: String!
  author: Author!
}
`

export const BookQueries = `#graphql
book(id: Int!): Book!
books: [Book!]!
`
