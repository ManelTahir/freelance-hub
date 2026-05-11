import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Finances from './pages/Finances'
import Invoices from './pages/Invoices'
import Proposals from './pages/Proposals'
import TimeTracking from './pages/TimeTracking'
import Pipeline from './pages/Pipeline'
import RecurringItems from './pages/RecurringItems'
import RateCalculator from './pages/RateCalculator'
import Notes from './pages/Notes'
import TaxSummary from './pages/TaxSummary'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="finances"    element={<Finances />} />
        <Route path="invoices"    element={<Invoices />} />
        <Route path="proposals"   element={<Proposals />} />
        <Route path="tax"         element={<TaxSummary />} />
        <Route path="clients"     element={<Clients />} />
        <Route path="projects"    element={<Projects />} />
        <Route path="time"        element={<TimeTracking />} />
        <Route path="pipeline"    element={<Pipeline />} />
        <Route path="recurring"   element={<RecurringItems />} />
        <Route path="rate"        element={<RateCalculator />} />
        <Route path="notes"       element={<Notes />} />
        <Route path="settings"    element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
