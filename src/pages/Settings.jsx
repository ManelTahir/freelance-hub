import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'
import { downloadJSON } from '../utils/export'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD']
const THEMES = ['indigo', 'violet', 'emerald', 'rose', 'amber', 'sky']
const THEME_COLORS = { indigo: '#6366f1', violet: '#8b5cf6', emerald: '#10b981', rose: '#f43f5e', amber: '#f59e0b', sky: '#0ea5e9' }

export default function Settings() {
  const { settings, updateSettings, resetAll, loadDemoData, exportAll, importAll } = useStore()
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  const [form, setForm] = useState({ ...settings })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = exportAll()
    downloadJSON(data, `freelancehub-backup-${new Date().toISOString().split('T')[0]}.json`)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        importAll(data)
        alert('Data imported successfully!')
      } catch { alert('Invalid backup file.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Settings</h1>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Business info, appearance & data management</div>
      </div>

      {/* Business Info */}
      <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Business Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label className="label">Your Name</label>
            <input className="input" value={form.ownerName || ''} onChange={e => set('ownerName', e.target.value)} placeholder="Alex Rivera" />
          </div>
          <div>
            <label className="label">Business Name</label>
            <input className="input" value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="Alex Rivera Studio" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Address (appears on invoices)</label>
            <input className="input" value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Mainstr. 32, Berlin" />
          </div>
          <div>
            <label className="label">IBAN (appears on invoices)</label>
            <input className="input" value={form.iban || ''} onChange={e => set('iban', e.target.value)} placeholder="DE89 3704 0044 …" />
          </div>
          <div>
            <label className="label">BIC / SWIFT</label>
            <input className="input" value={form.bic || ''} onChange={e => set('bic', e.target.value)} placeholder="SSKMDEMMXXX" />
          </div>
          <div>
            <label className="label">VAT Number (Ust-IdNr.)</label>
            <input className="input" value={form.vatNumber || ''} onChange={e => set('vatNumber', e.target.value)} placeholder="DE123456789" />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="www.myfreelance.com" />
          </div>
        </div>
      </div>

      {/* Finance settings */}
      <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Finance Settings</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency || 'EUR'} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Default VAT Rate (%)</label>
            <input className="input" type="number" value={form.vatRate ?? 20} onChange={e => set('vatRate', parseFloat(e.target.value) || 0)} min={0} max={100} />
          </div>
          <div>
            <label className="label">Tax Rate for reserve (%)</label>
            <input className="input" type="number" value={form.taxRate ?? 25} onChange={e => set('taxRate', parseFloat(e.target.value) || 0)} min={0} max={100} />
          </div>
          <div>
            <label className="label">Monthly Income Goal ({form.currency || 'EUR'})</label>
            <input className="input" type="number" value={form.monthlyGoal || 5000} onChange={e => set('monthlyGoal', parseFloat(e.target.value) || 0)} min={0} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Accent Color</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {THEMES.map(t => (
            <button key={t} onClick={() => { set('theme', t); updateSettings({ theme: t }) }} style={{
              width: 32, height: 32, borderRadius: 8, border: form.theme === t ? `2px solid white` : '2px solid transparent',
              background: THEME_COLORS[t], cursor: 'pointer', outline: form.theme === t ? '2px solid rgba(255,255,255,0.3)' : 'none',
              outlineOffset: 2,
            }} title={t} />
          ))}
        </div>
      </div>

      {/* Save */}
      <button className="btn-primary" onClick={save} style={{ marginBottom: 24, width: '100%', padding: '11px' }}>
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>

      {/* Data management */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 18 }}>Data & Backup</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={handleExport} style={{ flex: 1 }}>⬇ Export backup (JSON)</button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>⬆ Import backup</button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </div>
          <button className="btn-ghost" onClick={() => { loadDemoData(); alert('Demo data loaded!') }} style={{ width: '100%' }}>
            Load Demo Data
          </button>
          <button className="btn-danger" onClick={() => { if (confirm('This will delete ALL your data. Are you sure?')) resetAll() }} style={{ width: '100%' }}>
            Reset All Data
          </button>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
          All data is stored locally in your browser. Export a JSON backup regularly to keep your data safe and transfer between devices.
        </div>
      </div>
    </div>
  )
}
