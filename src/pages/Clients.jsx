import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'

const STATUS_CFG = {
  active:   { label: 'Active',   cls: 'badge-green' },
  inactive: { label: 'Inactive', cls: 'badge-t3' },
  prospect: { label: 'Prospect', cls: 'badge-blue' },
}

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

function healthScore(clientId, transactions, projects) {
  const clientProjects = projects.filter(p => p.clientId === clientId)
  if (clientProjects.length === 0) return 0
  const paidProjects = clientProjects.filter(p => p.status === 'delivered' || p.status === 'paid').length
  const score = Math.round((paidProjects / clientProjects.length) * 100)
  return score
}

function ClientForm({ client, onClose, settings }) {
  const { addClient, updateClient } = useStore()
  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    status: client?.status || 'active',
    notes: client?.notes || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (client) updateClient(client.id, form)
    else addClient(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{client ? 'Edit Client' : 'New Client'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" autoFocus />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+49 170 …" />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company name" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes about this client…" />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Client</button>
        </div>
      </div>
    </div>
  )
}

export default function Clients() {
  const { clients, projects, transactions, settings, deleteClient } = useStore()
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const clientsWithLTV = useMemo(() => {
    return clients.map(c => {
      const cProjects = projects.filter(p => p.clientId === c.id)
      const ltv = transactions.filter(t => {
        const proj = projects.find(p => p.id === t.projectId)
        return t.type === 'income' && proj?.clientId === c.id
      }).reduce((s, t) => s + t.amount, 0) || c.ltv || 0
      const health = healthScore(c.id, transactions, projects)
      return { ...c, ltv, health, projectCount: cProjects.length }
    })
  }, [clients, projects, transactions])

  const filtered = clientsWithLTV.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    totalLTV: clientsWithLTV.reduce((s, c) => s + c.ltv, 0),
  }

  const fmt0 = n => fmt(n, settings.currency)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Clients</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>CRM with health score and lifetime value</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ New Client</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Total Clients</div><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.active}</div></div>
        <div className="stat-card"><div className="stat-label">Total LTV</div><div className="stat-value">{fmt0(stats.totalLTV)}</div></div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'active', 'prospect', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: filterStatus === f ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
              color: filterStatus === f ? 'var(--accent)' : 'var(--t2)',
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>{search ? 'No clients match your search.' : 'No clients yet — add your first one.'}</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Name</th><th>Company</th><th>Status</th><th>Projects</th><th>LTV</th><th>Health</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const s = STATUS_CFG[c.status] || STATUS_CFG.active
                const healthColor = c.health >= 75 ? 'var(--green)' : c.health >= 40 ? 'var(--amber)' : 'var(--red)'
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.name}</div>
                      {c.email && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{c.email}</div>}
                    </td>
                    <td>{c.company || '—'}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td style={{ color: 'var(--t2)' }}>{c.projectCount}</td>
                    <td style={{ fontWeight: 500, color: 'var(--t1)' }}>{fmt0(c.ltv)}</td>
                    <td>
                      {c.projectCount > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 50, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${c.health}%`, height: '100%', background: healthColor, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 11, color: healthColor }}>{c.health}%</span>
                        </div>
                      ) : <span style={{ fontSize: 11, color: 'var(--t3)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', client: c })}>Edit</button>
                        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteClient(c.id) }}>Del</button>
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
        <ClientForm
          client={modal.type === 'edit' ? modal.client : null}
          onClose={() => setModal(null)}
          settings={settings}
        />
      )}
    </div>
  )
}
