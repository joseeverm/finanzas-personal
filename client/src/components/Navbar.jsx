import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { exportData } from '../api'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transacciones', icon: '💸' },
  { to: '/categories', label: 'Categorías', icon: '🏷️' },
]

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

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Desktop — barra superior */}
      <nav className="hidden md:flex bg-zinc-900 border-b border-zinc-700 px-6 py-3 gap-6 items-center">
        <span className="text-white font-bold text-lg mr-4">💰 Finanzas</span>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `text-sm transition-colors ${isActive ? 'text-violet-400 font-semibold' : 'text-zinc-400 hover:text-white'}`
            }
          >
            {link.icon} {link.label}
          </NavLink>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleExport}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
            title="Exportar datos"
          >
            ⬇️ Exportar
          </button>
          {user?.picture
            ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            : <span className="text-zinc-400 text-sm">{user?.name}</span>
          }
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Mobile — barra inferior */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 flex z-50">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors
              ${isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-white'}`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={handleExport}
          className="flex-1 flex flex-col items-center py-3 gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          <span className="text-xl">⬇️</span>
          Exportar
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center py-3 gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          <span className="text-xl">🚪</span>
          Salir
        </button>
      </nav>

      {/* Espaciado para que el contenido no quede tapado por la barra inferior en mobile */}
      <div className="md:hidden h-16" />
    </>
  )
}
