import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'

const features = [
  { key: 'feature1', icon: '👥' },
  { key: 'feature2', icon: '📋' },
  { key: 'feature3', icon: '💰' },
  { key: 'feature4', icon: '🔒' },
]

export default function Welcome() {
  const navigate = useNavigate()
  const { t, lang, setLanguage } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-base">FreelanceHub</span>
        </div>
        <button
          onClick={() => setLanguage(lang === 'en' ? 'fr' : 'en')}
          className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          {lang === 'en' ? '🇫🇷 Français' : '🇬🇧 English'}
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 ring-1 ring-indigo-500/30">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          100% local — no account needed
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 whitespace-pre-line max-w-3xl">
          {t('welcome.headline')}
        </h1>

        <p className="text-slate-300 text-lg max-w-xl mb-10 leading-relaxed">
          {t('welcome.sub')}
        </p>

        <button
          onClick={() => navigate('/app/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
        >
          {t('welcome.cta')} →
        </button>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl w-full">
          {features.map(({ key, icon }) => (
            <div key={key} className="bg-white/5 rounded-2xl p-5 text-left ring-1 ring-white/10 hover:bg-white/10 transition-colors">
              <span className="text-2xl mb-3 block">{icon}</span>
              <p className="text-white font-medium text-sm mb-1">{t(`welcome.${key}Title`)}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{t(`welcome.${key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-6 text-slate-600 text-xs">
        FreelanceHub · Digital product · Data stored locally in your browser
      </div>
    </div>
  )
}
