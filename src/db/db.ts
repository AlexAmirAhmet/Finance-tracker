import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Category, Debt, Transaction } from '../types'
import { DEFAULT_CATEGORIES } from './defaultCategories'

class FinanceDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  debts!: EntityTable<Debt, 'id'>
  categories!: EntityTable<Category, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('finance-tracker')

    this.version(1).stores({
      transactions: 'id, type, category, date, linkedDebtId',
      debts: 'id, direction, status, person, dateCreated',
      categories: 'id, type',
      settings: 'id',
    })

    this.on('populate', () => {
      this.categories.bulkAdd(DEFAULT_CATEGORIES)
      this.settings.add({ id: 'app', currency: 'USD' })
    })
  }
}

export const db = new FinanceDB()

export function newId(): string {
  return crypto.randomUUID()
}
