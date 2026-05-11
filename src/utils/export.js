import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, filename || `freelancehub-backup-${todayStr()}.json`)
}

export function downloadCSV(rows, headers, filename) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    headers.map((h) => escape(h.label)).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h.key])).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${filename}-${todayStr()}.csv`)
}

export function downloadExcel({ clients, projects, transactions }) {
  const wb = XLSX.utils.book_new()

  const clientRows = clients.map((c) => ({
    Nom: c.name || '',
    Email: c.email || '',
    Téléphone: c.phone || '',
    Société: c.company || '',
    Statut: c.status || '',
    Notes: c.notes || '',
  }))

  const projectRows = projects.map((p) => ({
    Titre: p.title || '',
    Statut: p.status || '',
    Tarif: p.rate || '',
    Devise: p.currency || '',
    Échéance: p.dueDate || '',
    Description: p.description || '',
  }))

  const transactionRows = transactions.map((t) => ({
    Date: t.date || '',
    Type: t.type || '',
    Description: t.description || '',
    Montant: t.amount || 0,
  }))

  const addSheet = (name, rows, fallback) => {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [fallback])
    XLSX.utils.book_append_sheet(wb, ws, name)
  }

  addSheet('Clients', clientRows, { Nom: '', Email: '', Téléphone: '', Société: '', Statut: '', Notes: '' })
  addSheet('Projets', projectRows, { Titre: '', Statut: '', Tarif: '', Devise: '', Échéance: '', Description: '' })
  addSheet('Transactions', transactionRows, { Date: '', Type: '', Description: '', Montant: 0 })

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `freelancehub-export-${todayStr()}.xlsx`)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
