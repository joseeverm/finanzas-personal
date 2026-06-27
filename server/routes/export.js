import { Router } from 'express'
import db from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const categories = await db.execute({
    sql: 'SELECT * FROM categories WHERE user_id = ?',
    args: [req.userId],
  })
  const transactions = await db.execute({
    sql: 'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
    args: [req.userId],
  })

  res.json({
    exportedAt: new Date().toISOString(),
    categories: categories.rows,
    transactions: transactions.rows,
  })
})

export default router
