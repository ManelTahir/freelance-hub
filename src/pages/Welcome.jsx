import { useNavigate } from 'react-router-dom'

const MODULES = [
  { icon: '📊', title: 'Dashboard', desc: 'Live KPIs, charts, goal progress' },
  { icon: '🧾', title: 'Invoices', desc: 'PDF invoices with VAT auto-calc' },
  { icon: '📝', title: 'Proposals', desc: 'Quotes that convert to invoices' },
  { icon: '👥', title: 'Client CRM', desc: 'Health score & lifetime value' },
  { icon: '📁', title: 'Projects', desc: 'Kanban with progress bars' },
  { icon: '⏱', title: 'Time Tracking', desc: 'Billable hours & earnings' },
  { icon: '📈', title: 'Pipeline', desc: 'Drag & drop deals — lead to won' },
  { icon: '🔄', title: 'Recurring', desc: 'Retainers & subscriptions' },
  { icon: '🧮', title: 'Rate Calc', desc: 'Your minimum & ideal hourly rate' },
  { icon: '💰', title: 'Finance', desc: 'Income, expenses, tax reserve' },
  { icon: '📋', title: 'Tax Summary', desc: 'YTD overview for your accountant' },
  { icon: '📓', title: 'Notes', desc: '6 notepads, auto-saved locally' },
]

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>FreelanceHub</span>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--t3)' }}>
          <span>No account</span><span>·</span><span>No cloud</span><span>·</span><span>No subscription</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px 40px', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 24, border: '1px solid var(--accent-dim)' }}>
          <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
          11 modules · 100% private · yours forever
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: 'var(--t1)', lineHeight: 1.15, marginBottom: 16, letterSpacing: -.03 }}>
          Your freelance business.
          <br />
          <span style={{ color: 'var(--green)' }}>One browser tab.</span>
        </h1>

        <p style={{ fontSize: 16, color: 'var(--t2)', maxWidth: 480, marginBottom: 36, lineHeight: 1.6 }}>
          FreelanceHub is an all-in-one business dashboard — invoices, clients, time tracking, pipeline, and more. No account, no cloud, no subscription.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => navigate('/app/dashboard')}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Open Dashboard →
          </button>
          <button
            onClick={() => navigate('/app/settings')}
            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--t2)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Load Demo Data
          </button>
        </div>

        {/* 3 pillars */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 56, marginTop: 10 }}>
          {[['🔒', '100% Private', 'Data stays in your browser'], ['⚡', 'Works Offline', 'No internet needed, ever'], ['∞', 'Yours Forever', 'Buy once, keep forever']].map(([icon, t, d]) => (
            <div key={t} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{t}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Modules grid */}
        <div style={{ maxWidth: 820, width: '100%' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 14 }}>
            Everything you need · {MODULES.length} tools
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {MODULES.map(m => (
              <div key={m.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', textAlign: 'left' }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{m.icon}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px', fontSize: 11, color: 'var(--t3)', borderTop: '1px solid var(--border)' }}>
        FreelanceHub · All data stored locally in your browser · No server, no cloud, no login
      </div>
    </div>
  )
}
