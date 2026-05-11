import { useState } from 'react'
import { useStore } from '../store/useStore'

const STATUS_CFG = {
  todo:        { label: 'To Do',      cls: 'badge-t3' },
  in_progress: { label: 'In Progress',cls: 'badge-blue' },
  delivered:   { label: 'Delivered',  cls: 'badge-purple' },
  paid:        { label: 'Paid',       cls: 'badge-green' },
}

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

function ProjectForm({ project, onClose, clients, settings }) {
  const { addProject, updateProject } = useStore()
  const [form, setForm] = useState({
    title: project?.title || '',
    clientId: project?.clientId || '',
    status: project?.status || 'todo',
    rate: project?.rate || '',
    dueDate: project?.dueDate || '',
    progress: project?.progress ?? 0,
    description: project?.description || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    if (project) updateProject(project.id, form)
    else addProject(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{project ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Project Title</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Website Redesign" autoFocus />
          </div>
          <div>
            <label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={e => set('clientId', e.target.value)}>
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Budget ({settings.currency})</label>
            <input className="input" type="number" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="5000" min={0} />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Progress ({form.progress}%)</label>
            <input type="range" min={0} max={100} value={form.progress} onChange={e => set('progress', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Scope, deliverables…" />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Project</button>
        </div>
      </div>
    </div>
  )
}

const KANBAN_COLS = ['todo', 'in_progress', 'delivered', 'paid']

export default function Projects() {
  const { projects, clients, settings, updateProject, deleteProject } = useStore()
  const [modal, setModal] = useState(null)
  const [view, setView] = useState('kanban')

  const fmt0 = n => fmt(n, settings.currency)

  const handleDragStart = (e, id) => e.dataTransfer.setData('pid', id)
  const handleDrop = (e, status) => {
    const id = e.dataTransfer.getData('pid')
    if (id) updateProject(id, { status })
    e.preventDefault()
  }

  const stats = {
    active: projects.filter(p => p.status === 'in_progress').length,
    total: projects.length,
    revenue: projects.filter(p => p.status === 'paid').reduce((s, p) => s + (p.rate || 0), 0),
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Projects</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Deadlines, progress bars and client filters</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => setView(v => v === 'kanban' ? 'list' : 'kanban')} style={{ fontSize: 12 }}>
            {view === 'kanban' ? '☰ List' : '⊞ Board'}
          </button>
          <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ New Project</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.active}</div></div>
        <div className="stat-card"><div className="stat-label">Total Projects</div><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><div className="stat-label">Revenue (Paid)</div><div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(stats.revenue)}</div></div>
      </div>

      {view === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {KANBAN_COLS.map(status => {
            const col = projects.filter(p => p.status === status)
            const s = STATUS_CFG[status]
            return (
              <div key={status}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, status)}
                style={{ minHeight: 200 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>{col.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.map(p => {
                    const client = clients.find(c => c.id === p.clientId)
                    const overdue = p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'paid'
                    return (
                      <div key={p.id} draggable onDragStart={e => handleDragStart(e, p.id)}
                        className="card2" style={{ padding: '12px 14px', cursor: 'grab', userSelect: 'none' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 3 }}>{p.title}</div>
                        {client && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{client.name}</div>}
                        {typeof p.progress === 'number' && (
                          <div style={{ marginBottom: 8 }}>
                            <div className="progress-track"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                            <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2, textAlign: 'right' }}>{p.progress}%</div>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {p.rate ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{fmt0(p.rate)}</span> : <span />}
                          {p.dueDate && <span style={{ fontSize: 10, color: overdue ? 'var(--red)' : 'var(--t3)' }}>{overdue ? '⚠ ' : ''}{p.dueDate}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                          <button className="btn-ghost" style={{ flex: 1, padding: '3px 0', fontSize: 10, textAlign: 'center' }} onClick={() => setModal({ type: 'edit', project: p })}>Edit</button>
                          <button className="btn-danger" style={{ padding: '3px 8px', fontSize: 10 }} onClick={() => { if (confirm('Delete?')) deleteProject(p.id) }}>✕</button>
                        </div>
                      </div>
                    )
                  })}
                  {col.length === 0 && (
                    <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 10px', textAlign: 'center', fontSize: 12, color: 'var(--t3)' }}>Drop here</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {projects.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No projects yet.</div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Budget</th><th>Progress</th><th>Deadline</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {projects.map(p => {
                  const client = clients.find(c => c.id === p.clientId)
                  const s = STATUS_CFG[p.status] || STATUS_CFG.todo
                  const overdue = p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'paid'
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{p.title}</td>
                      <td>{client?.name || '—'}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>{p.rate ? fmt0(p.rate) : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'var(--green)', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td style={{ color: overdue ? 'var(--red)' : 'var(--t2)' }}>{p.dueDate || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', project: p })}>Edit</button>
                          <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { if (confirm('Delete?')) deleteProject(p.id) }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <ProjectForm
          project={modal.type === 'edit' ? modal.project : null}
          onClose={() => setModal(null)}
          clients={clients}
          settings={settings}
        />
      )}
    </div>
  )
}
