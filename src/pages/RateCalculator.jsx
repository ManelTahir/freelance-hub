import { useState, useMemo } from 'react'

function fmt(n, cur = 'EUR') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n || 0)
}

export default function RateCalculator() {
  const [form, setForm] = useState({
    monthlyExpenses: 2500,
    desiredProfit: 2000,
    vacationWeeks: 4,
    sickDays: 5,
    workHoursPerDay: 8,
    billablePercent: 70,
    currency: 'EUR',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calc = useMemo(() => {
    const totalMonthlyNeeded = (form.monthlyExpenses || 0) + (form.desiredProfit || 0)
    const annualNeeded = totalMonthlyNeeded * 12

    const workWeeks = 52 - (form.vacationWeeks || 0)
    const workDays = workWeeks * 5 - (form.sickDays || 0)
    const totalHours = workDays * (form.workHoursPerDay || 8)
    const billableHours = totalHours * ((form.billablePercent || 70) / 100)

    const minRate = billableHours > 0 ? annualNeeded / billableHours : 0
    const recommendedRate = minRate * 1.3
    const dayRate = recommendedRate * (form.workHoursPerDay || 8)

    const monthlyAtRate = (billableHours / 12) * recommendedRate
    const monthlyAtMin = (billableHours / 12) * minRate

    return {
      billableHours: Math.round(billableHours),
      workDays,
      minRate: Math.round(minRate),
      recommendedRate: Math.round(recommendedRate),
      dayRate: Math.round(dayRate),
      annualNeeded: Math.round(annualNeeded),
      monthlyAtRate: Math.round(monthlyAtRate),
    }
  }, [form])

  const Row = ({ label, value, highlight }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px', borderBottom: '1px solid var(--border2)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
      <span style={{ fontSize: highlight ? 22 : 15, fontWeight: highlight ? 800 : 600, color: highlight ? 'var(--accent)' : 'var(--t1)' }}>
        {value}
      </span>
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Rate Calculator</h1>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Find your minimum and recommended hourly rate</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Inputs */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 18, letterSpacing: -.01 }}>Your Numbers</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'monthlyExpenses', label: 'Monthly Personal Expenses', note: 'rent, food, bills, etc.' },
              { key: 'desiredProfit', label: 'Desired Monthly Profit', note: 'savings + business growth' },
            ].map(({ key, label, note }) => (
              <div key={key}>
                <label className="label">{label}</label>
                {note && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 5 }}>{note}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="input" type="number" value={form[key]} onChange={e => set(key, parseFloat(e.target.value) || 0)} min={0} />
                  <span style={{ fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{form.currency}/mo</span>
                </div>
              </div>
            ))}

            <div style={{ background: 'var(--accent-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--t1)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>Monthly Target</span>
              <span>{fmt((form.monthlyExpenses || 0) + (form.desiredProfit || 0), form.currency)}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Work Schedule</div>
              {[
                { key: 'vacationWeeks', label: 'Vacation Weeks / Year', max: 20 },
                { key: 'sickDays', label: 'Sick Days / Year', max: 30 },
                { key: 'workHoursPerDay', label: 'Work Hours / Day', max: 12 },
                { key: 'billablePercent', label: 'Billable Time (%)', note: 'Rest: admin, marketing, learning', max: 100 },
              ].map(({ key, label, note, max }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  {note && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>{note}</div>}
                  <input className="input" type="number" value={form[key]} onChange={e => set(key, parseFloat(e.target.value) || 0)} min={0} max={max} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Main rates */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 16px 12px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.07em', textTransform: 'uppercase' }}>Your Rates</div>
            <Row label="Minimum Rate (break-even)" value={`${fmt(calc.minRate, form.currency)}/h`} />
            <Row label="Recommended Rate" value={`${fmt(calc.recommendedRate, form.currency)}/h`} highlight />
            <Row label="Day Rate (recommended)" value={`${fmt(calc.dayRate, form.currency)}/day`} />
          </div>

          {/* Context */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 16px 12px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.07em', textTransform: 'uppercase' }}>Context</div>
            <Row label="Billable Hours / Year" value={`${calc.billableHours}h`} />
            <Row label="Working Days / Year" value={`${calc.workDays} days`} />
            <Row label="Annual Revenue Needed" value={fmt(calc.annualNeeded, form.currency)} />
            <Row label="Monthly at Recommended Rate" value={fmt(calc.monthlyAtRate, form.currency)} />
          </div>

          {/* Warning */}
          <div style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: 'var(--amber)', lineHeight: 1.5 }}>
            <strong>Stop undercharging.</strong> The minimum rate only covers expenses — at the recommended rate you earn your desired profit AND have buffer for slow months.
          </div>
        </div>
      </div>
    </div>
  )
}
