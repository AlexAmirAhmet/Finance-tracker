import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { CurrencyCode } from '../types'

const FALLBACK_CURRENCY: CurrencyCode = 'USD'

export function useCurrency(): CurrencyCode {
  const settings = useLiveQuery(() => db.settings.get('app'))
  return settings?.currency ?? FALLBACK_CURRENCY
}

export function useCategories(type?: 'income' | 'expense') {
  return useLiveQuery(async () => {
    const all = await db.categories.toArray()
    return type ? all.filter((c) => c.type === type) : all
  }, [type]) ?? []
}

export function useTransactions() {
  return useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) ?? []
}

export function useTransaction(id: string | undefined) {
  return useLiveQuery(() => (id ? db.transactions.get(id) : undefined), [id])
}

export function useDebts(direction?: 'owed_to_me' | 'i_owe') {
  return useLiveQuery(async () => {
    const all = await db.debts.orderBy('dateCreated').reverse().toArray()
    return direction ? all.filter((d) => d.direction === direction) : all
  }, [direction]) ?? []
}

export function useDebt(id: string | undefined) {
  return useLiveQuery(() => (id ? db.debts.get(id) : undefined), [id])
}
