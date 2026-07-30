import { useState } from 'react'
import { Download } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { exportData } from '../api'

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

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth)
  const { transactions, loading, add, remove } = useTransactions(month)

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
      {loading ? <p className="text-zinc-500 text-sm text-center">Cargando...</p> : <TransactionList transactions={transactions} onDelete={remove} />}

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
