import type { CurrencyCode } from '../types'
import { formatMoney, splitMoneyForDisc } from '../utils/currency'
import styles from './BalanceDisc.module.css'

interface Props {
  balance: number
  balanceWithDebts: number
  currency: CurrencyCode
}

export function BalanceDisc({ balance, balanceWithDebts, currency }: Props) {
  const { big, small } = splitMoneyForDisc(balance, currency)

  return (
    <div className={styles.wrap}>
      <div className={styles.disc}>
        <div className={styles.inner}>
          <div className={styles.label}>Баланс</div>
          <div className={styles.amount}>
            {big} <span>{small}</span>
          </div>
          <div className={styles.sub}>с долгами: {formatMoney(balanceWithDebts, currency)}</div>
        </div>
      </div>
    </div>
  )
}
