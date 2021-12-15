import { Express } from 'express'

import { bookRoutes } from './book'
import { authorRoutes } from './author'

export const registerRoutes = (app: Express) => {
  bookRoutes(app)
  authorRoutes(app)
}
