import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Resend } from 'resend'
import db from '../db/database.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const DEFAULT_CATEGORIES = [
  { name: 'Comida',      color: '#f97316', icon: '🍽️' },
  { name: 'Transporte',  color: '#3b82f6', icon: '🚌' },
  { name: 'Servicios',   color: '#8b5cf6', icon: '💡' },
  { name: 'Salud',       color: '#10b981', icon: '💊' },
  { name: 'Ocio',        color: '#ec4899', icon: '🎮' },
  { name: 'Otros',       color: '#6b7280', icon: '📦' },
]

const router = Router()

router.post('/google', async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token requerido' })

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const { sub: googleId, email, name, picture } = ticket.getPayload()

  let result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  })
  let user = result.rows[0]

  if (user) {
    // Vincular google_id si es el primer login (usuario migrado)
    if (!user.google_id) {
      await db.execute({
        sql: 'UPDATE users SET google_id = ?, name = ?, picture = ? WHERE id = ?',
        args: [googleId, name, picture, user.id],
      })
      user = { ...user, google_id: googleId, name, picture }
    }
  } else {
    // Nuevo usuario: crear cuenta y sembrar categorías default
    const inserted = await db.execute({
      sql: 'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
      args: [googleId, email, name, picture],
    })
    const userId = Number(inserted.lastInsertRowid)

    for (const cat of DEFAULT_CATEGORIES) {
      await db.execute({
        sql: 'INSERT INTO categories (name, color, icon, user_id) VALUES (?, ?, ?, ?)',
        args: [cat.name, cat.color, cat.icon, userId],
      })
    }

    result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })
    user = result.rows[0]
  }

  const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

  res.json({
    token: jwtToken,
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture },
  })
})

router.post('/register', async (req, res) => {
  const { email, password, name, linkAccount } = req.body
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, nombre y contraseña son requeridos' })
  }

  const existing = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
  const existingUser = existing.rows[0]

  if (existingUser) {
    if (existingUser.google_id && !existingUser.password_hash) {
      if (!linkAccount) {
        return res.status(409).json({ error: 'google_account_exists' })
      }
      const password_hash = await bcrypt.hash(password, 12)
      await db.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
        args: [password_hash, existingUser.id],
      })
      const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '30d' })
      return res.json({ token, user: { id: existingUser.id, email: existingUser.email, name: existingUser.name, picture: existingUser.picture } })
    }
    return res.status(409).json({ error: 'email_already_exists' })
  }

  const password_hash = await bcrypt.hash(password, 12)
  const inserted = await db.execute({
    sql: 'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
    args: [email, name, password_hash],
  })
  const userId = Number(inserted.lastInsertRowid)

  for (const cat of DEFAULT_CATEGORIES) {
    await db.execute({
      sql: 'INSERT INTO categories (name, color, icon, user_id) VALUES (?, ?, ?, ?)',
      args: [cat.name, cat.color, cat.icon, userId],
    })
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id: userId, email, name, picture: null } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' })
  }

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
  const user = result.rows[0]

  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' })
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } })
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requerido' })

  const result = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] })
  const user = result.rows[0]

  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    await db.execute({
      sql: 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      args: [token, expires, user.id],
    })
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Recupera tu contraseña — Finanzas Personal',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña. El enlace expira en 1 hora.</p>
             <p><a href="https://finanzas-personal-sable.vercel.app/reset-password?token=${token}">Restablecer contraseña</a></p>
             <p>Si no solicitaste esto, ignora este mensaje.</p>`,
    })
  }

  res.json({ ok: true })
})

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token y contraseña son requeridos' })

  const result = await db.execute({
    sql: 'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
    args: [token],
  })
  const user = result.rows[0]

  if (!user || new Date(user.reset_token_expires) < new Date()) {
    return res.status(400).json({ error: 'El enlace es inválido o ha expirado' })
  }

  const password_hash = await bcrypt.hash(password, 12)
  await db.execute({
    sql: 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    args: [password_hash, user.id],
  })

  res.json({ ok: true })
})

export default router
