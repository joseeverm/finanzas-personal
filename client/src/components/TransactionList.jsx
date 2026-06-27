import { useState } from 'react'
import { Trash2 } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
      <div className="bg-zinc-800 rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm">
        <p className="text-white font-semibold text-center">¿Eliminar esta transacción?</p>
        <p className="text-zinc-400 text-sm text-center">Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TransactionList({ transactions, onDelete }) {
  const [pendingId, setPendingId] = useState(null)

  const confirmDelete = () => {
    onDelete(pendingId)
    setPendingId(null)
  }

  if (!transactions.length)
    return <p className="text-zinc-500 text-sm text-center py-8">Sin transacciones este mes.</p>

  return (
    <>
      {pendingId && (
        <ConfirmDialog
          onConfirm={confirmDelete}
          onCancel={() => setPendingId(null)}
        />
      )}
      <ul className="flex flex-col gap-2">
        {transactions.map(t => (
          <li key={t.id} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className={`font-semibold text-sm ${t.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                {t.type === 'expense' ? '−' : '+'}{fmt(t.amount)}
              </p>
              <p className="text-zinc-400 text-xs">{t.date}{t.note && ` · ${t.note}`}</p>
            </div>
            <button
              onClick={() => setPendingId(t.id)}
              className="text-zinc-600 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
