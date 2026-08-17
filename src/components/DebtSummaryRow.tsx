import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { CurrencyCode } from '../types'
import { formatMoney } from '../utils/currency'
import styles from './DebtSummaryRow.module.css'

interface Props {
  owedToMe: number
  iOwe: number
  currency: CurrencyCode
}

export function DebtSummaryRow({ owedToMe, iOwe, currency }: Props) {
  const navigate = useNavigate()

  return (
    <div className={styles.row}>
      <button type="button" className={`${styles.card} raised`} onClick={() => navigate('/debts?tab=owed_to_me')}>
        <span className={`${styles.dot} ${styles.dotIn}`}>
          <ArrowLeft size={14} strokeWidth={2.5} />
        </span>
        <span className={styles.text}>
          <span className={styles.label}>Мне должны</span>
          <span className={styles.amount}>{formatMoney(owedToMe, currency)}</span>
        </span>
      </button>
      <button type="button" className={`${styles.card} raised`} onClick={() => navigate('/debts?tab=i_owe')}>
        <span className={`${styles.dot} ${styles.dotOut}`}>
          <ArrowRight size={14} strokeWidth={2.5} />
        </span>
        <span className={styles.text}>
          <span className={styles.label}>Я должен</span>
          <span className={styles.amount}>{formatMoney(iOwe, currency)}</span>
        </span>
      </button>
    </div>
  )
}
