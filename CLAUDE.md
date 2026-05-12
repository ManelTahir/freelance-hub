# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # production build to dist/
npm run preview   # preview production build locally
```

No test suite or linter is configured.

## Architecture

FreelanceHub is a **fully client-side** React SPA — no backend, no API calls. All data lives in `localStorage` via Zustand's `persist` middleware (storage key: `freelance-hub-v2`).

### State

[src/store/useStore.js](src/store/useStore.js) is the single source of truth. It holds all entities (clients, projects, invoices, proposals, transactions, timeEntries, recurringItems, deals, notes, settings) plus CRUD actions for each. Notable cross-entity action: `convertProposalToInvoice` creates an invoice from a proposal and links them via `fromProposalId` / `convertedToInvoiceId`.

All entities use `uuid` for IDs. Invoices auto-number as `INV-YYYY-NNN`; proposals as `PRO-YYYY-NNN`.

`importAll` / `exportAll` / `resetAll` operate on the full store. `loadDemoData` seeds realistic demo content.

### Routing

[src/App.jsx](src/App.jsx) uses React Router v6. `/` renders the Welcome page. All app pages live under `/app/*` inside the `<Layout>` shell (sidebar + `<Outlet>`). Unknown routes redirect to `/`.

### Theming

Theme is a CSS custom-property system defined in [src/index.css](src/index.css). The `[data-theme]` attribute on `<html>` switches accent colors. Layout sets this attribute reactively from `settings.theme`. Available themes: `indigo`, `violet`, `emerald`, `rose`, `amber`, `sky`. Always use CSS variables (`var(--accent)`, `var(--bg)`, `var(--t1)`, etc.) for colors — never hardcode hex values in component styles.

### i18n

[src/i18n/index.jsx](src/i18n/index.jsx) provides `<I18nProvider>` and the `useI18n()` hook. Language preference stored in `localStorage` under `fh-lang`. Translation files: [src/i18n/en.js](src/i18n/en.js) and [src/i18n/fr.js](src/i18n/fr.js). Access translations via `t('key.nested')`.

### UI conventions

- Inline styles are used extensively alongside Tailwind utility classes. New components should follow this hybrid pattern.
- Modals use the `.overlay` + `.modal` CSS classes from [src/index.css](src/index.css); reusable primitives are in [src/components/ui/](src/components/ui/).
- Badge variants (`.badge-green`, `.badge-red`, `.badge-blue`, etc.) are defined globally in [src/index.css](src/index.css).

### Export utilities

[src/utils/export.js](src/utils/export.js) provides `downloadJSON`, `downloadCSV`, and `downloadExcel` (via `xlsx` + `file-saver`). Used by Settings and Finance pages for data export.

### Deployment

Deployed to Vercel. [vercel.json](vercel.json) rewrites all routes to `/index.html` for SPA navigation.
