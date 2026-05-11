import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

function EntryForm({ entry, onClose, projects, clients, settings }) {
  const { addTimeEntry, updateTimeEntry } = useStore()
  const [form, setForm] = useState({
    projectId: entry?.projectId || '',
    clientId: entry?.clientId || '',
    date: entry?.date || new Date().toISOString().split('T')[0],
    hours: entry?.hours || '',
    rate: entry?.rate || settings.defaultRate || 85,
    description: entry?.description || '',
    billed: entry?.billed || false,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const earnings = (parseFloat(form.hours) || 0) * (parseFloat(form.rate) || 0)

  const handleProjectChange = (pid) => {
    const proj = projects.find(p => p.id === pid)
    set('projectId', pid)
    if (proj?.clientId) set('clientId', proj.clientId)
  }

  const save = () => {
    if (entry) updateTimeEntry(entry.id, form)
    else addTimeEntry(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{entry ? 'Edit Entry' : 'Log Time'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label className="label">Project</label>
            <select className="input" value={form.projectId} onChange={e => handleProjectChange(e.target.value)}>
              <option value="">No project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={e => set('clientId', e.target.value)}>
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="label">Hours</label>
            <input className="input" type="number" placeholder="e.g. 2.5" value={form.hours} onChange={e => set('hours', e.target.value)} step={0.25} min={0} />
          </div>
          <div>
            <label className="label">Hourly Rate ({settings.currency})</label>
            <input className="input" type="number" value={form.rate} onChange={e => set('rate', e.target.value)} min={0} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 4 }}>Earnings</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{fmt(earnings, settings.currency)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Description</label>
          <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What did you work on?" />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={form.billed} onChange={e => set('billed', e.target.checked)} />
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>Mark as billed</span>
        </label>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function TimeTracking() {
  const { timeEntries, projects, clients, settings, deleteTimeEntry, updateTimeEntry } = useStore()
  const [modal, setModal] = useState(null)
  const [filterBilled, setFilterBilled] = useState('all')

  const sorted = [...timeEntries].sort((a, b) => b.date?.localeCompare(a.date))
  const filtered = filterBilled === 'all' ? sorted : sorted.filter(e => filterBilled === 'billed' ? e.billed : !e.billed)

  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = useMemo(() => {
    const totalHours = timeEntries.reduce((s, e) => s + (e.hours || 0), 0)
    const totalEarnings = timeEntries.reduce((s, e) => s + (e.hours || 0) * (e.rate || 0), 0)
    const weekHours = timeEntries.filter(e => new Date(e.date) >= weekStart).reduce((s, e) => s + (e.hours || 0), 0)
    const unbilledEarnings = timeEntries.filter(e => !e.billed).reduce((s, e) => s + (e.hours || 0) * (e.rate || 0), 0)
    return { totalHours, totalEarnings, weekHours, unbilledEarnings }
  }, [timeEntries])

  const fmt0 = n => fmt(n, settings.currency)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Time Tracking</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Log hours, set rates, track billable earnings</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ Log Time</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">This Week</div><div className="stat-value">{stats.weekHours.toFixed(1)}h</div></div>
        <div className="stat-card"><div className="stat-label">Total Hours</div><div className="stat-value">{stats.totalHours.toFixed(1)}h</div></div>
        <div className="stat-card"><div className="stat-label">Total Earnings</div><div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(stats.totalEarnings)}</div></div>
        <div className="stat-card"><div className="stat-label">Unbilled</div><div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt0(stats.unbilledEarnings)}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['all', 'unbilled', 'billed'].map(f => (
          <button key={f} onClick={() => setFilterBilled(f)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: filterBilled === f ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
            color: filterBilled === f ? 'var(--accent)' : 'var(--t2)',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No time entries yet — log your first session.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>Project</th><th>Description</th><th>Hours</th><th>Rate</th><th>Earnings</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const proj = projects.find(p => p.id === e.projectId)
                const client = clients.find(c => c.id === (e.clientId || proj?.clientId))
                const earnings = (e.hours || 0) * (e.rate || 0)
                return (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td>
                      <div style={{ color: 'var(--t1)', fontWeight: 500 }}>{proj?.title || '—'}</div>
                      {client && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{client.name}</div>}
                    </td>
                    <td style={{ maxWidth: 200, color: 'var(--t2)' }}>{e.description || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{(e.hours || 0).toFixed(1)}h</td>
                    <td style={{ color: 'var(--t2)' }}>{fmt(e.rate || 0, settings.currency)}/h</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>{fmt(earnings, settings.currency)}</td>
                    <td>
                      <button
                        onClick={() => updateTimeEntry(e.id, { billed: !e.billed })}
                        className={`badge ${e.billed ? 'badge-green' : 'badge-amber'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {e.billed ? 'Billed' : 'Unbilled'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', entry: e })}>Edit</button>
                        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => deleteTimeEntry(e.id)}>Del</button>
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
        <EntryForm
          entry={modal.type === 'edit' ? modal.entry : null}
          onClose={() => setModal(null)}
          projects={projects}
          clients={clients}
          settings={settings}
        />
      )}
    </div>
  )
}
