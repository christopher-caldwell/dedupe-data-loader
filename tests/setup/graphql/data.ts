import { Key } from 'node-cache'

export interface BookData {
  id: Key
  name: string
  authorId: Key
}
export interface BookSchema extends BookData {
  author: Author | (() => Promise<Author>)
}
export interface Book extends BookData {
  author: Author
}
export interface Author {
  id: Key
  name: string
}

export const authors: Author[] = [
  {
    id: 1,
    name: 'J.K. Rowling',
  },
  {
    id: 2,
    name: 'J.R.R Tolkien',
  },
  {
    id: 3,
    name: 'Timothy Zahn',
  },
]

export const books: BookData[] = [
  {
    id: 1,
    name: "Sorccer's Stone",
    authorId: 1,
  },
  {
    id: 2,
    name: "Chamber of Secret's",
    authorId: 1,
  },
  {
    id: 3,
    name: 'Prisoner of Azkaban',
    authorId: 1,
  },
  {
    id: 4,
    name: 'Goblet of Fire',
    authorId: 1,
  },
  {
    id: 5,
    name: 'Order of the Phoenix',
    authorId: 1,
  },
  {
    id: 6,
    name: 'Half Blood Prince',
    authorId: 1,
  },
  {
    id: 7,
    name: 'Deathly Hallows',
    authorId: 1,
  },
  {
    id: 8,
    name: 'Fellowship of the Ring',
    authorId: 2,
  },
  {
    id: 9,
    name: 'Two Towers',
    authorId: 2,
  },
  {
    id: 10,
    name: 'Return of the King',
    authorId: 2,
  },
  {
    id: 11,
    name: 'Thrawn',
    authorId: 3,
  },
]
