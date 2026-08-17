import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import styles from './PageHeader.module.css'

interface Props {
  title: string
  onBack?: () => void
  action?: ReactNode
}

export function PageHeader({ title, onBack, action }: Props) {
  const navigate = useNavigate()

  return (
    <div className={styles.header}>
      {onBack && (
        <button type="button" className={`${styles.back} raised-sm`} onClick={onBack ?? (() => navigate(-1))}>
          <ChevronLeft size={20} strokeWidth={2.3} />
        </button>
      )}
      <div className={styles.title}>{title}</div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
