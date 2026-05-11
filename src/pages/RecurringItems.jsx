import { useState } from 'react'
import { useStore } from '../store/useStore'

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n || 0)
}

const FREQ = { monthly: 'Monthly', weekly: 'Weekly', yearly: 'Yearly' }

function RecurringForm({ item, onClose, settings }) {
  const { addRecurringItem, updateRecurringItem } = useStore()
  const [form, setForm] = useState({
    title: item?.title || '',
    type: item?.type || 'expense',
    amount: item?.amount || '',
    frequency: item?.frequency || 'monthly',
    category: item?.category || '',
    dayOfMonth: item?.dayOfMonth || 1,
    active: item?.active ?? true,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (item) updateRecurringItem(item.id, form)
    else addRecurringItem(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{item ? 'Edit Recurring' : 'New Recurring Item'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Adobe Creative Cloud" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income (retainer)</option>
            </select>
          </div>
          <div>
            <label className="label">Amount ({settings.currency})</label>
            <input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="49" min={0} />
          </div>
          <div>
            <label className="label">Frequency</label>
            <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {Object.entries(FREQ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Day of Month</label>
            <input className="input" type="number" value={form.dayOfMonth} onChange={e => set('dayOfMonth', e.target.value)} min={1} max={28} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Software" />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>Active</span>
        </label>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function RecurringItems() {
  const { recurringItems, settings, updateRecurringItem, deleteRecurringItem } = useStore()
  const [modal, setModal] = useState(null)

  const active = recurringItems.filter(r => r.active)
  const monthlyIncome = active.filter(r => r.type === 'income' && r.frequency === 'monthly').reduce((s, r) => s + (r.amount || 0), 0)
  const monthlyExpense = active.filter(r => r.type === 'expense' && r.frequency === 'monthly').reduce((s, r) => s + (r.amount || 0), 0)
  const yearlyTotal = active.reduce((s, r) => {
    const mult = r.frequency === 'monthly' ? 12 : r.frequency === 'weekly' ? 52 : 1
    return s + (r.amount || 0) * mult * (r.type === 'expense' ? -1 : 1)
  }, 0)

  const fmt0 = n => fmt(n, settings.currency)

  const sorted = [...recurringItems].sort((a, b) => {
    if (a.active !== b.active) return b.active - a.active
    return a.title.localeCompare(b.title)
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Recurring Items</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Retainers & subscriptions — income and expenses</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ Add Item</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(monthlyIncome)}</div>
          <div className="stat-sub">recurring retainers</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{fmt0(monthlyExpense)}</div>
          <div className="stat-sub">subscriptions & costs</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net / Year</div>
          <div className="stat-value" style={{ color: yearlyTotal >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt0(Math.abs(yearlyTotal))}</div>
          <div className="stat-sub">{yearlyTotal >= 0 ? 'surplus' : 'deficit'} annualized</div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No recurring items — add subscriptions and retainers.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Frequency</th><th>Day</th><th>Category</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.id} style={{ opacity: r.active ? 1 : .5 }}>
                  <td style={{ fontWeight: 500, color: 'var(--t1)' }}>{r.title}</td>
                  <td>
                    <span className={`badge ${r.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                      {r.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td>{FREQ[r.frequency] || r.frequency}</td>
                  <td style={{ color: 'var(--t3)' }}>{r.frequency === 'monthly' ? `Day ${r.dayOfMonth}` : '—'}</td>
                  <td style={{ color: 'var(--t2)' }}>{r.category || '—'}</td>
                  <td style={{ fontWeight: 600, color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {r.type === 'expense' ? '−' : '+'}{fmt0(r.amount)}
                  </td>
                  <td>
                    <button
                      onClick={() => updateRecurringItem(r.id, { active: !r.active })}
                      className={`badge ${r.active ? 'badge-green' : 'badge-t3'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {r.active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', item: r })}>Edit</button>
                      <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => deleteRecurringItem(r.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <RecurringForm
          item={modal.type === 'edit' ? modal.item : null}
          onClose={() => setModal(null)}
          settings={settings}
        />
      )}
    </div>
  )
}
