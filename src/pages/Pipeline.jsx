import { useState } from 'react'
import { useStore } from '../store/useStore'

const STAGES = [
  { key: 'lead',        label: 'Lead',        color: 'var(--t3)' },
  { key: 'proposal',   label: 'Proposal',    color: 'var(--blue)' },
  { key: 'negotiation',label: 'Negotiation', color: 'var(--amber)' },
  { key: 'won',        label: 'Won',         color: 'var(--green)' },
]

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

function DealForm({ deal, onClose, clients, settings }) {
  const { addDeal, updateDeal } = useStore()
  const [form, setForm] = useState({
    clientId: deal?.clientId || '',
    title: deal?.title || '',
    value: deal?.value || '',
    probability: deal?.probability ?? 50,
    stage: deal?.stage || 'lead',
    notes: deal?.notes || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const weighted = (parseFloat(form.value) || 0) * (parseFloat(form.probability) || 0) / 100

  const save = () => {
    if (deal) updateDeal(deal.id, form)
    else addDeal(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{deal ? 'Edit Deal' : 'New Deal'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Deal Title</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Website Redesign" />
          </div>
          <div>
            <label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={e => set('clientId', e.target.value)}>
              <option value="">No client yet</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="input" value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Deal Value ({settings.currency})</label>
            <input className="input" type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="5000" min={0} />
          </div>
          <div>
            <label className="label">Probability (%)</label>
            <input className="input" type="number" value={form.probability} onChange={e => set('probability', e.target.value)} min={0} max={100} />
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>Weighted value</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber)' }}>{fmt(weighted, settings.currency)}</span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes about this deal…" />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Deal</button>
        </div>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const { deals, clients, settings, updateDeal, deleteDeal } = useStore()
  const [modal, setModal] = useState(null)

  const totalWeighted = deals.filter(d => d.stage !== 'won').reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0)
  const totalWon = deals.filter(d => d.stage === 'won').reduce((s, d) => s + (d.value || 0), 0)
  const fmt0 = n => fmt(n, settings.currency)

  const handleDragStart = (e, dealId) => e.dataTransfer.setData('dealId', dealId)
  const handleDrop = (e, stage) => {
    const id = e.dataTransfer.getData('dealId')
    if (id) updateDeal(id, { stage })
    e.preventDefault()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Pipeline</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Drag & drop deals from lead to closed won</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ New Deal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Pipeline (weighted)</div><div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt0(totalWeighted)}</div></div>
        <div className="stat-card"><div className="stat-label">Won</div><div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(totalWon)}</div></div>
        <div className="stat-card"><div className="stat-label">Open Deals</div><div className="stat-value">{deals.filter(d => d.stage !== 'won').length}</div></div>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.key)
          const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0)

          return (
            <div key={stage.key}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, stage.key)}
              style={{ minHeight: 200 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: stage.color }}>{stage.label}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>{stageDeals.length}</span>
              </div>

              {stageTotal > 0 && (
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 8 }}>{fmt0(stageTotal)} weighted</div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageDeals.map(deal => {
                  const client = clients.find(c => c.id === deal.clientId)
                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={e => handleDragStart(e, deal.id)}
                      className="card2"
                      style={{ padding: '12px 14px', cursor: 'grab', userSelect: 'none' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>{deal.title}</div>
                      {client && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{client.name}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{fmt0(deal.value || 0)}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{deal.probability}%</div>
                      </div>
                      {deal.notes && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6, borderTop: '1px solid var(--border2)', paddingTop: 6 }}>{deal.notes}</div>}
                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        <button className="btn-ghost" style={{ flex: 1, padding: '3px 0', fontSize: 10, textAlign: 'center' }} onClick={() => setModal({ type: 'edit', deal })}>Edit</button>
                        <button className="btn-danger" style={{ padding: '3px 8px', fontSize: 10 }} onClick={() => deleteDeal(deal.id)}>✕</button>
                      </div>
                    </div>
                  )
                })}
                {stageDeals.length === 0 && (
                  <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 10px', textAlign: 'center', fontSize: 12, color: 'var(--t3)' }}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <DealForm
          deal={modal.type === 'edit' ? modal.deal : null}
          onClose={() => setModal(null)}
          clients={clients}
          settings={settings}
        />
      )}
    </div>
  )
}
