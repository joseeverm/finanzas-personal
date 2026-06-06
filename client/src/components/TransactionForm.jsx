import { useState, useEffect } from 'react'
import { getCategories } from '../api'

const today = new Date().toLocaleDateString('en-CA')

// Formatea número con espacios: 1000000 → "1 000 000"
const formatCOP = (val) => {
    const num = val.replace(/\D/g, '')
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Quita espacios para obtener el número real
const parseAmount = (val) => Number(val.replace(/\s/g, ''))

export default function TransactionForm({ onSubmit }) {
    const [categories, setCategories] = useState([])
    const [displayAmount, setDisplayAmount] = useState('')
    const [form, setForm] = useState({
        type: 'expense', category_id: '', date: today, note: ''
    })

    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleAmountChange = (e) => {
        setDisplayAmount(formatCOP(e.target.value))
    }

    const handleSubmit = async () => {
        const amount = parseAmount(displayAmount)
        if (!amount || !form.date) return
        if (form.type === 'expense' && !form.category_id) return
        await onSubmit({ ...form, amount })
        setDisplayAmount('')
        setForm({ type: 'expense', category_id: '', date: today, note: '' })
    }

    return (
        <div className="bg-zinc-800 rounded-xl p-5 flex flex-col gap-3">
            <h2 className="text-white font-semibold text-base">Nueva transacción</h2>

            <div className="flex gap-2">
                {['expense', 'income'].map(t => (
                    <button
                        key={t}
                        onClick={() => set('type', t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${form.type === t
                                ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                                : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}
                    >
                        {t === 'expense' ? '🔴 Gasto' : '🟢 Ingreso'}
                    </button>
                ))}
            </div>

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    className="bg-zinc-700 text-white rounded-lg pl-7 pr-3 py-2 text-sm w-full outline-none focus:ring-2 ring-violet-500 tracking-wider"
                />
            </div>

            {form.type === 'expense' && (
                <select
                    value={form.category_id}
                    onChange={e => set('category_id', e.target.value)}
                    className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
                >
                    <option value="">Categoría</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                </select>
            )}

            <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            />

            <input
                type="text"
                placeholder="Nota (opcional)"
                value={form.note}
                onChange={e => set('note', e.target.value)}
                className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
            />

            <button
                onClick={handleSubmit}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
            >
                Guardar
            </button>
        </div>
    )
}