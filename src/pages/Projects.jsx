import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { useI18n } from '../i18n'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatCurrency, formatDate } from '../utils/format'

const STATUSES = ['todo', 'in_progress', 'delivered', 'paid']

const emptyForm = {
  title: '',
  description: '',
  clientId: '',
  status: 'todo',
  rate: '',
  currency: 'EUR',
  dueDate: '',
}

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD']

function ProjectCard({ project, clientName, onEdit, onDelete, onStatusChange, t, currency }) {
  const nextStatus = {
    todo: 'in_progress',
    in_progress: 'delivered',
    delivered: 'paid',
    paid: null,
  }
  const next = nextStatus[project.status]

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{project.title}</p>
        <Badge
          variant={project.status}
          label={t(`projects.status${project.status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
        />
      </div>

      {clientName && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {clientName}
        </p>
      )}

      {project.rate && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatCurrency(project.rate, project.currency || currency)}
        </p>
      )}

      {project.dueDate && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(project.dueDate)}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        {next && (
          <button
            onClick={() => onStatusChange(project.id, next)}
            className="flex-1 text-xs bg-[var(--clr-50)] text-[var(--clr-700)] hover:bg-[var(--clr-100)] font-medium px-2 py-1.5 rounded-lg transition-colors text-center"
          >
            → {t(`projects.status${next.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
          </button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
          {t('common.edit')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => onDelete(project.id)}
        >
          {t('common.delete')}
        </Button>
      </div>
    </div>
  )
}

export default function Projects() {
  const { t } = useI18n()
  const { clients, projects, addProject, updateProject, deleteProject, settings } = useStore()
  const currency = settings.currency || 'EUR'

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  const openAdd = () => { setForm({ ...emptyForm, currency }); setEditId(null); setModalOpen(true) }
  const openEdit = (project) => { setForm({ ...project }); setEditId(project.id); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const data = { ...form, rate: form.rate ? Number(form.rate) : '' }
    if (editId) updateProject(editId, data)
    else addProject(data)
    closeModal()
  }

  const handleDelete = (id) => {
    deleteProject(id)
    setConfirmDelete(null)
  }

  const handleStatusChange = (id, newStatus) => {
    updateProject(id, { status: newStatus })
  }

  const clientMap = useMemo(() => {
    const map = {}
    clients.forEach((c) => { map[c.id] = c.name })
    return map
  }, [clients])

  const filtered = useMemo(() =>
    projects.filter((p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (clientMap[p.clientId] || '').toLowerCase().includes(search.toLowerCase())
    ),
    [projects, search, clientMap]
  )

  const columns = STATUSES.map((status) => ({
    status,
    label: t(`projects.status${status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`),
    items: filtered.filter((p) => p.status === status),
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{t('projects.title')}</h1>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('projects.addProject')}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)] bg-white min-w-[260px]"
        />
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(({ status, label, items }) => (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h2>
              <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[120px]">
              {items.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                  {t('projects.noProjects')}
                </div>
              ) : (
                items.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    clientName={clientMap[project.clientId]}
                    onEdit={openEdit}
                    onDelete={(id) => setConfirmDelete(id)}
                    onStatusChange={handleStatusChange}
                    t={t}
                    currency={currency}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editId ? t('projects.editProject') : t('projects.addProject')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('projects.projectTitle')}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('projects.client')} <span className="text-slate-400 text-xs">({t('common.optional')})</span>
            </label>
            <select
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            >
              <option value="">— {t('projects.noClient')} —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('projects.status')}</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`projects.status${s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('projects.rate')} <span className="text-slate-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.rate}
                onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('projects.currency')}</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('projects.dueDate')} <span className="text-slate-400 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('projects.description')} <span className="text-slate-400 text-xs">({t('common.optional')})</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
        <p className="text-slate-600 text-sm mb-6">{t('projects.deleteConfirm')}</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete)}>{t('common.delete')}</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
        </div>
      </Modal>
    </div>
  )
}
