import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [linkConfirm, setLinkConfirm] = useState(false)

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
      const code = err.response?.data?.error
      if (mode === 'register' && code === 'google_account_exists') {
        setLinkConfirm(true)
      } else if (mode === 'register' && code === 'email_already_exists') {
        setError('Ese email ya está registrado. ¿Quieres iniciar sesión?')
      } else {
        setError(code ?? 'Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLinkAccount() {
    setLoading(true)
    try {
      const data = await registerWithEmail(form.email, form.password, form.name, true)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setLinkConfirm(false)
      setError(err.response?.data?.error ?? 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setLinkConfirm(false)
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

        {successMessage && (
          <p className="text-emerald-400 text-sm text-center -mt-2">{successMessage}</p>
        )}

        {linkConfirm ? (
          <div className="w-full flex flex-col gap-4">
            <p className="text-zinc-300 text-sm text-center">
              Ya tienes una cuenta con ese email vinculada a Google. ¿Quieres agregar acceso con contraseña también?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLinkAccount}
                disabled={loading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Vinculando...' : 'Sí, vincular'}
              </button>
              <button
                onClick={() => setLinkConfirm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
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

            {mode === 'login' && (
              <Link to="/forgot-password" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors text-right">
                ¿Olvidaste tu contraseña?
              </Link>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </form>
        )}

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
