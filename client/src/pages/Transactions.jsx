import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

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
    </div>
  )
}