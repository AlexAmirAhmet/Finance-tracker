import { ArrowUp, ArrowDown } from 'lucide-react'
import type { CurrencyCode } from '../types'
import { formatMoney } from '../utils/currency'
import styles from './StatCapsule.module.css'

interface Props {
  income: number
  expense: number
  currency: CurrencyCode
}

export function StatCapsuleRow({ income, expense, currency }: Props) {
  return (
    <div className={styles.row}>
      <div className={`${styles.capsule} raised`}>
        <div className={`${styles.icon} ${styles.iconIncome}`}>
          <ArrowUp size={16} strokeWidth={2.5} />
        </div>
        <div className={styles.label}>Доходы</div>
        <div className={`${styles.amount} ${styles.pos}`}>{formatMoney(income, currency, { sign: true })}</div>
      </div>
      <div className={`${styles.capsule} raised`}>
        <div className={`${styles.icon} ${styles.iconExpense}`}>
          <ArrowDown size={16} strokeWidth={2.5} />
        </div>
        <div className={styles.label}>Расходы</div>
        <div className={styles.amount}>{formatMoney(-expense, currency, { sign: true })}</div>
      </div>
    </div>
  )
}
