import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '../store/useStore'
import { useI18n } from '../i18n'
import { formatCurrency, formatDate, monthKey, monthLabel, last6Months, currentMonthKey } from '../utils/format'

function StatCard({ label, value, sub, colorClass, onClick }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { clients, projects, transactions, settings } = useStore()
  const currency = settings.currency || 'EUR'
  const thisMonth = currentMonthKey()

  const stats = useMemo(() => {
    const monthlyIncome = transactions
      .filter((tx) => tx.type === 'income' && monthKey(tx.date) === thisMonth)
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const paidThisMonth = transactions
      .filter((tx) => tx.type === 'income' && monthKey(tx.date) === thisMonth)
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const activeClients = clients.filter((c) => c.status === 'active').length
    const activeProjects = projects.filter((p) => p.status === 'todo' || p.status === 'in_progress').length

    return { monthlyIncome, paidThisMonth, activeClients, activeProjects }
  }, [clients, projects, transactions, thisMonth])

  const chartData = useMemo(() => {
    const months = last6Months()
    return months.map((m) => {
      const income = transactions
        .filter((tx) => tx.type === 'income' && monthKey(tx.date) === m)
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      const expense = transactions
        .filter((tx) => tx.type === 'expense' && monthKey(tx.date) === m)
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      return { month: monthLabel(m), income, expense }
    })
  }, [transactions])

  const recentTx = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [transactions]
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">{t('dashboard.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t('dashboard.monthlyIncome')}
          value={formatCurrency(stats.monthlyIncome, currency)}
          onClick={() => navigate('/app/finances')}
        />
        <StatCard
          label={t('dashboard.totalClients')}
          value={stats.activeClients}
          onClick={() => navigate('/app/clients')}
        />
        <StatCard
          label={t('dashboard.activeProjects')}
          value={stats.activeProjects}
          onClick={() => navigate('/app/projects')}
        />
        <StatCard
          label={t('dashboard.paidThisMonth')}
          value={formatCurrency(stats.paidThisMonth, currency)}
          onClick={() => navigate('/app/finances')}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-6">{t('dashboard.incomeOverview')}</h2>
          {chartData.some((d) => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={16} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                  formatter={(v) => formatCurrency(v, currency)}
                />
                <Bar dataKey="income" fill="var(--clr-600)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              {t('dashboard.noTransactions')}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-700">{t('dashboard.recentTransactions')}</h2>
            <button
              onClick={() => navigate('/app/finances')}
              className="text-xs text-[var(--clr-600)] hover:text-[var(--clr-800)] font-medium"
            >
              View all →
            </button>
          </div>
          {recentTx.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              {t('dashboard.noTransactions')}
            </div>
          ) : (
            <div className="space-y-3">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{tx.description}</p>
                    <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
