import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const PIE_COLORS = ['#818cf8','#34d399','#fbbf24','#93c5fd','#fda4af','#c4b5fd']

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { transactions, invoices, projects, clients, timeEntries, deals, settings } = useStore()
  const { currency = 'EUR', ownerName = '', monthlyGoal = 5000, taxRate = 25 } = settings

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const ytd = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0)
    return { income, expense, profit: income - expense }
  }, [transactions, year])

  const monthIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === month).reduce((s, t) => s + t.amount, 0),
    [transactions, year, month])

  const goalPct = Math.min(100, Math.round((monthIncome / (monthlyGoal || 1)) * 100))

  const openInvoices = useMemo(() => invoices.filter(i => i.status === 'sent' || i.status === 'overdue'), [invoices])
  const openInvoiceTotal = openInvoices.reduce((s, i) => {
    const sub = (i.items || []).reduce((a, x) => a + (x.qty || 1) * (x.rate || 0), 0)
    return s + sub * (1 + (i.vatRate || 0) / 100)
  }, 0)

  const avgExpense = useMemo(() => {
    const ms = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.date?.slice(0, 7)))].length || 1
    return transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) / ms
  }, [transactions])

  const currentBalance = ytd.income - ytd.expense
  const cashRunway = avgExpense > 0 ? Math.round(currentBalance / avgExpense) : '∞'
  const taxEstimate = Math.max(0, ytd.profit * ((taxRate || 25) / 100))
  const netProfit = ytd.profit - taxEstimate

  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const hoursThisWeek = timeEntries.filter(e => new Date(e.date) >= weekStart).reduce((s, e) => s + (e.hours || 0), 0)

  const pipelineValue = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + (d.value || 0) * ((d.probability || 50) / 100), 0)

  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const offset = i - 5
    const d = new Date(year, month + offset, 1)
    const m = d.getMonth(), y = d.getFullYear()
    const income = transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + t.amount, 0)
    return { name: MONTHS[m], income, expense }
  }), [transactions, month, year])

  const byCategory = useMemo(() => {
    const cats = {}
    transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year).forEach(t => {
      const key = t.category || 'Other'
      cats[key] = (cats[key] || 0) + t.amount
    })
    return Object.entries(cats).map(([name, value]) => ({ name, value }))
  }, [transactions, year])

  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'todo')
  const activeClients = clients.filter(c => c.status === 'active')

  const greeting = () => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const TT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--t2)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.dataKey === 'income' ? 'var(--accent)' : 'var(--t2)' }}>
            {p.dataKey === 'income' ? 'Income' : 'Expenses'}: {fmt(p.value, currency)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1080 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--t1)', margin: '0 0 4px' }}>
          {greeting()}{ownerName ? `, ${ownerName}` : ''}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          <span style={{ background: 'var(--green-bg)', color: 'var(--green)', padding: '1px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>● Live</span>
        </div>
      </div>

      {/* Row 1 KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <div className="stat-card" style={{ borderColor: 'rgba(99,102,241,0.25)' }}>
          <div className="stat-label">Monthly Goal</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{goalPct}%</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>of {fmt(monthlyGoal, currency)}</div>
          </div>
          <div className="progress-track" style={{ margin: '8px 0 4px' }}>
            <div className="progress-fill" style={{ width: `${goalPct}%`, background: 'var(--accent)' }} />
          </div>
          <div className="stat-sub">{fmt(monthIncome, currency)} this month</div>
        </div>

        <StatCard label="YTD Revenue" value={fmt(ytd.income, currency)} sub={`Jan – ${MONTHS[month]}`} />

        <div className="stat-card" style={{ borderColor: openInvoices.some(i => i.status === 'overdue') ? 'rgba(248,113,113,0.25)' : 'var(--border)' }}>
          <div className="stat-label">Open Invoices</div>
          <div className="stat-value" style={{ color: openInvoices.some(i => i.status === 'overdue') ? 'var(--amber)' : 'var(--t1)' }}>{fmt(openInvoiceTotal, currency)}</div>
          <div className="stat-sub">{openInvoices.length} pending{openInvoices.filter(i => i.status === 'overdue').length > 0 ? ` · ${openInvoices.filter(i => i.status === 'overdue').length} overdue` : ''}</div>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
          <div className="stat-label">Cash Runway</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{typeof cashRunway === 'number' ? `${cashRunway} mo` : cashRunway}</div>
          <div className="stat-sub">savings buffer</div>
        </div>
      </div>

      {/* Row 2 KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label={`Tax (YTD) est.`} value={fmt(taxEstimate, currency)} sub={`${taxRate}% reserve`} />
        <StatCard label="Net Profit (YTD)" value={fmt(netProfit, currency)} sub="after tax estimate" />
        <StatCard label="Hours This Week" value={`${hoursThisWeek.toFixed(1)}h`} sub={`${timeEntries.length} entries logged`} />
        <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="stat-label">Pipeline</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt(pipelineValue, currency)}</div>
          <div className="stat-sub">{deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length} open deals · weighted</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Revenue & Expenses</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="income" fill="var(--accent)" radius={[3,3,0,0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="var(--t3)" opacity={.6} radius={[3,3,0,0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Income by Cat.</div>
          {byCategory.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 170, color: 'var(--t3)', fontSize: 12 }}>Add categories to transactions</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={3}>
                    {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v, currency)} contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {byCategory.map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active projects + clients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>Active Projects</div>
          {activeProjects.length === 0 ? (
            <div style={{ color: 'var(--t3)', fontSize: 13 }}>No active projects</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeProjects.slice(0, 3).map(p => {
                const client = clients.find(c => c.id === p.clientId)
                const pct = p.progress || 0
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>{pct}%</div>
                    </div>
                    {client && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{client.name}</div>}
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>Active Clients</div>
          {activeClients.length === 0 ? (
            <div style={{ color: 'var(--t3)', fontSize: 13 }}>No active clients</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeClients.slice(0, 4).map(c => {
                const ltv = transactions.filter(t => {
                  const proj = projects.find(p => p.id === t.projectId)
                  return t.type === 'income' && proj?.clientId === c.id
                }).reduce((s, t) => s + t.amount, 0) || c.ltv || 0
                return (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>{c.name}</div>
                      {c.company && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{c.company}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {ltv > 0 && <span style={{ fontSize: 11, color: 'var(--t2)' }}>LTV {fmt(ltv, currency)}</span>}
                      <span className="badge badge-green" style={{ fontSize: 10 }}>Active</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
