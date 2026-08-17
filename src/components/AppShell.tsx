import type { ReactNode } from 'react'
import styles from './AppShell.module.css'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {children}
      <BottomNav />
    </div>
  )
}
