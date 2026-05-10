import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Clients ──────────────────────────────────────────────────────────
      clients: [],
      addClient: (data) =>
        set((s) => ({
          clients: [...s.clients, { ...data, id: uuid(), createdAt: new Date().toISOString() }],
        })),
      updateClient: (id, data) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // ── Projects ─────────────────────────────────────────────────────────
      projects: [],
      addProject: (data) =>
        set((s) => ({
          projects: [...s.projects, { ...data, id: uuid(), createdAt: new Date().toISOString() }],
        })),
      updateProject: (id, data) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // ── Transactions ─────────────────────────────────────────────────────
      transactions: [],
      addTransaction: (data) =>
        set((s) => ({
          transactions: [...s.transactions, { ...data, id: uuid(), createdAt: new Date().toISOString() }],
        })),
      updateTransaction: (id, data) =>
        set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      // ── Settings ─────────────────────────────────────────────────────────
      settings: { currency: 'EUR', businessName: '', ownerName: '', theme: 'indigo', accentIcon: 'bolt' },
      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),

      // ── Import / Export ──────────────────────────────────────────────────
      importAll: (data) => set(data),
      exportAll: () => {
        const { clients, projects, transactions, settings } = get()
        return { clients, projects, transactions, settings }
      },
      resetAll: () =>
        set({ clients: [], projects: [], transactions: [], settings: { currency: 'EUR', businessName: '', ownerName: '', theme: 'indigo', accentIcon: 'bolt' } }),

      loadDemoData: () => {
        const { settings: cur } = get()
        const c1 = uuid(), c2 = uuid(), c3 = uuid(), c4 = uuid(), c5 = uuid()
        const p1 = uuid(), p2 = uuid(), p3 = uuid()
        set({
          settings: { currency: 'EUR', businessName: 'Manel Studio', ownerName: 'Manel', theme: cur.theme || 'indigo', accentIcon: cur.accentIcon || 'bolt' },
          clients: [
            { id: c1, name: 'Sophie Martin', email: 'sophie.martin@agencecreative.fr', phone: '+33 6 12 34 56 78', company: 'Agence Créative', status: 'active', notes: 'Cliente depuis 2023, paiements rapides.', createdAt: '2024-01-15T10:00:00.000Z' },
            { id: c2, name: 'Thomas Müller', email: 'thomas@techstart.de', phone: '+49 170 555 0123', company: 'TechStart GmbH', status: 'active', notes: 'Projet e-commerce en cours.', createdAt: '2024-03-01T10:00:00.000Z' },
            { id: c3, name: 'Amina Benali', email: 'amina.benali@gmail.com', phone: '+33 7 98 76 54 32', company: '', status: 'prospect', notes: 'Intéressée par une refonte de logo.', createdAt: '2024-06-10T10:00:00.000Z' },
            { id: c4, name: 'Lucas Ferreira', email: 'lucas@lf-consulting.pt', phone: '+351 91 234 5678', company: 'LF Consulting', status: 'inactive', notes: 'Projet terminé en décembre 2023.', createdAt: '2023-09-01T10:00:00.000Z' },
            { id: c5, name: 'Chloé Dupont', email: 'chloe.dupont@restaurantlumiere.fr', phone: '+33 6 55 44 33 22', company: 'Restaurant Lumière', status: 'active', notes: 'Nouveau client — site vitrine + menu digital.', createdAt: '2024-09-20T10:00:00.000Z' },
          ],
          projects: [
            { id: p1, clientId: c1, title: 'Refonte identité visuelle', status: 'delivered', rate: 2400, currency: 'EUR', dueDate: '2024-10-31', description: 'Logo, charte graphique, carte de visite.', createdAt: '2024-09-01T10:00:00.000Z' },
            { id: p2, clientId: c2, title: 'Site e-commerce', status: 'in_progress', rate: 3800, currency: 'EUR', dueDate: '2024-12-15', description: 'Boutique en ligne avec paiement Stripe.', createdAt: '2024-10-01T10:00:00.000Z' },
            { id: p3, clientId: c5, title: 'Site vitrine Restaurant Lumière', status: 'todo', rate: 1200, currency: 'EUR', dueDate: '2024-11-30', description: 'Site one-page + menu digital QR code.', createdAt: '2024-09-20T10:00:00.000Z' },
          ],
          transactions: [
            { id: uuid(), projectId: p1, type: 'income', amount: 1200, description: 'Acompte 50% — Refonte identité visuelle (Sophie Martin)', date: '2024-09-05', createdAt: '2024-09-05T10:00:00.000Z' },
            { id: uuid(), projectId: p1, type: 'income', amount: 1200, description: 'Solde — Refonte identité visuelle (Sophie Martin)', date: '2024-10-28', createdAt: '2024-10-28T10:00:00.000Z' },
            { id: uuid(), projectId: p2, type: 'income', amount: 1900, description: 'Acompte 50% — Site e-commerce (TechStart)', date: '2024-10-03', createdAt: '2024-10-03T10:00:00.000Z' },
            { id: uuid(), projectId: null, type: 'expense', amount: 49, description: 'Abonnement Adobe Creative Cloud', date: '2024-10-01', createdAt: '2024-10-01T10:00:00.000Z' },
            { id: uuid(), projectId: null, type: 'expense', amount: 120, description: 'Hébergement serveur annuel', date: '2024-09-15', createdAt: '2024-09-15T10:00:00.000Z' },
          ],
        })
      },
    }),
    { name: 'freelance-hub-data' }
  )
)
