import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'

const Section = ({ label, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t3)', padding: '0 12px', marginBottom: '4px' }}>
      {label}
    </div>
    {children}
  </div>
)

const Item = ({ to, icon, label }) => (
  <NavLink to={to} style={({ isActive }) => isActive
    ? { background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all .15s' }
    : { color: 'var(--t2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all .15s' }
  }
  onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)' } }}
  onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)' } }}
  >
    <span>{icon}</span>
    {label}
  </NavLink>
)

const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export default function Sidebar() {
  const settings = useStore((s) => s.settings)

  return (
    <aside style={{ width: '220px', minWidth: '220px', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>FreelanceHub</div>
            {settings.ownerName && <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{settings.ownerName}</div>}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>

        <Section label="Overview">
          <Item to="/app/dashboard" label="Dashboard"
            icon={<Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />} />
        </Section>

        <Section label="Finances">
          <Item to="/app/finances" label="Income & Expenses"
            icon={<Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
          <Item to="/app/invoices" label="Invoices"
            icon={<Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />} />
          <Item to="/app/proposals" label="Proposals"
            icon={<Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />} />
          <Item to="/app/recurring" label="Recurring"
            icon={<Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />} />
          <Item to="/app/tax" label="Tax Summary"
            icon={<Icon d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />} />
        </Section>

        <Section label="Business">
          <Item to="/app/clients" label="Clients"
            icon={<Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />} />
          <Item to="/app/projects" label="Projects"
            icon={<Icon d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />} />
          <Item to="/app/time" label="Time Tracking"
            icon={<Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />} />
          <Item to="/app/pipeline" label="Pipeline"
            icon={<Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />} />
        </Section>

        <Section label="Tools">
          <Item to="/app/rate" label="Rate Calculator"
            icon={<Icon d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />} />
          <Item to="/app/notes" label="Notes"
            icon={<Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />} />
        </Section>

      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <Item to="/app/settings" label="Settings"
          icon={<Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />} />
        <div style={{ fontSize: '10px', color: 'var(--t3)', padding: '8px 12px 0', lineHeight: 1.4 }}>
          100% private · data stays on your device
        </div>
      </div>
    </aside>
  )
}
