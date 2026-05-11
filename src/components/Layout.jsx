import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '../store/useStore'

export default function Layout() {
  const theme = useStore((s) => s.settings.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'indigo')
    document.body.style.background = 'var(--bg)'
  }, [theme])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
