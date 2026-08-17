import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useCurrency, useDebt } from '../db/hooks'
import { addDebtPayment, debtPaidAmount, debtRemainingAmount, deleteDebt } from '../db/repo'
import { formatMoney } from '../utils/currency'
import { formatDateInput, formatDateShort, todayISO, dateInputToISO } from '../utils/date'
import { DEBT_STATUS_LABEL } from '../utils/debtStatus'
import formStyles from './AddTransaction.module.css'
import styles from './DebtDetail.module.css'

const STATUS_CLASS: Record<string, string> = {
  open: styles.badgeOpen,
  partial: styles.badgePartial,
  closed: styles.badgeClosed,
}

export function DebtDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currency = useCurrency()
  const debt = useDebt(id)

  const [formOpen, setFormOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(formatDateInput(todayISO()))
  const [note, setNote] = useState('')
  const [linkTx, setLinkTx] = useState(true)

  if (!debt) return null

  const paid = debtPaidAmount(debt)
  const remaining = debtRemainingAmount(debt)
  const progress = debt.amount > 0 ? Math.min(100, (paid / debt.amount) * 100) : 0
  const amountValue = parseFloat(amount.replace(',', '.'))
  const canSave = amountValue > 0 && debt.status !== 'closed'

  async function handleAddPayment() {
    if (!debt || !canSave) return
    await addDebtPayment(debt.id, { amount: amountValue, date: dateInputToISO(date), note: note.trim() || undefined }, linkTx)
    setAmount('')
    setNote('')
    setFormOpen(false)
  }

  async function handleDelete() {
    if (!debt) return
    if (!confirm('Удалить долг и связанные с ним операции?')) return
    await deleteDebt(debt.id)
    navigate('/debts')
  }

  return (
    <>
      <PageHeader title="Долг" onBack={() => navigate(-1)} />

      <div className={`${styles.infoCard} raised`}>
        <div className={styles.infoTop}>
          <span className={styles.person}>{debt.person}</span>
          <span className={`${styles.badge} ${STATUS_CLASS[debt.status]}`}>{DEBT_STATUS_LABEL[debt.status]}</span>
        </div>
        {debt.reason && <div className={styles.reason}>{debt.reason}</div>}

        <div className={styles.amountRow}>
          <div className={styles.amountCol}>
            <div className={styles.amountColLabel}>Сумма долга</div>
            <div className={styles.amountColValue}>{formatMoney(debt.amount, currency)}</div>
          </div>
          <div className={styles.amountCol}>
            <div className={styles.amountColLabel}>Осталось</div>
            <div className={styles.amountColValue}>{formatMoney(remaining, currency)}</div>
          </div>
        </div>

        {paid > 0 && (
          <div className={`${styles.progressTrack} inset`}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className={styles.dates}>
          <span>Создан: {formatDateShort(debt.dateCreated)}</span>
          {debt.dueDate && <span>Срок: {formatDateShort(debt.dueDate)}</span>}
        </div>
      </div>

      {debt.status !== 'closed' && !formOpen && (
        <button type="button" className={styles.addPaymentBtn} onClick={() => setFormOpen(true)}>
          Добавить платёж
        </button>
      )}

      {formOpen && (
        <div className={`${styles.paymentForm} raised`}>
          <div className={formStyles.section} style={{ marginBottom: 14 }}>
            <div className={formStyles.sectionLabel}>Сумма платежа</div>
            <div className={`${formStyles.field} inset`}>
              <input
                className={formStyles.fieldInput}
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className={formStyles.section} style={{ marginBottom: 14 }}>
            <div className={formStyles.sectionLabel}>Дата</div>
            <div className={`${formStyles.field} inset`}>
              <input
                type="date"
                className={formStyles.fieldInput}
                value={date}
                max={formatDateInput(todayISO())}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className={formStyles.section} style={{ marginBottom: 0 }}>
            <div className={formStyles.sectionLabel}>Комментарий</div>
            <div className={`${formStyles.field} inset`}>
              <input
                type="text"
                className={formStyles.fieldInput}
                placeholder="Необязательно"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <label className={styles.checkRow}>
            <input type="checkbox" checked={linkTx} onChange={(e) => setLinkTx(e.target.checked)} />
            Создать связанную операцию {debt.direction === 'owed_to_me' ? 'дохода' : 'расхода'}
          </label>

          <button type="button" className={formStyles.saveBtn} disabled={!canSave} onClick={handleAddPayment}>
            Сохранить платёж
          </button>
        </div>
      )}

      {debt.payments.length > 0 && (
        <>
          <div className={styles.sectionTitle}>История платежей</div>
          <div className={styles.paymentList}>
            {[...debt.payments]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <div key={p.id} className={`${styles.paymentItem} raised-sm`}>
                  <div>
                    <div className={styles.paymentDate}>{formatDateShort(p.date)}</div>
                    {p.note && <div className={styles.paymentNote}>{p.note}</div>}
                  </div>
                  <div className={styles.paymentAmount}>{formatMoney(p.amount, currency, { sign: true })}</div>
                </div>
              ))}
          </div>
        </>
      )}

      <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
        <Trash2 size={14} strokeWidth={2.2} style={{ verticalAlign: -2, marginRight: 6 }} />
        Удалить долг
      </button>
    </>
  )
}
