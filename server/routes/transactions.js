import { Router } from 'express'
import db from '../db/database.js'

const router = Router()

router.get('/summary', async (req, res) => {
  const { month } = req.query
  const filter = month ? `AND strftime('%Y-%m', date) = '${month}'` : ''

  const totals = await db.execute(`
    SELECT type, SUM(amount) as total
    FROM transactions
    WHERE 1=1 ${filter}
    GROUP BY type
  `)

  const byCategory = await db.execute(`
    SELECT c.name, c.color, c.icon, SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' ${filter}
    GROUP BY t.category_id
    ORDER BY total DESC
  `)

  res.json({ totals: totals.rows, byCategory: byCategory.rows })
})

router.get('/', async (req, res) => {
  const { month, category_id } = req.query
  let sql = 'SELECT * FROM transactions WHERE 1=1'
  const args = []

  if (month) {
    sql += " AND strftime('%Y-%m', date) = ?"
    args.push(month)
  }
  if (category_id) {
    sql += ' AND category_id = ?'
    args.push(category_id)
  }

  sql += ' ORDER BY date DESC'
  const result = await db.execute({ sql, args })
  res.json(result.rows)
})

router.post('/', async (req, res) => {
  const { type, amount, date, note } = req.body
  const category_id = req.body.category_id || null
  const result = await db.execute({
    sql: 'INSERT INTO transactions (type, amount, category_id, date, note) VALUES (?, ?, ?, ?, ?)',
    args: [type, amount, category_id, date, note]
  })
  res.json({ id: Number(result.lastInsertRowid) })
})

router.put('/:id', async (req, res) => {
  const { type, amount, date, note } = req.body
  const category_id = req.body.category_id || null
  await db.execute({
    sql: 'UPDATE transactions SET type=?, amount=?, category_id=?, date=?, note=? WHERE id=?',
    args: [type, amount, category_id, date, note, req.params.id]
  })
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  await db.execute({
    sql: 'DELETE FROM transactions WHERE id=?',
    args: [req.params.id]
  })
  res.json({ ok: true })
})

export default router