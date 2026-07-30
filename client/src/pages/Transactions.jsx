import { useState, useEffect } from 'react'
import { ChevronDown, Download, List, LayoutGrid } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { exportData, getCategories } from '../api'

async function handleExport() {
  const data = await exportData()
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finanzas-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const currentMonth = new Date().toISOString().slice(0, 7)

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

// Agrupa en el cliente: los gastos por category_id (join contra las categorías ya
// cargadas) y los ingresos aparte, porque no tienen category_id.
function groupByCategory(transactions, categories) {
  const byId = new Map(categories.map(c => [String(c.id), c]))
  const groups = new Map()

  for (const t of transactions) {
    const isIncome = t.type === 'income'
    const key = isIncome ? 'income' : `cat-${t.category_id ?? 'none'}`

    if (!groups.has(key)) {
      const category = isIncome ? null : byId.get(String(t.category_id))
      groups.set(key, {
        key,
        isIncome,
        name: isIncome ? 'Ingresos' : (category?.name ?? 'Sin categoría'),
        color: isIncome ? '#34d399' : (category?.color ?? '#71717a'),
        total: 0,
        transactions: [],
      })
    }

    const group = groups.get(key)
    group.total += Number(t.amount)
    group.transactions.push(t)
  }

  const all = [...groups.values()]
  const income = all.find(g => g.isIncome)
  const expenses = all.filter(g => !g.isIncome).sort((a, b) => b.total - a.total)

  return income ? [...expenses, income] : expenses
}

function CategorySection({ group, open, onToggle, onDelete }) {
  return (
    <div className="bg-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-700/40 transition-colors"
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.color }} />
        <span className="flex-1 min-w-0">
          <span className="block text-white text-sm font-medium truncate">{group.name}</span>
          <span className="block text-zinc-400 text-xs">
            {group.transactions.length} {group.transactions.length === 1 ? 'transacción' : 'transacciones'}
          </span>
        </span>
        <span className={`text-sm font-semibold ${group.isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
          {fmt(group.total)}
        </span>
        <ChevronDown
          size={16}
          className={`text-zinc-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {/* zinc-900 para que las tarjetas zinc-800 de TransactionList se distingan del contenedor */}
      {open && (
        <div className="bg-zinc-900 px-3 py-3">
          <TransactionList transactions={group.transactions} onDelete={onDelete} />
        </div>
      )}
    </div>
  )
}

function GroupedTransactions({ transactions, categories, month, onDelete }) {
  const [openKeys, setOpenKeys] = useState(() => new Set())

  // Todas las secciones arrancan cerradas y se resetean al cambiar de mes.
  useEffect(() => { setOpenKeys(new Set()) }, [month])

  const toggle = (key) => setOpenKeys(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const groups = groupByCategory(transactions, categories)

  if (!groups.length)
    return <p className="text-zinc-500 text-sm text-center py-8">Sin transacciones este mes.</p>

  return (
    <div className="flex flex-col gap-2">
      {groups.map(group => (
        <CategorySection
          key={group.key}
          group={group}
          open={openKeys.has(group.key)}
          onToggle={() => toggle(group.key)}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth)
  const [view, setView] = useState('list')
  const [categories, setCategories] = useState([])
  const { transactions, loading, add, remove } = useTransactions(month)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Transacciones</h1>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ring-violet-500"
        />
      </div>
      <TransactionForm onSubmit={add} />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {[
            { value: 'list', label: 'Lista', icon: List },
            { value: 'grouped', label: 'Por categoría', icon: LayoutGrid },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === value ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-zinc-500 text-sm text-center">Cargando...</p>
        ) : view === 'list' ? (
          <TransactionList transactions={transactions} onDelete={remove} />
        ) : (
          <GroupedTransactions
            transactions={transactions}
            categories={categories}
            month={month}
            onDelete={remove}
          />
        )}
      </div>

      <button
        onClick={handleExport}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm transition-colors"
      >
        <Download size={15} />
        Exportar datos
      </button>
    </div>
  )
}
