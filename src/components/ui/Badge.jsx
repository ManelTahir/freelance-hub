const variants = {
  // Client status
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  prospect: 'bg-blue-50 text-blue-700 ring-blue-200',
  // Project status
  todo: 'bg-slate-100 text-slate-600 ring-slate-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  delivered: 'bg-blue-50 text-blue-700 ring-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  // Transaction type
  income: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  expense: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function Badge({ variant, label }) {
  const cls = variants[variant] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  )
}
