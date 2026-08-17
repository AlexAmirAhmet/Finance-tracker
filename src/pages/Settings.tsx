import { useRef, useState } from 'react'
import { Check, Download, Upload, Pencil, Trash2, Plus, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useCategories, useCurrency } from '../db/hooks'
import { addCategory, deleteCategory, exportBackup, importBackup, updateCategory, updateCurrency } from '../db/repo'
import { CURRENCY_LIST } from '../utils/currency'
import { getCategoryIcon, AVAILABLE_ICON_KEYS } from '../utils/categoryIcons'
import type { CurrencyCode, TransactionType } from '../types'
import styles from './Settings.module.css'

const APP_VERSION = '1.0.0'

export function Settings() {
  const currency = useCurrency()
  const [catTab, setCatTab] = useState<TransactionType>('expense')
  const categories = useCategories(catTab)

  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState(AVAILABLE_ICON_KEYS[0])

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleRename(id: string, current: string) {
    const next = window.prompt('Новое название категории', current)
    if (!next || !next.trim() || next.trim() === current) return
    await updateCategory(id, { name: next.trim() })
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Удалить категорию? Операции с этой категорией останутся, но потеряют иконку/название.')) return
    await deleteCategory(id)
  }

  async function handleAddCategory() {
    if (!newName.trim()) return
    await addCategory({ name: newName.trim(), type: catTab, icon: newIcon })
    setNewName('')
    setNewIcon(AVAILABLE_ICON_KEYS[0])
    setAddOpen(false)
  }

  async function handleExport() {
    const payload = await exportBackup()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Импорт заменит все текущие данные приложения. Продолжить?')) return
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      await importBackup(payload)
      alert('Данные успешно импортированы')
    } catch {
      alert('Не удалось прочитать файл. Убедитесь, что это корректный бэкап.')
    }
  }

  return (
    <>
      <PageHeader title="Настройки" />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Валюта</div>
        <div className={styles.currencyList}>
          {CURRENCY_LIST.map((c) => (
            <button
              key={c.code}
              type="button"
              className={`${styles.currencyRow} raised-sm ${currency === c.code ? styles.currencyRowActive : ''}`}
              onClick={() => updateCurrency(c.code as CurrencyCode)}
            >
              <span>
                <div className={styles.currencyName}>{c.label}</div>
                <div className={styles.currencyCode}>{c.code}</div>
              </span>
              <span className={styles.currencySymbol}>
                {currency === c.code ? <Check size={18} strokeWidth={2.5} /> : c.symbol}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Категории</div>
        <div className={`${styles.tabs} inset`}>
          <button
            type="button"
            className={`${styles.tab} ${catTab === 'expense' ? styles.tabActive : ''}`}
            onClick={() => setCatTab('expense')}
          >
            Расходы
          </button>
          <button
            type="button"
            className={`${styles.tab} ${catTab === 'income' ? styles.tabActive : ''}`}
            onClick={() => setCatTab('income')}
          >
            Доходы
          </button>
        </div>

        <div className={styles.catList}>
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon)
            return (
              <div key={c.id} className={`${styles.catRow} raised-sm`}>
                <span className={styles.catIcon}>
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className={styles.catName}>{c.name}</span>
                <span className={styles.catActions}>
                  <button type="button" className={styles.iconBtn} onClick={() => handleRename(c.id, c.name)}>
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button type="button" className={styles.iconBtn} onClick={() => handleDeleteCategory(c.id)}>
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </span>
              </div>
            )
          })}
        </div>

        {!addOpen && (
          <button type="button" className={`${styles.addCatBtn} raised-sm`} onClick={() => setAddOpen(true)}>
            <Plus size={14} strokeWidth={2.4} style={{ verticalAlign: -2, marginRight: 6 }} />
            Добавить категорию
          </button>
        )}

        {addOpen && (
          <div className={`${styles.addForm} raised`}>
            <div className={`${styles.addFormField} inset`}>
              <input
                className={styles.addFormInput}
                placeholder="Название категории"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.iconGrid}>
              {AVAILABLE_ICON_KEYS.map((key) => {
                const Icon = getCategoryIcon(key)
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.iconOption} ${newIcon === key ? styles.iconOptionActive : ''}`}
                    onClick={() => setNewIcon(key)}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </button>
                )
              })}
            </div>
            <div className={styles.addFormActions}>
              <button type="button" className={styles.addFormCancel} onClick={() => setAddOpen(false)}>
                <X size={14} strokeWidth={2.2} style={{ verticalAlign: -2, marginRight: 4 }} />
                Отмена
              </button>
              <button type="button" className={styles.addFormSave} onClick={handleAddCategory}>
                Сохранить
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Данные</div>
        <div className={styles.dataActions}>
          <button type="button" className={`${styles.dataBtn} raised-sm`} onClick={handleExport}>
            <Download size={16} strokeWidth={2} />
            Экспорт данных в JSON
          </button>
          <button type="button" className={`${styles.dataBtn} raised-sm`} onClick={handleImportClick}>
            <Upload size={16} strokeWidth={2} />
            Импорт данных из JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>О приложении</div>
        <div className={`${styles.appInfo} raised-sm`}>Финансовый трекер · версия {APP_VERSION}</div>
      </div>
    </>
  )
}
