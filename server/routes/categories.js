import { Router } from 'express'
import db from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT * FROM categories WHERE user_id = ?',
    args: [req.userId],
  })
  res.json(result.rows)
})

router.post('/', async (req, res) => {
  const { name, color, icon } = req.body
  const result = await db.execute({
    sql: 'INSERT INTO categories (name, color, icon, user_id) VALUES (?, ?, ?, ?)',
    args: [name, color, icon, req.userId],
  })
  res.json({ id: Number(result.lastInsertRowid) })
})

export default router
