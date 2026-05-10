import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { useI18n } from '../i18n'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { downloadJSON, downloadCSV, downloadExcel } from '../utils/export'
import { THEMES, ACCENT_ICONS } from '../utils/icons'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD']

export default function Settings() {
  const { t, lang, setLanguage } = useI18n()
  const { settings, updateSettings, exportAll, importAll, resetAll, loadDemoData, clients, projects, transactions } = useStore()

  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const fileRef = useRef()

  const [form, setForm] = useState({
    businessName: settings.businessName || '',
    ownerName: settings.ownerName || '',
    currency: settings.currency || 'EUR',
  })

  const handleSave = (e) => {
    e.preventDefault()
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportJSON = () => {
    downloadJSON(exportAll())
  }

  const handleExportExcel = () => {
    downloadExcel(exportAll())
  }

  const handleExportClientsCSV = () => {
    downloadCSV(
      clients,
      [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'company', label: 'Company' },
        { key: 'status', label: 'Status' },
        { key: 'notes', label: 'Notes' },
      ],
      'clients.csv'
    )
  }

  const handleExportProjectsCSV = () => {
    downloadCSV(
      projects,
      [
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'rate', label: 'Rate' },
        { key: 'currency', label: 'Currency' },
        { key: 'dueDate', label: 'Due Date' },
        { key: 'description', label: 'Description' },
      ],
      'projects.csv'
    )
  }

  const handleExportTransactionsCSV = () => {
    downloadCSV(
      transactions,
      [
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount' },
      ],
      'transactions.csv'
    )
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    setImportSuccess(false)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        importAll(data)
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 3000)
      } catch {
        setImportError(t('settings.importError'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    resetAll()
    setConfirmReset(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">{t('settings.title')}</h1>

      {/* Business info */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">{t('settings.businessInfo')}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.businessName')}</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.ownerName')}</label>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.currency')}</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit">{t('common.save')}</Button>
            {saved && <span className="text-sm text-emerald-600 font-medium">{t('settings.saved')}</span>}
          </div>
        </form>
      </section>

      {/* Language */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">{t('settings.language')}</h2>
        <div className="flex gap-3">
          {['en', 'fr'].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                lang === l
                  ? 'bg-[var(--clr-50)] border-[var(--clr-300)] text-[var(--clr-700)]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{l === 'en' ? '🇬🇧' : '🇫🇷'}</span>
              {l === 'en' ? 'English' : 'Français'}
            </button>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">{t('settings.appearance')}</h2>

        <div className="mb-5">
          <p className="text-sm font-medium text-slate-700 mb-3">{t('settings.themeColor')}</p>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map((th) => (
              <button
                key={th.key}
                onClick={() => updateSettings({ theme: th.key })}
                title={th.key}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  settings.theme === th.key ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: th.color }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">{t('settings.appIcon')}</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(ACCENT_ICONS).map(([key, path]) => (
              <button
                key={key}
                onClick={() => updateSettings({ accentIcon: key })}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-colors ${
                  (settings.accentIcon || 'bolt') === key
                    ? 'border-[var(--clr-600)] bg-[var(--clr-50)]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <svg
                  className={`w-5 h-5 ${(settings.accentIcon || 'bolt') === key ? 'text-[var(--clr-600)]' : 'text-slate-500'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data management */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-1">{t('settings.dataManagement')}</h2>
        <p className="text-xs text-slate-400 mb-5">{t('settings.dataNote')}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.exportExcel')}</p>
              <p className="text-xs text-slate-400">{t('settings.exportExcelDesc')}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportExcel}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('settings.download')}
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.exportJSON')}</p>
              <p className="text-xs text-slate-400">{t('settings.exportJSONDesc')}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportJSON}>{t('settings.download')}</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.exportClientsCSV')}</p>
              <p className="text-xs text-slate-400">{clients.length} {t('nav.clients').toLowerCase()}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportClientsCSV}>{t('settings.download')}</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.exportProjectsCSV')}</p>
              <p className="text-xs text-slate-400">{projects.length} {t('nav.projects').toLowerCase()}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportProjectsCSV}>{t('settings.download')}</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.exportTransactionsCSV')}</p>
              <p className="text-xs text-slate-400">{transactions.length} {t('nav.finances').toLowerCase()}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportTransactionsCSV}>{t('settings.download')}</Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{t('settings.importJSON')}</p>
              <p className="text-xs text-slate-400">{t('settings.importJSONDesc')}</p>
              {importError && <p className="text-xs text-rose-500 mt-1">{importError}</p>}
              {importSuccess && <p className="text-xs text-emerald-600 mt-1">{t('settings.importSuccess')}</p>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>{t('settings.import')}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo data */}
      <section className="bg-white rounded-2xl border border-[var(--clr-100)] shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-[var(--clr-600)] mb-1">{t('settings.demoTitle')}</h2>
        <p className="text-xs text-slate-400 mb-4">{t('settings.demoDesc')}</p>
        <Button variant="secondary" onClick={loadDemoData}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t('settings.demoLoad')}
        </Button>
      </section>

      {/* Danger zone */}
      <section className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-rose-600 mb-1">{t('settings.dangerZone')}</h2>
        <p className="text-xs text-slate-400 mb-4">{t('settings.resetDesc')}</p>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>{t('settings.resetAll')}</Button>
      </section>

      {/* Reset confirm */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title={t('common.confirm')} size="sm">
        <p className="text-slate-600 text-sm mb-6">{t('settings.resetConfirm')}</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={handleReset}>{t('settings.resetAll')}</Button>
          <Button variant="secondary" onClick={() => setConfirmReset(false)}>{t('common.cancel')}</Button>
        </div>
      </Modal>
    </div>
  )
}
