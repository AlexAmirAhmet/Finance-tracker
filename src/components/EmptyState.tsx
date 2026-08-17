import type { LucideIcon } from 'lucide-react'
import styles from './EmptyState.module.css'

interface Props {
  icon: LucideIcon
  text: string
}

export function EmptyState({ icon: Icon, text }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={`${styles.icon} raised-sm`}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className={styles.text}>{text}</div>
    </div>
  )
}
