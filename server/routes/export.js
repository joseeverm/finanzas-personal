import { Router } from 'express'
import db from '../db/database.js'

const router = Router()

router.get('/', async (req, res) => {
  const categories = await db.execute('SELECT * FROM categories')
  const transactions = await db.execute('SELECT * FROM transactions ORDER BY date DESC')

  res.json({
    exportedAt: new Date().toISOString(),
    categories: categories.rows,
    transactions: transactions.rows,
  })
})

export default router
