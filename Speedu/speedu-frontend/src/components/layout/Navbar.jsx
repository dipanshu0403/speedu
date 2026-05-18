import { LogOut, Phone, Sparkles } from "lucide-react";
import { Button } from "../ui/Button.jsx";

export function Navbar({ token, role, go, logout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => go("home")}
          className="inline-flex items-center gap-3 rounded-xl border-0 bg-transparent text-left text-lg font-extrabold tracking-tight text-slate-900"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span>Speedu</span>
            <span className="text-xs font-medium text-slate-500">Home services, simplified</span>
          </span>
        </button>
        <nav className="flex flex-wrap items-center gap-2">
          <Button variant="nav" onClick={() => go("home")}>
            Services
          </Button>
          <Button variant="nav" onClick={() => go("admin")}>
            Admin
          </Button>
          {token && role === "customer" && (
            <Button variant="nav" onClick={() => go("bookings")}>
              My bookings
            </Button>
          )}
          {token && role === "agent" && (
            <Button variant="nav" onClick={() => go("agent")}>
              Dashboard
            </Button>
          )}
          {token && (
            <Button variant="nav" onClick={() => go("address")}>
              Address
            </Button>
          )}
          {token ? (
            <Button variant="secondary" className="ml-1" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </Button>
          ) : (
            <Button variant="primary" className="ml-1" onClick={() => go("auth")}>
              <Phone className="h-4 w-4" aria-hidden />
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
