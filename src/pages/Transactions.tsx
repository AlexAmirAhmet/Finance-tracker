import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { TransactionItem } from '../components/TransactionItem'
import { useCategories, useCurrency, useTransactions } from '../db/hooks'
import { deleteTransaction } from '../db/repo'
import { isWithinPeriod } from '../utils/date'
import type { TransactionType } from '../types'
import styles from './Transactions.module.css'

type Period = 'day' | 'week' | 'month' | 'all'
type TypeFilter = 'all' | TransactionType

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'all', label: 'Всё время' },
]

const TYPES: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'income', label: 'Доходы' },
  { value: 'expense', label: 'Расходы' },
]

function groupLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (sameDay(date, now)) return 'Сегодня'
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(date, yesterday)) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function Transactions() {
  const navigate = useNavigate()
  const currency = useCurrency()
  const transactions = useTransactions()
  const allCategories = useCategories()

  const [period, setPeriod] = useState<Period>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryId, setCategoryId] = useState<string>('all')

  const categoryById = useMemo(() => new Map(allCategories.map((c) => [c.id, c])), [allCategories])
  const categoryOptions = useMemo(
    () => (typeFilter === 'all' ? allCategories : allCategories.filter((c) => c.type === typeFilter)),
    [allCategories, typeFilter]
  )

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (!isWithinPeriod(t.date, period)) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryId !== 'all' && t.category !== categoryId) return false
      return true
    })
  }, [transactions, period, typeFilter, categoryId])

  async function handleLongPress(id: string) {
    if (!confirm('Удалить операцию?')) return
    await deleteTransaction(id)
  }

  let lastGroup = ''

  return (
    <>
      <PageHeader title="Операции" />

      <div className={styles.filters}>
        <div className={styles.pillRow}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`${styles.pill} raised-sm ${period === p.value ? styles.pillActive : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.pillRow}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`${styles.pill} raised-sm ${typeFilter === t.value ? styles.pillActive : ''}`}
              onClick={() => {
                setTypeFilter(t.value)
                setCategoryId('all')
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`${styles.select} raised-sm`}>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="all">Все категории</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={List} text="Операций не найдено" />
      ) : (
        <div className={styles.list}>
          {filtered.map((t) => {
            const g = groupLabel(t.date)
            const showHeader = g !== lastGroup
            lastGroup = g
            return (
              <div key={t.id}>
                {showHeader && <div className={styles.groupLabel}>{g}</div>}
                <TransactionItem
                  transaction={t}
                  category={categoryById.get(t.category)}
                  currency={currency}
                  onClick={() => navigate(`/add?id=${t.id}`)}
                  onLongPress={() => handleLongPress(t.id)}
                />
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
