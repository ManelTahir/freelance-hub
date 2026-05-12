import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore } from '../store/useStore'

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n || 0)
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function TransactionForm({ tx, onClose, projects, settings }) {
  const { addTransaction, updateTransaction } = useStore()
  const [form, setForm] = useState({
    type: tx?.type || 'income',
    amount: tx?.amount || '',
    description: tx?.description || '',
    date: tx?.date || new Date().toISOString().split('T')[0],
    projectId: tx?.projectId || '',
    category: tx?.category || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (tx) updateTransaction(tx.id, { ...form, amount: parseFloat(form.amount) || 0 })
    else addTransaction({ ...form, amount: parseFloat(form.amount) || 0 })
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{tx ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {['income', 'expense'].map(t => (
            <button key={t} onClick={() => set('type', t)} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: form.type === t ? (t === 'income' ? 'var(--green-bg)' : 'var(--red-bg)') : 'rgba(255,255,255,0.05)',
              color: form.type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--t2)',
            }}>{t === 'income' ? '+ Income' : '− Expense'}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="label">Amount ({settings.currency})</label>
            <input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" min={0} step={0.01} autoFocus />
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this for?" />
          </div>
          <div>
            <label className="label">Category (optional)</label>
            <input className="input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Design, Software" />
          </div>
          <div>
            <label className="label">Project (optional)</label>
            <select className="input" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
              <option value="">No project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function Finances() {
  const { transactions, projects, settings, deleteTransaction } = useStore()
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('date')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const ytd = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [transactions, year])

  const taxReserve = Math.max(0, ytd.balance * ((settings.taxRate || 25) / 100))

  const chartData = useMemo(() => {
    return MONTHS.map((name, m) => ({
      name,
      income: transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === m).reduce((s, t) => s + t.amount, 0),
      expense: transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === m).reduce((s, t) => s + t.amount, 0),
    }))
  }, [transactions, year])

  const filtered = useMemo(() => {
    let txs = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)
    return [...txs].sort((a, b) => {
      if (sort === 'date') return b.date?.localeCompare(a.date)
      if (sort === 'amount') return b.amount - a.amount
      return 0
    })
  }, [transactions, filter, sort])

  const fmt0 = n => fmt(n, settings.currency)

  const TT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--t2)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => <div key={p.dataKey} style={{ color: p.dataKey === 'income' ? 'var(--accent)' : 'var(--t2)' }}>{p.dataKey}: {fmt0(p.value)}</div>)}
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Income & Expenses</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Track revenue & costs with auto tax reserve calc</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ Add Transaction</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Income (YTD)</div><div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(ytd.income)}</div></div>
        <div className="stat-card"><div className="stat-label">Expenses (YTD)</div><div className="stat-value" style={{ color: 'var(--red)' }}>{fmt0(ytd.expense)}</div></div>
        <div className="stat-card"><div className="stat-label">Net Balance</div><div className="stat-value" style={{ color: ytd.balance >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt0(ytd.balance)}</div></div>
        <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
          <div className="stat-label">Tax Reserve ({settings.taxRate || 25}%)</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt0(taxReserve)}</div>
          <div className="stat-sub">set aside from profit</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>Monthly Overview — {year}</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="income" fill="var(--accent)" radius={[3,3,0,0]} maxBarSize={22} />
            <Bar dataKey="expense" fill="var(--t3)" opacity={.6} radius={[3,3,0,0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'income', 'expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: filter === f ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? 'var(--accent)' : 'var(--t2)',
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <select className="input" style={{ maxWidth: 160, padding: '5px 10px', fontSize: 12 }} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date">Sort by date</option>
          <option value="amount">Sort by amount</option>
        </select>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No transactions yet — log your first one.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{tx.date}</td>
                  <td style={{ color: 'var(--t1)', maxWidth: 260 }}>{tx.description || '—'}</td>
                  <td style={{ color: 'var(--t3)' }}>{tx.category || '—'}</td>
                  <td>
                    <span className={`badge ${tx.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                      {tx.type === 'income' ? '+ Income' : '− Expense'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {tx.type === 'income' ? '+' : '−'}{fmt0(tx.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', tx })}>Edit</button>
                      <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => deleteTransaction(tx.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <TransactionForm
          tx={modal.type === 'edit' ? modal.tx : null}
          onClose={() => setModal(null)}
          projects={projects}
          settings={settings}
        />
      )}
    </div>
  )
}
