import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useCategories, useCurrency, useDebts, useTransactions } from '../db/hooks'
import { debtRemainingAmount } from '../db/repo'
import { isWithinPeriod } from '../utils/date'
import { CURRENCIES } from '../utils/currency'
import { BalanceDisc } from '../components/BalanceDisc'
import { StatCapsuleRow } from '../components/StatCapsuleRow'
import { DebtSummaryRow } from '../components/DebtSummaryRow'
import { TransactionItem } from '../components/TransactionItem'
import { EmptyState } from '../components/EmptyState'
import styles from './Dashboard.module.css'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export function Dashboard() {
  const navigate = useNavigate()
  const currency = useCurrency()
  const transactions = useTransactions()
  const categories = useCategories()
  const debts = useDebts()

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const { balance, monthIncome, monthExpense } = useMemo(() => {
    let balance = 0
    let monthIncome = 0
    let monthExpense = 0
    for (const t of transactions) {
      const signed = t.type === 'income' ? t.amount : -t.amount
      balance += signed
      if (isWithinPeriod(t.date, 'month')) {
        if (t.type === 'income') monthIncome += t.amount
        else monthExpense += t.amount
      }
    }
    return { balance, monthIncome, monthExpense }
  }, [transactions])

  const { owedToMe, iOwe } = useMemo(() => {
    let owedToMe = 0
    let iOwe = 0
    for (const d of debts) {
      if (d.status === 'closed') continue
      const remaining = debtRemainingAmount(d)
      if (d.direction === 'owed_to_me') owedToMe += remaining
      else iOwe += remaining
    }
    return { owedToMe, iOwe }
  }, [debts])

  const recent = transactions.slice(0, 5)

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.greeting}>
          {getGreeting()}
          <strong>Кошелёк</strong>
        </div>
        <div className={styles.avatar}>
          <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 15 }}>
            {CURRENCIES[currency].symbol}
          </span>
        </div>
      </div>

      <BalanceDisc balance={balance} balanceWithDebts={balance + owedToMe - iOwe} currency={currency} />

      <StatCapsuleRow income={monthIncome} expense={monthExpense} currency={currency} />

      <DebtSummaryRow owedToMe={owedToMe} iOwe={iOwe} currency={currency} />

      <div className={styles.sectionHead}>
        <div className={styles.sectionTitle}>Последние операции</div>
        <button type="button" className={styles.sectionLink} onClick={() => navigate('/transactions')}>
          Все
        </button>
      </div>

      {recent.length === 0 ? (
        <EmptyState icon={Wallet} text="Пока нет операций — добавьте первую через кнопку «+»" />
      ) : (
        <div className={styles.txList}>
          {recent.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              category={categoryById.get(t.category)}
              currency={currency}
              onClick={() => navigate(`/add?id=${t.id}`)}
            />
          ))}
        </div>
      )}
    </>
  )
}
