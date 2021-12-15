import { Key } from 'node-cache'

export interface BookData {
  id: Key
  title: string
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
    title: "Sorccer's Stone",
    authorId: 1,
  },
  {
    id: 2,
    title: "Chamber of Secret's",
    authorId: 1,
  },
  {
    id: 3,
    title: 'Prisoner of Azkaban',
    authorId: 1,
  },
  {
    id: 4,
    title: 'Goblet of Fire',
    authorId: 1,
  },
  {
    id: 5,
    title: 'Order of the Phoenix',
    authorId: 1,
  },
  {
    id: 6,
    title: 'Half Blood Prince',
    authorId: 1,
  },
  {
    id: 7,
    title: 'Deathly Hallows',
    authorId: 1,
  },
  {
    id: 8,
    title: 'Fellowship of the Ring',
    authorId: 2,
  },
  {
    id: 9,
    title: 'Two Towers',
    authorId: 2,
  },
  {
    id: 10,
    title: 'Return of the King',
    authorId: 2,
  },
  {
    id: 11,
    title: 'Thrawn',
    authorId: 3,
  },
]
