import type { CurrencyCode } from '../types'

interface CurrencyMeta {
  label: string
  symbol: string
  decimals: number
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { label: 'Доллар США', symbol: '$', decimals: 2 },
  KRW: { label: 'Вона (Южная Корея)', symbol: '₩', decimals: 0 },
  TMT: { label: 'Манат (Туркменистан)', symbol: 'm.', decimals: 2 },
}

export const CURRENCY_LIST = Object.entries(CURRENCIES).map(([code, meta]) => ({
  code: code as CurrencyCode,
  ...meta,
}))

function groupThousands(value: number, decimals: number): string {
  const fixed = Math.abs(value).toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return decPart ? `${grouped}.${decPart}` : grouped
}

export function formatMoney(amount: number, currency: CurrencyCode, opts?: { sign?: boolean }): string {
  const meta = CURRENCIES[currency]
  const grouped = groupThousands(amount, meta.decimals)
  const sign = opts?.sign ? (amount < 0 ? '−' : amount > 0 ? '+' : '') : amount < 0 ? '−' : ''
  return `${sign}${grouped} ${meta.symbol}`
}

/** Splits a formatted amount into a large "headline" part and a smaller trailing part + symbol, for the balance disc. */
export function splitMoneyForDisc(amount: number, currency: CurrencyCode): { big: string; small: string } {
  const meta = CURRENCIES[currency]
  const grouped = groupThousands(amount, meta.decimals)
  const groups = grouped.split(' ')
  const sign = amount < 0 ? '−' : ''
  const big = sign + groups[0]
  const rest = groups.slice(1).join(' ')
  const small = rest ? `${rest} ${meta.symbol}` : meta.symbol
  return { big, small }
}
