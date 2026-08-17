import { useRef } from 'react'
import type { Category, CurrencyCode, Transaction } from '../types'
import { formatMoney } from '../utils/currency'
import { formatRelativeDateTime } from '../utils/date'
import { getCategoryIcon } from '../utils/categoryIcons'
import styles from './TransactionItem.module.css'

interface Props {
  transaction: Transaction
  category?: Category
  currency: CurrencyCode
  onClick?: () => void
  onLongPress?: () => void
}

const LONG_PRESS_MS = 550

export function TransactionItem({ transaction, category, currency, onClick, onLongPress }: Props) {
  const Icon = getCategoryIcon(category?.icon ?? 'more-horizontal')
  const isIncome = transaction.type === 'income'

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  function startPress() {
    firedRef.current = false
    if (!onLongPress) return
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onLongPress()
    }, LONG_PRESS_MS)
  }

  function cancelPress() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  function handleClick() {
    if (firedRef.current) {
      firedRef.current = false
      return
    }
    onClick?.()
  }

  return (
    <button
      type="button"
      className={`${styles.item} raised-sm`}
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
    >
      <span className={styles.icon}>
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className={styles.mid}>
        <span className={styles.name}>{category?.name ?? 'Без категории'}</span>
        <span className={styles.meta}>
          {formatRelativeDateTime(transaction.date)}
          {transaction.note ? ` · ${transaction.note}` : ''}
        </span>
      </span>
      <span className={`${styles.amount} ${isIncome ? styles.pos : ''}`}>
        {formatMoney(isIncome ? transaction.amount : -transaction.amount, currency, { sign: true })}
      </span>
    </button>
  )
}
