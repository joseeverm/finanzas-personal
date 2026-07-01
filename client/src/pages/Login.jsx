import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle(credentialResponse) {
    try {
      const data = await loginWithGoogle(credentialResponse.credential)
      login(data.token, data.user)
      navigate('/')
    } catch {
      setError('Error al iniciar sesión con Google.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await loginWithEmail(form.email, form.password)
        : await registerWithEmail(form.email, form.password, form.name)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setForm({ email: '', password: '', name: '' })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="logo" className="w-8 h-8" />
          <span className="text-white text-2xl font-bold">Finanzas</span>
        </div>

        <p className="text-zinc-400 text-sm -mt-3">
          {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Nombre"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-zinc-500 text-xs">o</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => setError('Error al iniciar sesión con Google.')}
          theme="filled_black"
          shape="pill"
          size="large"
          locale="es"
        />

        <button onClick={toggle} className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}
