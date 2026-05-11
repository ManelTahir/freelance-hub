import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function TaxSummary() {
  const { transactions, invoices, settings } = useStore()
  const { currency = 'EUR', taxRate = 25, vatRate = 20 } = settings

  const year = new Date().getFullYear()
  const fmt0 = n => fmt(n, currency)

  const ytd = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0)
    const profit = income - expense
    const taxDue = Math.max(0, profit * (taxRate / 100))
    const vatCollected = invoices.filter(i => i.status === 'paid' && new Date(i.issuedDate || i.createdAt).getFullYear() === year).reduce((s, i) => {
      const sub = (i.items || []).reduce((a, x) => a + (x.qty || 1) * (x.rate || 0), 0)
      return s + sub * ((i.vatRate || 0) / 100)
    }, 0)
    return { income, expense, profit, taxDue, vatCollected }
  }, [transactions, invoices, year])

  const monthlyData = useMemo(() => {
    return MONTHS.map((name, m) => {
      const income = transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === m).reduce((s, t) => s + t.amount, 0)
      const expense = transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year && new Date(t.date).getMonth() === m).reduce((s, t) => s + t.amount, 0)
      const profit = income - expense
      const tax = Math.max(0, profit * (taxRate / 100))
      return { name, income, expense, profit, tax }
    })
  }, [transactions, year, taxRate])

  const expenseCategories = useMemo(() => {
    const cats = {}
    transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year).forEach(t => {
      const key = t.category || 'Uncategorized'
      cats[key] = (cats[key] || 0) + t.amount
    })
    return Object.entries(cats).sort((a, b) => b[1] - a[1])
  }, [transactions, year])

  const TT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--t2)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => <div key={p.dataKey} style={{ color: p.value >= 0 ? 'var(--green)' : 'var(--red)' }}>{p.dataKey}: {fmt0(p.value)}</div>)}
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Tax Year Summary {year}</h1>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Income, deductions & estimated tax liability · {taxRate}% tax rate · {vatRate}% VAT</div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{fmt0(ytd.income)}</div>
          <div className="stat-sub">gross revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Deductible Expenses</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{fmt0(ytd.expense)}</div>
          <div className="stat-sub">business costs</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Taxable Profit</div>
          <div className="stat-value">{fmt0(ytd.profit)}</div>
          <div className="stat-sub">income − expenses</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
          <div className="stat-label">Est. Tax Due ({taxRate}%)</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{fmt0(ytd.taxDue)}</div>
          <div className="stat-sub">set aside this amount</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Monthly profit chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16 }}>Monthly Profit / Tax Estimate</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="profit" radius={[3,3,0,0]} maxBarSize={24}>
                {monthlyData.map((m, i) => <Cell key={i} fill={m.profit >= 0 ? 'var(--green)' : 'var(--red)'} />)}
              </Bar>
              <Bar dataKey="tax" fill="var(--amber)" opacity={.6} radius={[3,3,0,0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* VAT + Deductions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="stat-card">
            <div className="stat-label">VAT Collected (YTD)</div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{fmt0(ytd.vatCollected)}</div>
            <div className="stat-sub">from paid invoices · {vatRate}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Net After Tax</div>
            <div className="stat-value">{fmt0(ytd.profit - ytd.taxDue)}</div>
            <div className="stat-sub">take-home estimate</div>
          </div>
        </div>
      </div>

      {/* Expense breakdown */}
      {expenseCategories.length > 0 && (
        <div className="card" style={{ padding: '20px', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>Expense Breakdown by Category</div>
          <table className="tbl">
            <thead>
              <tr><th>Category</th><th>Amount</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              {expenseCategories.map(([cat, amount]) => (
                <tr key={cat}>
                  <td style={{ color: 'var(--t1)', fontWeight: 500 }}>{cat}</td>
                  <td style={{ color: 'var(--red)' }}>{fmt0(amount)}</td>
                  <td style={{ color: 'var(--t3)' }}>{ytd.expense > 0 ? Math.round((amount / ytd.expense) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
        ⚠️ This tool does not replace professional tax advice. Rates and deductible expenses vary by country and situation. Always consult a certified accountant for your tax filing.
      </div>
    </div>
  )
}
