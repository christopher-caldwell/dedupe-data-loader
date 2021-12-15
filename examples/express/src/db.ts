import { DataLoader } from '@caldwell619/data-loader'

import { authors, books } from '../../db/seed'
export * from '../../db/seed'

export const AuthorLoader = new DataLoader({
  fetcher: async (ids) => {
    console.log('[Author Fetcher]: # of IDs', ids.length)
    // Normally this would be a call to Mongo/Dynamo/Elastic. TODO: Make a local Mongo setup. 
    return authors.filter(({ id: authorId }) => ids.includes(authorId))
  },
})

export const BookLoader = new DataLoader({
  fetcher: async (ids) => {
    console.log('[Book Fetcher]: # of IDs', ids.length)
    // Normally this would be a call to Mongo/Dynamo/Elastic. TODO: Make a local Mongo setup. 
    return books.filter(({ id: bookId }) => ids.includes(bookId))
  },
})
