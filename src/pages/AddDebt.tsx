import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useCurrency } from '../db/hooks'
import { addDebt } from '../db/repo'
import { CURRENCIES } from '../utils/currency'
import { dateInputToISO, formatDateInput, todayISO } from '../utils/date'
import type { DebtDirection } from '../types'
import styles from './AddTransaction.module.css'

export function AddDebt() {
  const navigate = useNavigate()
  const currency = useCurrency()

  const [direction, setDirection] = useState<DebtDirection>('owed_to_me')
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [dateCreated, setDateCreated] = useState(formatDateInput(todayISO()))
  const [dueDate, setDueDate] = useState('')

  const amountValue = parseFloat(amount.replace(',', '.'))
  const canSave = amountValue > 0 && person.trim().length > 0

  async function handleSave() {
    if (!canSave) return
    await addDebt({
      direction,
      person: person.trim(),
      amount: amountValue,
      reason: reason.trim() || undefined,
      dateCreated: dateInputToISO(dateCreated),
      dueDate: dueDate ? dateInputToISO(dueDate) : undefined,
    })
    navigate(-1)
  }

  return (
    <>
      <PageHeader title="Новый долг" onBack={() => navigate(-1)} />

      <div className={`${styles.toggle} inset`}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${direction === 'owed_to_me' ? styles.toggleBtnActive : ''}`}
          onClick={() => setDirection('owed_to_me')}
        >
          Мне должны
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${direction === 'i_owe' ? styles.toggleBtnActive : ''}`}
          onClick={() => setDirection('i_owe')}
        >
          Я должен
        </button>
      </div>

      <div className={`${styles.amountWrap} inset`}>
        <div className={styles.amountLabel}>Сумма, {CURRENCIES[currency].symbol}</div>
        <input
          className={styles.amountInput}
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Имя</div>
        <div className={`${styles.field} raised-sm`}>
          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Кто занимал / кому должны"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Причина</div>
        <div className={`${styles.field} raised-sm`}>
          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Необязательно"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Дата</div>
        <div className={`${styles.field} raised-sm`}>
          <input
            type="date"
            className={styles.fieldInput}
            value={dateCreated}
            max={formatDateInput(todayISO())}
            onChange={(e) => setDateCreated(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Срок возврата</div>
        <div className={`${styles.field} raised-sm`}>
          <input
            type="date"
            className={styles.fieldInput}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <button type="button" className={styles.saveBtn} disabled={!canSave} onClick={handleSave}>
        Сохранить
      </button>
    </>
  )
}
