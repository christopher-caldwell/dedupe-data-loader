export const BookSchema = `#graphql
type Book {
  id: Int!
  title: String!
  author: Author!
}
`

export const BookQueries = `#graphql
book(id: Int!): Book!
books: [Book!]!
`
