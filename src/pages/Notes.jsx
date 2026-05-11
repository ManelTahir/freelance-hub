import { useState } from 'react'
import { useStore } from '../store/useStore'

const ICONS = ['💡', '🎯', '📋', '👥', '📚', '✏️']

export default function Notes() {
  const { notes, updateNote } = useStore()
  const [active, setActive] = useState(1)

  const note = notes.find(n => n.id === active) || notes[0]

  const handleSave = (content) => {
    updateNote(active, { content })
  }

  const handleTitleSave = (title) => {
    updateNote(active, { title })
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>Notes</h1>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>6 notepads — auto-saved locally</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>

        {/* Sidebar tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {notes.map((n, i) => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 13, fontWeight: 500,
                background: active === n.id ? 'var(--accent-bg)' : 'rgba(255,255,255,0.03)',
                color: active === n.id ? 'var(--accent)' : 'var(--t2)',
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{ICONS[i]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title || `Note ${n.id}`}</div>
                {n.updatedAt && (
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>
                    {new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        {note && (
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{ICONS[note.id - 1]}</span>
              <input
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: 'var(--t1)', flex: 1 }}
                value={note.title || ''}
                onChange={e => updateNote(note.id, { title: e.target.value })}
                placeholder="Notebook title…"
              />
              {note.updatedAt && (
                <div style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
                  Saved {new Date(note.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            <textarea
              style={{
                flex: 1, minHeight: 440, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--t1)', lineHeight: 1.7, resize: 'none',
                fontFamily: 'inherit',
              }}
              value={note.content || ''}
              onChange={e => handleSave(e.target.value)}
              placeholder="Start writing… everything is saved automatically."
            />
          </div>
        )}
      </div>
    </div>
  )
}
