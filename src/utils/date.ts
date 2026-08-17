const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

export function todayISO(): string {
  return new Date().toISOString()
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function formatRelativeDateTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  if (isSameDay(date, now)) return `Сегодня, ${time}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) return `Вчера, ${time}`

  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDateInput(iso: string): string {
  const date = new Date(iso)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function dateInputToISO(value: string): string {
  // value: 'YYYY-MM-DD' from <input type="date">, keep current time-of-day if editing "today"
  const now = new Date()
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, now.getHours(), now.getMinutes(), now.getSeconds())
  return date.toISOString()
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isWithinPeriod(iso: string, period: 'day' | 'week' | 'month' | 'all'): boolean {
  if (period === 'all') return true
  const date = new Date(iso)
  const now = new Date()

  if (period === 'day') return isSameDay(date, now)

  if (period === 'week') {
    const start = startOfDay(now)
    const day = start.getDay() === 0 ? 7 : start.getDay() // Monday-start week
    start.setDate(start.getDate() - (day - 1))
    return date >= start
  }

  // month
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}
