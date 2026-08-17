import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useCategories, useCurrency, useTransaction } from '../db/hooks'
import { addTransaction, deleteTransaction, updateTransaction } from '../db/repo'
import { CURRENCIES } from '../utils/currency'
import { dateInputToISO, formatDateInput, todayISO } from '../utils/date'
import { getCategoryIcon } from '../utils/categoryIcons'
import type { TransactionType } from '../types'
import styles from './AddTransaction.module.css'

export function AddTransaction() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('id') ?? undefined
  const existing = useTransaction(editId)
  const currency = useCurrency()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [date, setDate] = useState(formatDateInput(todayISO()))
  const [note, setNote] = useState('')

  const categories = useCategories(type)

  useEffect(() => {
    if (existing) {
      setType(existing.type)
      setAmount(String(existing.amount))
      setCategoryId(existing.category)
      setDate(formatDateInput(existing.date))
      setNote(existing.note ?? '')
    }
  }, [existing])

  // reset category selection when switching type (unless it still belongs to the new type)
  useEffect(() => {
    if (categoryId && !categories.some((c) => c.id === categoryId)) {
      setCategoryId(null)
    }
  }, [type, categories, categoryId])

  const amountValue = parseFloat(amount.replace(',', '.'))
  const canSave = amountValue > 0 && !!categoryId

  async function handleSave() {
    if (!canSave || !categoryId) return
    const payload = {
      type,
      amount: amountValue,
      category: categoryId,
      date: dateInputToISO(date),
      note: note.trim() || undefined,
    }

    if (existing) {
      await updateTransaction(existing.id, payload)
    } else {
      await addTransaction(payload)
    }
    navigate(-1)
  }

  async function handleDelete() {
    if (!existing) return
    if (!confirm('Удалить операцию?')) return
    await deleteTransaction(existing.id)
    navigate(-1)
  }

  return (
    <>
      <PageHeader title={existing ? 'Редактировать операцию' : 'Новая операция'} onBack={() => navigate(-1)} />

      <div className={`${styles.toggle} inset`}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${type === 'income' ? styles.toggleBtnActive : ''}`}
          onClick={() => setType('income')}
        >
          Доход
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${type === 'expense' ? styles.toggleBtnActive : ''}`}
          onClick={() => setType('expense')}
        >
          Расход
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
        <div className={styles.sectionLabel}>Категория</div>
        <div className={styles.catGrid}>
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon)
            const active = c.id === categoryId
            return (
              <button
                key={c.id}
                type="button"
                className={`${styles.catTile} raised-sm ${active ? styles.catTileActive : ''}`}
                onClick={() => setCategoryId(c.id)}
              >
                <span className={styles.catIcon}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className={styles.catName}>{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Дата</div>
        <div className={`${styles.field} raised-sm`}>
          <input
            type="date"
            className={styles.fieldInput}
            value={date}
            max={formatDateInput(todayISO())}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Комментарий</div>
        <div className={`${styles.field} raised-sm`}>
          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Необязательно"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <button type="button" className={styles.saveBtn} disabled={!canSave} onClick={handleSave}>
        Сохранить
      </button>

      {existing && (
        <button type="button" className={styles.deleteBtn} onClick={handleDelete}>
          <Trash2 size={14} strokeWidth={2.2} style={{ verticalAlign: -2, marginRight: 6 }} />
          Удалить операцию
        </button>
      )}
    </>
  )
}
