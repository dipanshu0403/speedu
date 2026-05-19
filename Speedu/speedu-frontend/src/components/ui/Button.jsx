const variants = {
    primary:
      "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
    secondary:
      "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 shadow-sm",
    danger: "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-sm",
    ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none",
    nav: "border-transparent bg-transparent text-slate-600 hover:text-emerald-800 font-medium shadow-none px-3",
  };

  export function Button({ variant = "secondary", className = "", type = "button", children, ...props }) {
    const base =
      "inline-flex items-center justify-center gap-2 min-h-[42px] rounded-xl border px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none";
    return (
      <button type={type} className={`${base} ${variants[variant] || variants.secondary} ${className}`} {...props}>
        {children}
      </button>
    );
  }