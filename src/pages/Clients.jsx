import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useI18n } from '../i18n'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const STATUSES = ['active', 'inactive', 'prospect']

const emptyForm = { name: '', email: '', phone: '', company: '', status: 'active', notes: '' }

export default function Clients() {
  const { t } = useI18n()
  const { clients, addClient, updateClient, deleteClient } = useStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (client) => { setForm({ ...client }); setEditId(client.id); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) updateClient(editId, form)
    else addClient(form)
    closeModal()
  }

  const handleDelete = (id) => {
    deleteClient(id)
    setConfirmDelete(null)
  }

  const filtered = clients
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{t('clients.title')}</h1>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('clients.addClient')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)] bg-white min-w-[200px]"
        />
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-[var(--clr-600)] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? t('clients.filterAll') : t(`clients.status${s.charAt(0).toUpperCase() + s.slice(1)}`)}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
          {t('clients.noClients')}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['name', 'company', 'email', 'phone', 'status'].map((col) => (
                  <th key={col} className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t(`clients.${col}`)}
                  </th>
                ))}
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{client.name}</td>
                  <td className="px-6 py-4 text-slate-600">{client.company || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{client.email || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{client.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={client.status} label={t(`clients.status${client.status.charAt(0).toUpperCase() + client.status.slice(1)}`)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(client)}>{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setConfirmDelete(client.id)}>
                        {t('common.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editId ? t('clients.editClient') : t('clients.addClient')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { field: 'name', required: true },
            { field: 'email' },
            { field: 'phone' },
            { field: 'company' },
          ].map(({ field, required }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t(`clients.${field}`)} {!required && <span className="text-slate-400 text-xs">({t('common.optional')})</span>}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={form[field] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={required}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('clients.status')}</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`clients.status${s.charAt(0).toUpperCase() + s.slice(1)}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('clients.notes')}</label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{t('common.save')}</Button>
            <Button type="button" variant="secondary" onClick={closeModal}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={t('common.confirm')} size="sm">
        <p className="text-slate-600 text-sm mb-6">{t('clients.deleteConfirm')}</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete)}>{t('common.delete')}</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
        </div>
      </Modal>
    </div>
  )
}
