import { useState, useEffect } from 'react'
import { getCategories, createCategory } from '../api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#6366f1' })

  const load = () => getCategories().then(setCategories)
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.name) return
    await createCategory(form)
    setForm({ name: '', icon: '📦', color: '#6366f1' })
    load()
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      <h1 className="text-white font-bold text-xl">Categorías</h1>

      <div className="bg-zinc-800 rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-white font-semibold text-sm">Nueva categoría</h2>
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-violet-500"
        />
        <div className="flex gap-2">
          <input
            placeholder="Icono"
            value={form.icon}
            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            className="bg-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none w-24"
          />
          <input
            type="color"
            value={form.color}
            onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            className="bg-zinc-700 rounded-lg px-2 py-1 h-10 cursor-pointer"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
        >
          Agregar
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map(c => (
          <li key={c.id} className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">{c.icon}</span>
            <span className="text-white text-sm">{c.name}</span>
            <span className="ml-auto w-3 h-3 rounded-full" style={{ background: c.color }} />
          </li>
        ))}
      </ul>
    </div>
  )
}