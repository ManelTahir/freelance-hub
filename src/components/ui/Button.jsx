const variants = {
  primary: 'bg-[var(--clr-600)] text-white hover:bg-[var(--clr-700)] focus-visible:ring-[var(--clr-500)]',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
}

export default function Button({ children, variant = 'primary', className = '', size = 'md', ...props }) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  return (
    <button
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
