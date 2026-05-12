import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'

const nextInvoiceNumber = (invoices) => {
  const year = new Date().getFullYear()
  const count = invoices.filter(i => i.number?.startsWith(`INV-${year}`)).length
  return `INV-${year}-${String(count + 1).padStart(3, '0')}`
}

const nextProposalNumber = (proposals) => {
  const year = new Date().getFullYear()
  const count = proposals.filter(p => p.number?.startsWith(`PRO-${year}`)).length
  return `PRO-${year}-${String(count + 1).padStart(3, '0')}`
}

export const useStore = create(
  persist(
    (set, get) => ({

      // ── Settings ────────────────────────────────────────────────
      settings: {
        currency: 'EUR', businessName: '', ownerName: '',
        theme: 'indigo', accentIcon: 'bolt',
        address: '', iban: '', vatNumber: '', vatRate: 20,
        monthlyGoal: 5000, taxRate: 25,
      },
      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),

      // ── Clients ─────────────────────────────────────────────────
      clients: [],
      addClient: (data) =>
        set((s) => ({ clients: [...s.clients, { ...data, id: uuid(), createdAt: new Date().toISOString() }] })),
      updateClient: (id, data) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // ── Projects ────────────────────────────────────────────────
      projects: [],
      addProject: (data) =>
        set((s) => ({ projects: [...s.projects, { ...data, id: uuid(), createdAt: new Date().toISOString() }] })),
      updateProject: (id, data) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // ── Transactions ────────────────────────────────────────────
      transactions: [],
      addTransaction: (data) =>
        set((s) => ({ transactions: [...s.transactions, { ...data, id: uuid(), createdAt: new Date().toISOString() }] })),
      updateTransaction: (id, data) =>
        set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      // ── Invoices ────────────────────────────────────────────────
      invoices: [],
      addInvoice: (data) => {
        const { invoices } = get()
        const number = nextInvoiceNumber(invoices)
        set((s) => ({
          invoices: [...s.invoices, {
            ...data, id: uuid(), number,
            createdAt: new Date().toISOString(),
            status: data.status || 'draft',
            items: data.items || [],
            vatRate: data.vatRate ?? s.settings.vatRate ?? 20,
          }],
        }))
      },
      updateInvoice: (id, data) =>
        set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...data } : i)) })),
      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      // ── Proposals ───────────────────────────────────────────────
      proposals: [],
      addProposal: (data) => {
        const { proposals } = get()
        const number = nextProposalNumber(proposals)
        set((s) => ({
          proposals: [...s.proposals, {
            ...data, id: uuid(), number,
            createdAt: new Date().toISOString(),
            status: data.status || 'draft',
            items: data.items || [],
            vatRate: data.vatRate ?? s.settings.vatRate ?? 20,
          }],
        }))
      },
      updateProposal: (id, data) =>
        set((s) => ({ proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deleteProposal: (id) =>
        set((s) => ({ proposals: s.proposals.filter((p) => p.id !== id) })),
      convertProposalToInvoice: (proposalId) => {
        const { proposals, invoices, addInvoice, updateProposal } = get()
        const proposal = proposals.find((p) => p.id === proposalId)
        if (!proposal) return
        addInvoice({
          clientId: proposal.clientId,
          items: proposal.items,
          vatRate: proposal.vatRate,
          notes: proposal.notes,
          issuedDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          status: 'draft',
          fromProposalId: proposalId,
        })
        const newInvoice = get().invoices[get().invoices.length - 1]
        updateProposal(proposalId, { status: 'won', convertedToInvoiceId: newInvoice?.id })
      },

      // ── Time Entries ─────────────────────────────────────────────
      timeEntries: [],
      addTimeEntry: (data) =>
        set((s) => ({ timeEntries: [...s.timeEntries, { ...data, id: uuid(), createdAt: new Date().toISOString() }] })),
      updateTimeEntry: (id, data) =>
        set((s) => ({ timeEntries: s.timeEntries.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
      deleteTimeEntry: (id) =>
        set((s) => ({ timeEntries: s.timeEntries.filter((e) => e.id !== id) })),

      // ── Recurring Items ─────────────────────────────────────────
      recurringItems: [],
      addRecurringItem: (data) =>
        set((s) => ({ recurringItems: [...s.recurringItems, { ...data, id: uuid(), createdAt: new Date().toISOString(), active: true }] })),
      updateRecurringItem: (id, data) =>
        set((s) => ({ recurringItems: s.recurringItems.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      deleteRecurringItem: (id) =>
        set((s) => ({ recurringItems: s.recurringItems.filter((r) => r.id !== id) })),

      // ── Notes (6 slots) ─────────────────────────────────────────
      notes: [
        { id: 1, title: 'Ideas', content: '' },
        { id: 2, title: 'Goals', content: '' },
        { id: 3, title: 'Weekly Review', content: '' },
        { id: 4, title: 'Client Notes', content: '' },
        { id: 5, title: 'Resources', content: '' },
        { id: 6, title: 'Misc', content: '' },
      ],
      updateNote: (id, data) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)) })),

      // ── Pipeline (deals separate from projects) ─────────────────
      deals: [],
      addDeal: (data) =>
        set((s) => ({ deals: [...s.deals, { ...data, id: uuid(), createdAt: new Date().toISOString(), stage: data.stage || 'lead' }] })),
      updateDeal: (id, data) =>
        set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, ...data } : d)) })),
      deleteDeal: (id) =>
        set((s) => ({ deals: s.deals.filter((d) => d.id !== id) })),

      // ── Import / Export ─────────────────────────────────────────
      importAll: (data) => set(data),
      exportAll: () => {
        const { clients, projects, transactions, invoices, proposals, timeEntries, recurringItems, deals, notes, settings } = get()
        return { clients, projects, transactions, invoices, proposals, timeEntries, recurringItems, deals, notes, settings }
      },
      resetAll: () => set({
        clients: [], projects: [], transactions: [],
        invoices: [], proposals: [], timeEntries: [], recurringItems: [], deals: [],
        notes: [
          { id: 1, title: 'Ideas', content: '' }, { id: 2, title: 'Goals', content: '' },
          { id: 3, title: 'Weekly Review', content: '' }, { id: 4, title: 'Client Notes', content: '' },
          { id: 5, title: 'Resources', content: '' }, { id: 6, title: 'Misc', content: '' },
        ],
        settings: { currency: 'EUR', businessName: '', ownerName: '', theme: 'indigo', accentIcon: 'bolt', address: '', iban: '', bic: '', vatNumber: '', website: '', vatRate: 20, monthlyGoal: 5000, taxRate: 25 },
      }),

      loadDemoData: () => {
        const c1 = uuid(), c2 = uuid(), c3 = uuid(), c4 = uuid()
        const p1 = uuid(), p2 = uuid(), p3 = uuid()
        const now = new Date()
        const y = now.getFullYear()

        const inv1 = uuid(), inv2 = uuid(), inv3 = uuid()
        const pro1 = uuid(), pro2 = uuid()

        set({
          settings: {
            currency: 'EUR', businessName: 'Torres Creative Studio', ownerName: 'Maya Torres',
            theme: 'violet', accentIcon: 'bolt',
            address: 'Carrer de Provença 287, Barcelona 08037', iban: 'ES91 2100 0418 4502 0005 1332',
            vatNumber: 'ESB12345678', vatRate: 21, monthlyGoal: 6500, taxRate: 30,
          },
          clients: [
            { id: c1, name: 'Carlos Ruiz', email: 'c.ruiz@pulsemedia.es', phone: '+34 620 111 222', company: 'Pulse Media Agency', status: 'active', notes: 'Top client — pays within 7 days. Prefers WhatsApp for quick updates.', ltv: 21500, createdAt: `${y-1}-04-10T10:00:00.000Z` },
            { id: c2, name: 'Ania Kowalski', email: 'ania@novatech.io', phone: '+48 501 333 444', company: 'NovaTech Solutions', status: 'active', notes: 'Startup — fast decisions, flexible scope. Monthly retainer since Jan.', ltv: 9800, createdAt: `${y}-01-05T10:00:00.000Z` },
            { id: c3, name: 'Léa Fontaine', email: 'lea@bloomwellness.fr', phone: '+33 6 12 34 56 78', company: 'Bloom Wellness', status: 'prospect', notes: 'Interested in a brand film. Sent initial quote on April 18.', ltv: 0, createdAt: `${y}-04-18T10:00:00.000Z` },
            { id: c4, name: 'Tom Bauer', email: 'tom@urbaneatsbcn.com', phone: '+34 636 555 789', company: 'Urban Eats Barcelona', status: 'inactive', notes: 'Completed food campaign Q4 last year. May return for summer promo.', ltv: 4100, createdAt: `${y-1}-08-20T10:00:00.000Z` },
          ],
          projects: [
            { id: p1, clientId: c1, title: 'Pulse Summer Campaign Videos', status: 'in_progress', rate: 7200, currency: 'EUR', dueDate: `${y}-06-15`, progress: 68, description: '4 x 30-sec social ads + 1 hero video for summer launch.', createdAt: `${y}-03-01T10:00:00.000Z` },
            { id: p2, clientId: c2, title: 'NovaTech App Demo Series', status: 'delivered', rate: 3900, currency: 'EUR', dueDate: `${y}-04-20`, progress: 100, description: 'Screen-recorded product walkthroughs with voiceover and motion graphics.', createdAt: `${y}-02-10T10:00:00.000Z` },
            { id: p3, clientId: c3, title: 'Bloom Wellness Brand Film', status: 'todo', rate: 5500, currency: 'EUR', dueDate: `${y}-08-01`, progress: 0, description: '3-min cinematic brand film for website + social launch.', createdAt: `${y}-04-18T10:00:00.000Z` },
          ],
          transactions: [
            { id: uuid(), projectId: p2, type: 'income', amount: 1950, description: 'NovaTech — App Demo deposit (50%)', date: `${y}-02-12`, category: 'Video Production', createdAt: `${y}-02-12T10:00:00.000Z` },
            { id: uuid(), projectId: p2, type: 'income', amount: 1950, description: 'NovaTech — App Demo final payment', date: `${y}-04-21`, category: 'Video Production', createdAt: `${y}-04-21T10:00:00.000Z` },
            { id: uuid(), projectId: p1, type: 'income', amount: 3600, description: 'Pulse Media — Summer Campaign deposit', date: `${y}-03-05`, category: 'Video Production', createdAt: `${y}-03-05T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'income', amount: 1800, description: 'NovaTech retainer — February', date: `${y}-02-01`, category: 'Retainer', createdAt: `${y}-02-01T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'income', amount: 1800, description: 'NovaTech retainer — March', date: `${y}-03-01`, category: 'Retainer', createdAt: `${y}-03-01T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'income', amount: 1800, description: 'NovaTech retainer — April', date: `${y}-04-01`, category: 'Retainer', createdAt: `${y}-04-01T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 54.99, description: 'Adobe Premiere Pro subscription', date: `${y}-01-01`, category: 'Software', createdAt: `${y}-01-01T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 54.99, description: 'Adobe Premiere Pro subscription', date: `${y}-02-01`, category: 'Software', createdAt: `${y}-02-01T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 54.99, description: 'Adobe Premiere Pro subscription', date: `${y}-03-01`, category: 'Software', createdAt: `${y}-03-01T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 29, description: 'Artlist music license — monthly', date: `${y}-01-15`, category: 'Music & SFX', createdAt: `${y}-01-15T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 29, description: 'Artlist music license — monthly', date: `${y}-02-15`, category: 'Music & SFX', createdAt: `${y}-02-15T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 29, description: 'Artlist music license — monthly', date: `${y}-03-15`, category: 'Music & SFX', createdAt: `${y}-03-15T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 180, description: 'External SSD 2TB — storage upgrade', date: `${y}-02-20`, category: 'Equipment', createdAt: `${y}-02-20T10:00:00.000Z` },
            { id: uuid(), projectId: null, type: 'expense', amount: 15, description: 'Frame.io team plan', date: `${y}-01-01`, category: 'Software', createdAt: `${y}-01-01T10:00:00.000Z` },
          ],
          invoices: [
            { id: inv1, number: `INV-${y}-001`, clientId: c2, projectId: p2, status: 'paid', issuedDate: `${y}-04-21`, dueDate: `${y}-05-05`, paidDate: `${y}-04-23`, vatRate: 21, notes: 'A pleasure working with you on this series!', items: [{ description: 'App Demo Series — Final Delivery (5 videos)', qty: 1, rate: 3900 }], createdAt: `${y}-04-21T10:00:00.000Z` },
            { id: inv2, number: `INV-${y}-002`, clientId: c1, projectId: p1, status: 'sent', issuedDate: `${y}-04-28`, dueDate: `${y}-05-12`, vatRate: 21, notes: 'Progress payment — 50% of project total.', items: [{ description: 'Summer Campaign — Progress Invoice 50%', qty: 1, rate: 3600 }], createdAt: `${y}-04-28T10:00:00.000Z` },
            { id: inv3, number: `INV-${y}-003`, clientId: c2, projectId: null, status: 'overdue', issuedDate: `${y}-04-01`, dueDate: `${y}-04-15`, vatRate: 21, notes: 'Monthly retainer — April.', items: [{ description: 'Monthly Retainer — April', qty: 1, rate: 1800 }], createdAt: `${y}-04-01T10:00:00.000Z` },
          ],
          proposals: [
            { id: pro1, number: `PRO-${y}-001`, clientId: c3, title: 'Bloom Wellness Brand Film', status: 'sent', sentDate: `${y}-04-19`, vatRate: 21, notes: 'Quote valid 30 days. Includes 2 revision rounds.', items: [{ description: 'Pre-production & scripting', qty: 1, rate: 800 }, { description: 'Shoot day (1 day, crew of 2)', qty: 1, rate: 1800 }, { description: 'Post-production & colour grade', qty: 1, rate: 2200 }, { description: 'Music licensing (Artlist)', qty: 1, rate: 300 }], createdAt: `${y}-04-19T10:00:00.000Z` },
            { id: pro2, number: `PRO-${y}-002`, clientId: c4, title: 'Urban Eats Summer Promo Reel', status: 'lost', sentDate: `${y}-02-10`, vatRate: 21, notes: 'Client went with internal team.', items: [{ description: 'Food promo video (60 sec)', qty: 1, rate: 2800 }], createdAt: `${y}-02-10T10:00:00.000Z` },
          ],
          timeEntries: [
            { id: uuid(), projectId: p1, clientId: c1, date: `${y}-05-05`, hours: 4.5, rate: 95, description: 'Script writing & storyboard review', billed: false, createdAt: `${y}-05-05T10:00:00.000Z` },
            { id: uuid(), projectId: p1, clientId: c1, date: `${y}-05-07`, hours: 6, rate: 95, description: 'Rough cut — hero video v1', billed: false, createdAt: `${y}-05-07T10:00:00.000Z` },
            { id: uuid(), projectId: p1, clientId: c1, date: `${y}-05-08`, hours: 3, rate: 95, description: 'Social ad edits (30-sec x 2)', billed: false, createdAt: `${y}-05-08T10:00:00.000Z` },
            { id: uuid(), projectId: p2, clientId: c2, date: `${y}-04-14`, hours: 5, rate: 90, description: 'Screen recording + motion graphics overlay', billed: true, createdAt: `${y}-04-14T10:00:00.000Z` },
            { id: uuid(), projectId: p2, clientId: c2, date: `${y}-04-15`, hours: 4, rate: 90, description: 'Voiceover sync & export (5 formats)', billed: true, createdAt: `${y}-04-15T10:00:00.000Z` },
          ],
          recurringItems: [
            { id: uuid(), title: 'Adobe Premiere Pro', type: 'expense', amount: 54.99, currency: 'EUR', frequency: 'monthly', category: 'Software', dayOfMonth: 1, active: true, createdAt: `${y}-01-01T10:00:00.000Z` },
            { id: uuid(), title: 'NovaTech Retainer', type: 'income', amount: 1800, currency: 'EUR', frequency: 'monthly', category: 'Retainer', dayOfMonth: 1, active: true, createdAt: `${y}-01-05T10:00:00.000Z` },
            { id: uuid(), title: 'Artlist Music License', type: 'expense', amount: 29, currency: 'EUR', frequency: 'monthly', category: 'Music & SFX', dayOfMonth: 15, active: true, createdAt: `${y}-01-01T10:00:00.000Z` },
            { id: uuid(), title: 'Frame.io Team Plan', type: 'expense', amount: 15, currency: 'EUR', frequency: 'monthly', category: 'Software', dayOfMonth: 1, active: true, createdAt: `${y}-01-01T10:00:00.000Z` },
            { id: uuid(), title: 'iCloud 2TB (work backup)', type: 'expense', amount: 9.99, currency: 'EUR', frequency: 'monthly', category: 'Storage', dayOfMonth: 5, active: true, createdAt: `${y}-01-05T10:00:00.000Z` },
          ],
          deals: [
            { id: uuid(), clientId: c3, title: 'Bloom Wellness Brand Film', value: 5100, probability: 65, stage: 'proposal', notes: 'Waiting for budget approval from their board.', createdAt: `${y}-04-19T10:00:00.000Z` },
            { id: uuid(), clientId: null, title: 'SaaS Product Launch Video', value: 4800, probability: 25, stage: 'lead', notes: 'Intro call scheduled via LinkedIn. Early stage.', createdAt: `${y}-05-02T10:00:00.000Z` },
            { id: uuid(), clientId: c1, title: 'Q3 Social Content Pack (12 videos)', value: 6000, probability: 85, stage: 'negotiation', notes: 'Carlos confirmed scope, finalising delivery timeline.', createdAt: `${y}-05-06T10:00:00.000Z` },
            { id: uuid(), clientId: c2, title: 'Onboarding Video Series', value: 3500, probability: 100, stage: 'won', notes: 'Contract signed. Kicks off June 1.', createdAt: `${y}-04-01T10:00:00.000Z` },
          ],
          notes: [
            { id: 1, title: 'Ideas', content: '🎬 Ideas to explore:\n- Offer a "video audit" service for existing brand content\n- Create a Reels editing package for small biz\n- Pitch documentary-style case study to Pulse\n- Sell LUTs pack on Gumroad', updatedAt: new Date().toISOString() },
            { id: 2, title: 'Goals', content: `🎯 Q2 ${y} Goals:\n✅ Land NovaTech retainer (done!)\n✅ Deliver App Demo Series on time\n→ Close Bloom Wellness deal\n→ Hit €6,500/month average revenue\n→ Film 1 personal portfolio piece`, updatedAt: new Date().toISOString() },
            { id: 3, title: 'Weekly Review', content: `Week of May 5:\n+ Pulse rough cut approved on first pass\n+ NovaTech paid final invoice in 2 days\n- Need to follow up on Bloom Wellness proposal\n- Time tracking slipping — log daily, not weekly`, updatedAt: new Date().toISOString() },
            { id: 4, title: 'Client Notes', content: '👤 Carlos (Pulse): Very visual. Always send a mood board before scripting. Invoices every 2 weeks.\n\n👤 Ania (NovaTech): Detail-oriented. Needs written briefs. Pays fast.\n\n👤 Léa (Bloom): First contact via Instagram DM. Loves clean, calm aesthetics.', updatedAt: new Date().toISOString() },
            { id: 5, title: 'Resources', content: '🔗 Useful links:\n- Artlist.io — royalty-free music\n- Mixkit.co — free SFX & templates\n- Unsplash / Pexels — B-roll stock\n- Kapwing — quick online edits\n- LUT.is — colour grade presets\n- Notion — project briefs & scripts', updatedAt: new Date().toISOString() },
            { id: 6, title: 'Misc', content: '' },
          ],
        })
      },
    }),
    { name: 'freelance-hub-v2' }
  )
)
