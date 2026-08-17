import type { Category } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'income-salary', name: 'Зарплата', type: 'income', icon: 'briefcase' },
  { id: 'income-side', name: 'Подработка', type: 'income', icon: 'hammer' },
  { id: 'income-debt-return', name: 'Возврат долга', type: 'income', icon: 'hand-coins' },
  { id: 'income-other', name: 'Другое', type: 'income', icon: 'sparkles' },

  { id: 'expense-food', name: 'Еда', type: 'expense', icon: 'shopping-cart' },
  { id: 'expense-transport', name: 'Транспорт', type: 'expense', icon: 'car' },
  { id: 'expense-housing', name: 'Жильё', type: 'expense', icon: 'home' },
  { id: 'expense-fun', name: 'Развлечения', type: 'expense', icon: 'party-popper' },
  { id: 'expense-health', name: 'Здоровье', type: 'expense', icon: 'heart-pulse' },
  { id: 'expense-debt-payment', name: 'Погашение долга', type: 'expense', icon: 'hand-coins' },
  { id: 'expense-other', name: 'Другое', type: 'expense', icon: 'more-horizontal' },
]

export const DEBT_INCOME_CATEGORY_ID = 'income-debt-return'
export const DEBT_EXPENSE_CATEGORY_ID = 'expense-debt-payment'
