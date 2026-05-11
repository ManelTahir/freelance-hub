import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'

const STATUS = {
  draft:   { label: 'Draft',   cls: 'badge-t3' },
  sent:    { label: 'Sent',    cls: 'badge-blue' },
  paid:    { label: 'Paid',    cls: 'badge-green' },
  overdue: { label: 'Overdue', cls: 'badge-red' },
}

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n || 0)
}

function calcTotals(items = [], vatRate = 0) {
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 1) * (parseFloat(i.rate) || 0), 0)
  const vat = subtotal * (vatRate / 100)
  return { subtotal, vat, total: subtotal + vat }
}

function InvoiceForm({ inv, onClose, clients, settings }) {
  const { addInvoice, updateInvoice } = useStore()
  const [form, setForm] = useState({
    clientId: inv?.clientId || '',
    issuedDate: inv?.issuedDate || new Date().toISOString().split('T')[0],
    dueDate: inv?.dueDate || '',
    vatRate: inv?.vatRate ?? settings.vatRate ?? 20,
    notes: inv?.notes || '',
    status: inv?.status || 'draft',
    items: inv?.items?.length ? inv.items : [{ description: '', qty: 1, rate: '' }],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((x, j) => j === i ? { ...x, [k]: v } : x) }))
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: '' }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))

  const { subtotal, vat, total } = calcTotals(form.items, parseFloat(form.vatRate) || 0)

  const save = () => {
    if (inv) updateInvoice(inv.id, form)
    else addInvoice(form)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{inv ? `Edit ${inv.number}` : 'New Invoice'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label className="label">Client</label>
            <select className="input" value={form.clientId} onChange={e => set('clientId', e.target.value)}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Issue Date</label>
            <input className="input" type="date" value={form.issuedDate} onChange={e => set('issuedDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div>
            <label className="label">VAT Rate (%)</label>
            <input className="input" type="number" value={form.vatRate} onChange={e => set('vatRate', e.target.value)} min={0} max={100} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* Line items */}
        <div style={{ marginBottom: 16 }}>
          <label className="label">Line Items</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 32px', gap: 8, alignItems: 'center' }}>
                <input className="input" placeholder="Description" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} />
                <input className="input" placeholder="Qty" type="number" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} min={0} style={{ textAlign: 'center' }} />
                <input className="input" placeholder="Rate (€)" type="number" value={item.rate} onChange={e => setItem(i, 'rate', e.target.value)} min={0} />
                <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 16, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <button className="btn-ghost" onClick={addItem} style={{ marginTop: 8, fontSize: 12 }}>+ Add line</button>
        </div>

        {/* Totals */}
        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, color: 'var(--t2)' }}><span>Subtotal</span><span>{fmt(subtotal, settings.currency)}</span></div>
          <div style={{ display: 'flex', gap: 32, fontSize: 13, color: 'var(--t2)' }}><span>VAT ({form.vatRate}%)</span><span>{fmt(vat, settings.currency)}</span></div>
          <div style={{ display: 'flex', gap: 32, fontSize: 15, fontWeight: 700, color: 'var(--t1)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}><span>Total</span><span>{fmt(total, settings.currency)}</span></div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Thank you for your business." />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Invoice</button>
        </div>
      </div>
    </div>
  )
}

function InvoicePrint({ inv, clients, settings }) {
  const client = clients.find(c => c.id === inv.clientId)
  const { subtotal, vat, total } = calcTotals(inv.items, inv.vatRate || 0)
  const { businessName = '', address = '', iban = '', vatNumber = '', currency = 'EUR' } = settings

  return (
    <div id="invoice-print-area" style={{ fontFamily: 'Arial, sans-serif', color: '#111', fontSize: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>INVOICE</div>
          <div style={{ color: '#666', marginTop: 4 }}>{inv.number}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{businessName}</div>
          {address && <div style={{ color: '#555' }}>{address}</div>}
          {vatNumber && <div style={{ color: '#555' }}>VAT {vatNumber}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#999', marginBottom: 6 }}>Bill To</div>
          <div style={{ fontWeight: 600 }}>{client?.name || '—'}</div>
          {client?.company && <div style={{ color: '#555' }}>{client.company}</div>}
          {client?.email && <div style={{ color: '#555' }}>{client.email}</div>}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#999', marginBottom: 6 }}>Details</div>
          <div>Date: {inv.issuedDate}</div>
          {inv.dueDate && <div>Due: {inv.dueDate}</div>}
          <div style={{ fontWeight: 600, color: inv.status === 'overdue' ? '#e11d48' : '#111' }}>Status: {STATUS[inv.status]?.label}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111' }}>
            <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#777' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#777', width: 60 }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#777', width: 100 }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#777', width: 100 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(inv.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>{item.description}</td>
              <td style={{ textAlign: 'center', padding: '10px 0', color: '#555' }}>{item.qty || 1}</td>
              <td style={{ textAlign: 'right', padding: '10px 0', color: '#555' }}>{fmt((item.rate || 0), currency)}</td>
              <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: 500 }}>{fmt((item.qty || 1) * (item.rate || 0), currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 240 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#555' }}><span>Subtotal</span><span>{fmt(subtotal, currency)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#555' }}><span>VAT ({inv.vatRate || 0}%)</span><span>{fmt(vat, currency)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 6px', fontWeight: 700, fontSize: 16, borderTop: '2px solid #111', marginTop: 4 }}><span>Total Due</span><span>{fmt(total, currency)}</span></div>
        </div>
      </div>

      {iban && (
        <div style={{ marginTop: 32, padding: '14px 16px', background: '#f8f8f8', borderRadius: 8, fontSize: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Payment Details</div>
          <div>IBAN: {iban}</div>
        </div>
      )}
      {inv.notes && <div style={{ marginTop: 20, fontSize: 12, color: '#777', textAlign: 'center' }}>{inv.notes}</div>}
    </div>
  )
}

export default function Invoices() {
  const { invoices, clients, settings, updateInvoice, deleteInvoice } = useStore()
  const [modal, setModal] = useState(null)
  const [printInv, setPrintInv] = useState(null)
  const [filter, setFilter] = useState('all')
  const printRef = useRef()

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)
  const sorted = [...filtered].sort((a, b) => b.createdAt?.localeCompare(a.createdAt))

  const totals = {
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + calcTotals(i.items, i.vatRate).total, 0),
    outstanding: invoices.filter(i => i.status === 'sent').reduce((s, i) => s + calcTotals(i.items, i.vatRate).total, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + calcTotals(i.items, i.vatRate).total, 0),
  }

  const handlePrint = (inv) => {
    setPrintInv(inv)
    setTimeout(() => window.print(), 150)
  }

  const fmt0 = (n) => fmt(n, settings.currency)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      {printInv && <InvoicePrint inv={printInv} clients={clients} settings={settings} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Invoices</h1>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Create, track and print PDF invoices</div>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'new' })}>+ New Invoice</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Paid</div><div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(totals.paid)}</div></div>
        <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value" style={{ color: 'var(--blue)' }}>{fmt0(totals.outstanding)}</div></div>
        <div className="stat-card"><div className="stat-label">Overdue</div><div className="stat-value" style={{ color: 'var(--red)' }}>{fmt0(totals.overdue)}</div></div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['all', 'draft', 'sent', 'paid', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: filter === f ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
            color: filter === f ? 'var(--accent)' : 'var(--t2)',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>No invoices yet — create your first one.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Number</th><th>Client</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(inv => {
                const client = clients.find(c => c.id === inv.clientId)
                const { total } = calcTotals(inv.items, inv.vatRate)
                const s = STATUS[inv.status] || STATUS.draft
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{inv.number}</td>
                    <td>{client?.name || '—'}</td>
                    <td>{inv.issuedDate || '—'}</td>
                    <td style={{ color: inv.status === 'overdue' ? 'var(--red)' : 'var(--t2)' }}>{inv.dueDate || '—'}</td>
                    <td style={{ color: 'var(--t1)', fontWeight: 500 }}>{fmt0(total)}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => handlePrint(inv)}>Print/PDF</button>
                        {inv.status !== 'paid' && (
                          <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11, color: 'var(--green)' }} onClick={() => updateInvoice(inv.id, { status: 'paid', paidDate: new Date().toISOString().split('T')[0] })}>Mark Paid</button>
                        )}
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setModal({ type: 'edit', inv })}>Edit</button>
                        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => deleteInvoice(inv.id)}>Del</button>
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
        <InvoiceForm
          inv={modal.type === 'edit' ? modal.inv : null}
          onClose={() => setModal(null)}
          clients={clients}
          settings={settings}
        />
      )}
    </div>
  )
}
