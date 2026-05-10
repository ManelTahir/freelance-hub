import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '../store/useStore'
import { useI18n } from '../i18n'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatCurrency, formatDate, monthKey, monthLabel, last6Months } from '../utils/format'

const emptyForm = {
  type: 'income',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  projectId: '',
}

export default function Finances() {
  const { t } = useI18n()
  const { transactions, projects, addTransaction, updateTransaction, deleteTransaction, settings } = useStore()
  const currency = settings.currency || 'EUR'

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const openAdd = (type = 'income') => {
    setForm({ ...emptyForm, type, date: new Date().toISOString().slice(0, 10) })
    setEditId(null)
    setModalOpen(true)
  }
  const openEdit = (tx) => { setForm({ ...tx }); setEditId(tx.id); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || !form.description.trim()) return
    const data = { ...form, amount: Number(form.amount) }
    if (editId) updateTransaction(editId, data)
    else addTransaction(data)
    closeModal()
  }

  const handleDelete = (id) => {
    deleteTransaction(id)
    setConfirmDelete(null)
  }

  const projectMap = useMemo(() => {
    const map = {}
    projects.forEach((p) => { map[p.id] = p.title })
    return map
  }, [projects])

  const filtered = useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((tx) => filter === 'all' || tx.type === filter)
      .filter((tx) =>
        !search ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        (projectMap[tx.projectId] || '').toLowerCase().includes(search.toLowerCase())
      ),
    [transactions, filter, search, projectMap]
  )

  const stats = useMemo(() => {
    const totalIncome = transactions.filter((tx) => tx.type === 'income').reduce((s, tx) => s + Number(tx.amount), 0)
    const totalExpense = transactions.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amount), 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }, [transactions])

  const chartData = useMemo(() => {
    const months = last6Months()
    return months.map((m) => {
      const income = transactions
        .filter((tx) => tx.type === 'income' && monthKey(tx.date) === m)
        .reduce((s, tx) => s + Number(tx.amount), 0)
      const expense = transactions
        .filter((tx) => tx.type === 'expense' && monthKey(tx.date) === m)
        .reduce((s, tx) => s + Number(tx.amount), 0)
      return { month: monthLabel(m), income, expense }
    })
  }, [transactions])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{t('finances.title')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openAdd('expense')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            {t('finances.addExpense')}
          </Button>
          <Button onClick={() => openAdd('income')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('finances.addIncome')}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">{t('finances.totalIncome')}</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalIncome, currency)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">{t('finances.totalExpenses')}</p>
          <p className="text-2xl font-bold text-rose-500">{formatCurrency(stats.totalExpense, currency)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">{t('finances.balance')}</p>
          <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-slate-800' : 'text-rose-500'}`}>
            {formatCurrency(stats.balance, currency)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
        <h2 className="text-base font-semibold text-slate-700 mb-6">{t('dashboard.incomeOverview')}</h2>
        {chartData.some((d) => d.income > 0 || d.expense > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={16} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                formatter={(v) => formatCurrency(v, currency)}
              />
              <Bar dataKey="income" fill="#4F46E5" radius={[4, 4, 0, 0]} name={t('finances.income')} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name={t('finances.expense')} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            {t('dashboard.noTransactions')}
          </div>
        )}
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
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-[var(--clr-600)] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? t('clients.filterAll') : t(`finances.${f}`)}
          </button>
        ))}
      </div>

      {/* Transactions table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
          {t('finances.noTransactions')}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('finances.date')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('finances.description')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('finances.project')}</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('finances.type')}</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('finances.amount')}</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{tx.description}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{projectMap[tx.projectId] || '—'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={tx.type} label={t(`finances.${tx.type}`)} />
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(tx)}>{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setConfirmDelete(tx.id)}>
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
      <Modal open={modalOpen} onClose={closeModal} title={editId ? t('finances.editTransaction') : t('finances.addTransaction')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('finances.type')}</label>
            <div className="flex gap-2">
              {['income', 'expense'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    form.type === type
                      ? type === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {t(`finances.${type}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('finances.description')}</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('finances.amount')}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('finances.date')}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('finances.project')} <span className="text-slate-400 text-xs">({t('common.optional')})</span>
            </label>
            <select
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--clr-500)]"
            >
              <option value="">— {t('projects.noClient')} —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{t('common.save')}</Button>
            <Button type="button" variant="secondary" onClick={closeModal}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title={t('common.confirm')} size="sm">
        <p className="text-slate-600 text-sm mb-6">{t('finances.deleteConfirm')}</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete)}>{t('common.delete')}</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
        </div>
      </Modal>
    </div>
  )
}
