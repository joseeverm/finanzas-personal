import { useState, useEffect } from 'react'
import { getSummary, getBalance } from '../api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const currentMonth = new Date().toISOString().slice(0, 7)

const fmt = (n) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0
}).format(n)

const fmtShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

const getLast6Months = () => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }
  return months
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [month, setMonth] = useState(currentMonth)
  const [history, setHistory] = useState([])
  const [totalBalance, setTotalBalance] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getBalance().then(data => setTotalBalance(data.balance))
  }, [refreshKey])

  useEffect(() => {
    getSummary({ month }).then(data => setSummary(data))
  }, [month])

  useEffect(() => {
    const months = getLast6Months()
    Promise.all(months.map(m => getSummary({ month: m }).then(s => ({ month: m, data: s }))))
      .then(results => {
        setHistory(results.map(r => ({
          mes: r.month.slice(5),
          Ingresos: r.data.totals.find(t => t.type === 'income')?.total ?? 0,
          Gastos: r.data.totals.find(t => t.type === 'expense')?.total ?? 0,
        })))
      })
  }, [])

  const income = summary?.totals.find(t => t.type === 'income')?.total ?? 0
  const expense = summary?.totals.find(t => t.type === 'expense')?.total ?? 0
  const balance = income - expense

  const pieData = (summary?.byCategory ?? []).map(c => ({
    name: c.name,
    value: Number(c.total),
    color: c.color,
  }))

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">

      <h1 className="text-white font-bold text-xl">Dashboard</h1>

      {/* Saldo actual total (sin filtro de fecha) */}
      <div className="bg-zinc-800 rounded-xl p-6 flex flex-col gap-2">
        <p className="text-zinc-400 text-sm">Saldo actual</p>
        {totalBalance !== null ? (
          <p className={`font-bold text-4xl tracking-tight ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(totalBalance)}
          </p>
        ) : (
          <p className="text-zinc-600 text-4xl font-bold">—</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm font-medium">Resumen mensual</span>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ring-violet-500"
        />
      </div>

      {/* Tarjetas resumen mensual */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ingresos', value: income, color: 'text-emerald-400' },
            { label: 'Gastos', value: expense, color: 'text-red-400' },
            { label: 'Balance', value: balance, color: balance >= 0 ? 'text-violet-400' : 'text-red-400' },
          ].map(card => (
            <div key={card.label} className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-zinc-400 text-xs">{card.label}</p>
              <p className={`font-bold text-sm ${card.color}`}>{fmtShort(card.value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Torta por categoría */}
      {pieData.length > 0 && (
        <div className="bg-zinc-800 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Gastos por categoría</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => fmt(value)}
                contentStyle={{ background: '#27272a', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex flex-col gap-2 mt-3">
            {pieData.map((c, i) => (
              <li key={i} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="text-red-400 font-medium">{fmt(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Barras mes a mes */}
      <div className="bg-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Últimos 6 meses</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={history} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtShort} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip
              formatter={(value) => fmt(value)}
              contentStyle={{ background: '#27272a', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
