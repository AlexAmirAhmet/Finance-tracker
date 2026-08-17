import { NavLink } from 'react-router-dom'
import { Home, List, ArrowLeftRight, Settings, Plus } from 'lucide-react'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Главная', end: true },
  { to: '/transactions', icon: List, label: 'Операции' },
  { to: '/debts', icon: ArrowLeftRight, label: 'Долги' },
  { to: '/settings', icon: Settings, label: 'Ещё' },
]

export function BottomNav() {
  return (
    <nav className={`${styles.nav} raised`}>
      {NAV_ITEMS.slice(0, 2).map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </NavLink>
      ))}

      <NavLink to="/add" aria-label="Добавить операцию" className={styles.fab}>
        <Plus size={26} strokeWidth={2.5} />
      </NavLink>

      {NAV_ITEMS.slice(2).map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={label}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </NavLink>
      ))}
    </nav>
  )
}
