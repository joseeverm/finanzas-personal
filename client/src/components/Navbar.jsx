import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transacciones', icon: '💸' },
  { to: '/categories', label: 'Categorías', icon: '🏷️' },
]

export default function Navbar() {
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
      </nav>

      {/* Espaciado para que el contenido no quede tapado por la barra inferior en mobile */}
      <div className="md:hidden h-16" />
    </>
  )
}