import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import categoriesRouter from './routes/categories.js'
import transactionsRouter from './routes/transactions.js'
import exportRouter from './routes/export.js'
import authRouter from './routes/auth.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/export', exportRouter)

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`)
})