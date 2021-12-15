import client from 'knex'

import { Author, Book, authors, books } from './seed'

export const knex = client({
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite',
  },
  useNullAsDefault: true,
})

export const setupDb = async () => {
  await knex.schema.createTable('author', (table) => {
    table.increments('id')
    table.string('name')
  })
  await knex.schema.createTable('book', (table) => {
    table.increments('id')
    table.string('title')
    table.integer('author_id')
    table.foreign('author_id').references('author.id')
  })

  for (const author of authors) {
    await knex('author').insert(author)
  }

  for (const book of books) {
    await knex('book').insert(book)
  }
}

declare module 'knex/types/tables' {
  interface BaseRecord {
    id: number
    created_at: string
    updated_at: string
  }
  interface Tables {
    author: Author & BaseRecord
    book: Book & BaseRecord
  }
}
