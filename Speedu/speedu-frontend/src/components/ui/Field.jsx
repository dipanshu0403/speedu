export function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{label}</span>
      <div className="[&_input]:min-h-[44px] [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:transition [&_input]:focus:border-emerald-500 [&_input]:focus:ring-4 [&_input]:focus:ring-emerald-500/15 [&_select]:min-h-[44px] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:outline-none [&_select]:focus:border-emerald-500 [&_select]:focus:ring-4 [&_select]:focus:ring-emerald-500/15">
        {children}
      </div>
    </label>
  );
}
