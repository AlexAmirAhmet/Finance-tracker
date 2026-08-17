import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, HandCoins } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { useCurrency, useDebts } from '../db/hooks'
import { debtPaidAmount, debtRemainingAmount } from '../db/repo'
import { formatMoney } from '../utils/currency'
import { formatDateShort } from '../utils/date'
import { DEBT_STATUS_LABEL } from '../utils/debtStatus'
import type { Debt, DebtDirection } from '../types'
import styles from './Debts.module.css'

const STATUS_CLASS: Record<Debt['status'], string> = {
  open: styles.badgeOpen,
  partial: styles.badgePartial,
  closed: styles.badgeClosed,
}

export function Debts() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const currency = useCurrency()
  const initialTab = params.get('tab') === 'i_owe' ? 'i_owe' : 'owed_to_me'
  const [tab, setTab] = useState<DebtDirection>(initialTab)

  const debts = useDebts(tab)
  const sorted = useMemo(
    () => [...debts].sort((a, b) => (a.status === 'closed' ? 1 : 0) - (b.status === 'closed' ? 1 : 0)),
    [debts]
  )

  return (
    <>
      <PageHeader
        title="Долги"
        action={
          <button type="button" className="raised-sm" onClick={() => navigate('/debts/new')} style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-dark)' }}>
            <Plus size={20} strokeWidth={2.4} />
          </button>
        }
      />

      <div className={`${styles.tabs} inset`}>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'owed_to_me' ? styles.tabActive : ''}`}
          onClick={() => setTab('owed_to_me')}
        >
          Мне должны
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'i_owe' ? styles.tabActive : ''}`}
          onClick={() => setTab('i_owe')}
        >
          Я должен
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={HandCoins} text="Пока нет долгов в этой категории" />
      ) : (
        <div className={styles.list}>
          {sorted.map((d) => {
            const remaining = debtRemainingAmount(d)
            const paid = debtPaidAmount(d)
            const progress = d.amount > 0 ? Math.min(100, (paid / d.amount) * 100) : 0
            return (
              <button key={d.id} type="button" className={`${styles.card} raised`} onClick={() => navigate(`/debts/${d.id}`)}>
                <div className={styles.cardTop}>
                  <span className={styles.person}>{d.person}</span>
                  <span className={styles.amount}>{formatMoney(remaining, currency)}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={`${styles.badge} ${STATUS_CLASS[d.status]}`}>{DEBT_STATUS_LABEL[d.status]}</span>
                  {d.dueDate && d.status !== 'closed' && <span className={styles.due}>до {formatDateShort(d.dueDate)}</span>}
                </div>
                {d.status === 'partial' && (
                  <div className={`${styles.progressTrack} inset`}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
