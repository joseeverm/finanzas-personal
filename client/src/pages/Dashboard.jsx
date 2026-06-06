import { useState, useEffect } from 'react'
import { getSummary } from '../api'

const currentMonth = new Date().toISOString().slice(0, 7)
const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function Dashboard() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getSummary({ month: currentMonth }).then(setSummary)
  }, [])

  if (!summary) return <p className="text-zinc-500 text-center py-12">Cargando...</p>

  const income = summary.totals.find(t => t.type === 'income')?.total ?? 0
  const expense = summary.totals.find(t => t.type === 'expense')?.total ?? 0
  const balance = income - expense

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      <h1 className="text-white font-bold text-xl">Dashboard</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos', value: income, color: 'text-emerald-400' },
          { label: 'Gastos', value: expense, color: 'text-red-400' },
          { label: 'Balance', value: balance, color: balance >= 0 ? 'text-violet-400' : 'text-red-400' },
        ].map(card => (
          <div key={card.label} className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-1">
            <p className="text-zinc-400 text-xs">{card.label}</p>
            <p className={`font-bold text-sm ${card.color}`}>{fmt(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-3">Gastos por categoría</h2>
        {summary.byCategory.length === 0
          ? <p className="text-zinc-500 text-sm">Sin datos este mes.</p>
          : summary.byCategory.map(c => (
            <div key={c.name} className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-0">
              <span className="text-zinc-300 text-sm">{c.icon} {c.name}</span>
              <span className="text-red-400 text-sm font-medium">{fmt(c.total)}</span>
            </div>
          ))}
      </div>
    </div>
  )
}