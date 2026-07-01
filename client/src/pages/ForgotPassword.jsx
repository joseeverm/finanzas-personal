import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await forgotPassword(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="logo" className="w-8 h-8" />
          <span className="text-white text-2xl font-bold">Finanzas</span>
        </div>

        <div className="flex flex-col items-center gap-1 -mt-2 text-center">
          <p className="text-white font-semibold">Recuperar contraseña</p>
          <p className="text-zinc-400 text-sm">Te enviaremos un enlace a tu email</p>
        </div>

        {sent ? (
          <p className="text-emerald-400 text-sm text-center">
            Si ese email está registrado, recibirás un enlace en tu bandeja de entrada.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <Link to="/login" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
