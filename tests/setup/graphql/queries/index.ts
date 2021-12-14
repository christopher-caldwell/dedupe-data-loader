export const AuthorQuery = `#graphql
query Author($id: Int!){
  author(id: $id) {
    id
    name
  }
}
`

export const AuthorsQuery = `#graphql
query Authors {
  authors {
    id
    name
  }
}
`

export const BookQuery = `#graphql
query Book($id: Int!) {
  book(id: $id) {
    id
    name
    author {
      id
      name
    }
  }
}
`

export const BooksQuery = `#graphql
query Books {
  books {
    id
    name
    author {
      id
      name
    }
  }
}
`
