export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  date: string // ISO
  note?: string
  linkedDebtId?: string
}

export type DebtDirection = 'owed_to_me' | 'i_owe'
export type DebtStatus = 'open' | 'partial' | 'closed'

export interface DebtPayment {
  id: string
  amount: number
  date: string // ISO
  note?: string
}

export interface Debt {
  id: string
  direction: DebtDirection
  person: string
  amount: number
  reason?: string
  dateCreated: string // ISO
  dueDate?: string // ISO
  status: DebtStatus
  payments: DebtPayment[]
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
}

export type CurrencyCode = 'USD' | 'KRW' | 'TMT'

export interface AppSettings {
  id: string // fixed key 'app'
  currency: CurrencyCode
}
