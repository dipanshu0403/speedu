const variants = {
    primary: "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm",
    danger: "bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-sm",
    ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none",
    nav: "border-transparent bg-transparent text-slate-600 hover:text-indigo-600 font-medium shadow-none px-3",
  };

  export function Button({ variant = "secondary", className = "", type = "button", children, ...props }) {
    const base =
      "inline-flex items-center justify-center gap-2 min-h-[42px] rounded-xl border px-4 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";
    return (
      <button type={type} className={`${base} ${variants[variant] || variants.secondary} ${className}`} {...props}>
        {children}
      </button>
    );
  }