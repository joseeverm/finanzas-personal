import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Tag, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categorías', icon: Tag },
]

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
        <div className="flex items-center gap-2 mr-4">
          <Wallet size={20} className="text-violet-400" />
          <span className="text-white font-bold text-lg">Finanzas</span>
        </div>

        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${isActive ? 'text-violet-400 font-semibold' : 'text-zinc-400 hover:text-white'}`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}

        <div className="ml-auto flex items-center gap-4">
          {user?.picture
            ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            : <span className="text-zinc-400 text-sm">{user?.name}</span>
          }

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </nav>

      {/* Mobile — barra inferior */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 flex z-50">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors
              ${isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-white'}`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center py-3 gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          Salir
        </button>
      </nav>

    </>
  )
}
