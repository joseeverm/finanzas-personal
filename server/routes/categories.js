import { Router } from 'express'
import db from '../db/database.js'

const router = Router()

router.get('/', async (req, res) => {
  const result = await db.execute('SELECT * FROM categories')
  res.json(result.rows)
})

router.post('/', async (req, res) => {
  const { name, color, icon } = req.body
  const result = await db.execute({
    sql: 'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
    args: [name, color, icon]
  })
  res.json({ id: Number(result.lastInsertRowid) })
})

export default router