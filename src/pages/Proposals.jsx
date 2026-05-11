import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'

const STATUS = {
  draft:  { label: 'Draft', cls: 'badge-t3' },
  sent:   { label: 'Sent',  cls: 'badge-blue' },
  won:    { label: 'Won',   cls: 'badge-green' },
  lost:   { label: 'Lost',  cls: 'badge-red' },
}

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

function calcTotal(items = [], vatRate = 0) {
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 1) * (parseFloat(i.rate) || 0), 0)
  return { subtotal, vat: subtotal * vatRate / 100, total: subtotal * (1 + vatRate / 100) }
}

function ProposalForm({ pro, onClose, clients, settings }) {
  const { addProposal, updateProposal } = useStore()
  const [form, setForm] = useState({
    clientId: pro?.clientId || '',
    title: pro?.title || '',
    sentDate: pro?.sentDate || '',
    vatRate: pro?.vatRate ?? settings.vatRate ?? 20,
    notes: pro?.notes || '',
    status: pro?.status || 'draft',
    items: pro?.items?.length ? pro.items : [{ description: '', qty: 1, rate: '' }],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((x, j) => j === i ? { ...x, [k]: v } : x) }))
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: '' }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))

  const { subtotal, vat, total } = calcTotal(form.items, parseFloat(form.vatRate) || 0)

  const save = () => {
    if (pro) updateProposal(pro.id, form)
    else addProposal(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{pro ? 'Edit Proposal' : 'New Proposal'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={e => set('clientId', e.target.value)}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Title / Project Name</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Brand Identity Package" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sent Date</label>
            <input className="input" type="date" value={form.sentDate} onChange={e => set('sentDate', e.target.value)} />
          </div>
          <div>
            <label className="label">VAT Rate (%)</label>
            <input className="input" type="number" value={form.vatRate} onChange={e => set('vatRate', e.target.value)} min={0} max={100} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Line Items</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 30px', gap: 8, alignItems: 'center' }}>
                <input className="input" placeholder="Description" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} />
                <input className="input" placeholder="Qty" type="number" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} min={0} style={{ textAlign: 'center' }} />
                <input className="input" placeholder="Rate" type="number" value={item.rate} onChange={e => setItem(i, 'rate', e.target.value)} min={0} />
                <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
            ))}
          </div>
          <button className="btn-ghost" onClick={addItem} style={{ marginTop: 8, fontSize: 12 }}>+ Add line</button>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, color: 'var(--t2)' }}><span>Subtotal</span><span>{fmt(subtotal, settings.currency)}</span></div>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, color: 'var(--t2)' }}><span>VAT ({form.vatRate}%)</span><span>{fmt(vat, settings.currency)}</span></div>
          <div style={{ display: 'flex', gap: 32, fontSize: 15, fontWeight: 700, color: 'var(--t1)', borderTop: '1px solid var(--border)', paddingTop: 8 }}><span>Total</span><span>{fmt(total, settings.currency)}</span></div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Notes / Terms</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Valid for 30 days." />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Proposal</button>
        </div>
      </div>
    </div>
  )
}

export default function Proposals() {
  const { proposals, clients, settings, deleteProposal, convertProposalToInvoice, updateProposal } = useStore()
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter)
  const sorted = [...filtered].sort((a, b) => b.createdAt?.localeCompare(a.createdAt))

  const stats = useMemo(() => {
    const sent = proposals.filter(p => p.status !== 'draft')
    const won = proposals.filter(p => p.status === 'won')
    const winRate = sent.length > 0 ? Math.round((won.length / sent.length) * 100) : 0
    const pipeline = proposals.filter(p => p.status === 'sent').reduce((s, p) => s + calcTotal(p.items, p.vatRate).total, 0)
    return { winRate, pipeline, wonTotal: won.reduce((s, p) => s + calcTotal(p.items, p.vatRate).total, 0) }
  }, [proposals])

  const fmt0 = n => fmt(n, settings.currency)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Proposals</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Write quotes, track wins, convert to invoice in 1 click</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ New Proposal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.winRate}%</div>
          <div className="stat-sub">of sent proposals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pipeline</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt0(stats.pipeline)}</div>
          <div className="stat-sub">open proposals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won</div>
          <div className="stat-value">{fmt0(stats.wonTotal)}</div>
          <div className="stat-sub">{proposals.filter(p => p.status === 'won').length} proposals</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['all', 'draft', 'sent', 'won', 'lost'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: filter === f ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
            color: filter === f ? 'var(--accent)' : 'var(--t2)',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No proposals yet — create your first quote.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Number</th><th>Title</th><th>Client</th><th>Sent</th><th>Total</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {sorted.map(pro => {
                const client = clients.find(c => c.id === pro.clientId)
                const { total } = calcTotal(pro.items, pro.vatRate)
                const s = STATUS[pro.status] || STATUS.draft
                return (
                  <tr key={pro.id}>
                    <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{pro.number}</td>
                    <td style={{ color: 'var(--t1)' }}>{pro.title || '—'}</td>
                    <td>{client?.name || '—'}</td>
                    <td>{pro.sentDate || '—'}</td>
                    <td style={{ fontWeight: 500, color: 'var(--t1)' }}>{fmt0(total)}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {pro.status === 'sent' && !pro.convertedToInvoiceId && (
                          <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11, color: 'var(--green)' }} onClick={() => { convertProposalToInvoice(pro.id) }}>→ Invoice</button>
                        )}
                        {pro.status === 'draft' && (
                          <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => updateProposal(pro.id, { status: 'sent', sentDate: new Date().toISOString().split('T')[0] })}>Send</button>
                        )}
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', pro })}>Edit</button>
                        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => deleteProposal(pro.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ProposalForm
          pro={modal.type === 'edit' ? modal.pro : null}
          onClose={() => setModal(null)}
          clients={clients}
          settings={settings}
        />
      )}
    </div>
  )
}
