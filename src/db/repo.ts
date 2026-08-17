import { db, newId } from './db'
import { DEBT_EXPENSE_CATEGORY_ID, DEBT_INCOME_CATEGORY_ID } from './defaultCategories'
import type { AppSettings, Category, CurrencyCode, Debt, DebtPayment, Transaction } from '../types'

// ---------- Transactions ----------

export async function addTransaction(input: Omit<Transaction, 'id'>): Promise<string> {
  const id = newId()
  await db.transactions.add({ ...input, id })
  return id
}

export async function updateTransaction(id: string, changes: Partial<Omit<Transaction, 'id'>>): Promise<void> {
  await db.transactions.update(id, changes)
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id)
}

// ---------- Debts ----------

function computeDebtStatus(amount: number, payments: DebtPayment[]): Debt['status'] {
  const paid = payments.reduce((sum, p) => sum + p.amount, 0)
  if (paid <= 0) return 'open'
  if (paid < amount) return 'partial'
  return 'closed'
}

export function debtPaidAmount(debt: Debt): number {
  return debt.payments.reduce((sum, p) => sum + p.amount, 0)
}

export function debtRemainingAmount(debt: Debt): number {
  return Math.max(0, debt.amount - debtPaidAmount(debt))
}

export async function addDebt(input: Omit<Debt, 'id' | 'status' | 'payments'>): Promise<string> {
  const id = newId()
  await db.debts.add({ ...input, id, status: 'open', payments: [] })
  return id
}

export async function updateDebt(id: string, changes: Partial<Omit<Debt, 'id' | 'payments' | 'status'>>): Promise<void> {
  await db.debts.update(id, changes)
}

export async function deleteDebt(id: string): Promise<void> {
  await db.transactions.where('linkedDebtId').equals(id).delete()
  await db.debts.delete(id)
}

export async function addDebtPayment(
  debtId: string,
  payment: { amount: number; date: string; note?: string },
  createLinkedTransaction: boolean
): Promise<void> {
  const debt = await db.debts.get(debtId)
  if (!debt) return

  const newPayment: DebtPayment = { id: newId(), ...payment }
  const payments = [...debt.payments, newPayment]
  const status = computeDebtStatus(debt.amount, payments)

  await db.debts.update(debtId, { payments, status })

  if (createLinkedTransaction) {
    // owed_to_me: someone repays me -> money comes in -> income
    // i_owe: I repay someone -> money goes out -> expense
    const isIncome = debt.direction === 'owed_to_me'
    await addTransaction({
      type: isIncome ? 'income' : 'expense',
      amount: payment.amount,
      category: isIncome ? DEBT_INCOME_CATEGORY_ID : DEBT_EXPENSE_CATEGORY_ID,
      date: payment.date,
      note: payment.note ?? `Платёж по долгу: ${debt.person}`,
      linkedDebtId: debtId,
    })
  }
}

// ---------- Categories ----------

export async function addCategory(input: Omit<Category, 'id'>): Promise<string> {
  const id = newId()
  await db.categories.add({ ...input, id })
  return id
}

export async function updateCategory(id: string, changes: Partial<Omit<Category, 'id'>>): Promise<void> {
  await db.categories.update(id, changes)
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id)
}

// ---------- Settings ----------

export async function updateCurrency(currency: CurrencyCode): Promise<void> {
  await db.settings.update('app', { currency })
}

// ---------- Export / Import ----------

interface BackupPayload {
  version: 1
  exportedAt: string
  transactions: Transaction[]
  debts: Debt[]
  categories: Category[]
  settings: AppSettings[]
}

export async function exportBackup(): Promise<BackupPayload> {
  const [transactions, debts, categories, settings] = await Promise.all([
    db.transactions.toArray(),
    db.debts.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    debts,
    categories,
    settings,
  }
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction('rw', db.transactions, db.debts, db.categories, db.settings, async () => {
    await Promise.all([
      db.transactions.clear(),
      db.debts.clear(),
      db.categories.clear(),
      db.settings.clear(),
    ])
    await Promise.all([
      db.transactions.bulkAdd(payload.transactions ?? []),
      db.debts.bulkAdd(payload.debts ?? []),
      db.categories.bulkAdd(payload.categories ?? []),
      db.settings.bulkAdd(payload.settings ?? []),
    ])
  })
}
