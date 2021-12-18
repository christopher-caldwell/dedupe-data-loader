export interface BookData {
  id: number
  title: string
  author_id: number
}

export interface Book extends BookData {
  author: Author
}

export interface BookSchema extends BookData {
  author: Author | (() => Promise<Author>)
}
export interface Author {
  id: number
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
    title: "Sorcerer's Stone",
    author_id: 1,
  },
  {
    id: 2,
    title: "Chamber of Secret's",
    author_id: 1,
  },
  {
    id: 3,
    title: 'Prisoner of Azkaban',
    author_id: 1,
  },
  {
    id: 4,
    title: 'Goblet of Fire',
    author_id: 1,
  },
  {
    id: 5,
    title: 'Order of the Phoenix',
    author_id: 1,
  },
  {
    id: 6,
    title: 'Half Blood Prince',
    author_id: 1,
  },
  {
    id: 7,
    title: 'Deathly Hallows',
    author_id: 1,
  },
  {
    id: 8,
    title: 'Fellowship of the Ring',
    author_id: 2,
  },
  {
    id: 9,
    title: 'Two Towers',
    author_id: 2,
  },
  {
    id: 10,
    title: 'Return of the King',
    author_id: 2,
  },
  {
    id: 11,
    title: 'Thrawn',
    author_id: 3,
  },
]
