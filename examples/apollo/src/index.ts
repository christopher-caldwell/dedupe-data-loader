import { ApolloServer } from 'apollo-server'

import { setupDb } from './db'
import { AuthorLoader, BookLoader } from './loaders'
import { schema } from './schema'
import { resolvers } from './resolvers'

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: () => {
    return {
      AuthorLoader,
      BookLoader,
    }
  },
})

const main = async () => {
  await setupDb()
  server.listen({ port: 5001 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}

main()
