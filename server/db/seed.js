import db from './database.js'

const categories = [
  { name: 'Comida',       color: '#f97316', icon: '🍽️' },
  { name: 'Transporte',   color: '#3b82f6', icon: '🚌' },
  { name: 'Servicios',    color: '#8b5cf6', icon: '💡' },
  { name: 'Salud',        color: '#10b981', icon: '💊' },
  { name: 'Ocio',         color: '#ec4899', icon: '🎮' },
  { name: 'Otros',        color: '#6b7280', icon: '📦' },
]

for (const cat of categories) {
  await db.execute({
    sql: 'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
    args: [cat.name, cat.color, cat.icon]
  })
}

console.log('✅ Categorías insertadas')