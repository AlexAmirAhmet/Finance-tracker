import type { Debt } from '../types'

export const DEBT_STATUS_LABEL: Record<Debt['status'], string> = {
  open: 'Открыт',
  partial: 'Частично',
  closed: 'Закрыт',
}
