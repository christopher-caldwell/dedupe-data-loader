import { runQuery, BookQuery, BooksQuery, authorFetcher, AuthorDataLoader, Book } from '@setup/graphql'

type BookQueryResponse = {
  book: Book
}
type BooksQueryResponse = {
  books: Book[]
}

beforeEach(() => {
  AuthorDataLoader.clear()
})

describe('Vanilla GraphQL', () => {
  test('Running a single entity query runs the fetcher once, then does a cache grab on the second request', async () => {
    expect.assertions(4)
    const { data: firstCall } = await runQuery<BookQueryResponse>(BookQuery, { id: 1 })
    expect(authorFetcher).toBeCalledTimes(1)
    expect(firstCall?.book?.author?.id).toBe(1)

    const { data: lastCall } = await runQuery<BookQueryResponse>(BookQuery, { id: 1 })
    expect(authorFetcher).toBeCalledTimes(1)
    expect(lastCall?.book?.author?.id).toBe(1)
  })

  test('Running a multiple item query runs the fetcher once, then does a cache grab on the second request', async () => {
    expect.assertions(6)
    const { data: firstCall } = await runQuery<BooksQueryResponse>(BooksQuery)
    expect(authorFetcher).toBeCalledTimes(1)
    expect(firstCall?.books[0]?.author?.id).toBe(1)
    expect(firstCall?.books[2]?.author?.id).toBe(1)

    const { data: lastCall } = await runQuery<BooksQueryResponse>(BooksQuery)
    expect(authorFetcher).toBeCalledTimes(1)
    expect(lastCall?.books[0]?.author?.id).toBe(1)
    expect(lastCall?.books[2]?.author?.id).toBe(1)
  })

  test('De-duped caching', async () => {
    expect.assertions(1)
    await runQuery<BooksQueryResponse>(BooksQuery)
    await runQuery<BookQueryResponse>(BookQuery, { id: 1 })
    expect(authorFetcher).toBeCalledTimes(1)
  })
})
