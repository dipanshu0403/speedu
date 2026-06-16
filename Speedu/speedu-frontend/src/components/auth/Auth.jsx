import { Settings, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { Field } from "../ui/Field.jsx";

export function Auth({ authMode, setAuthMode, role, setRole, mobile, loading, submitAuth, submitAdminLogin }) {
  const isAdmin = role === "admin";

  useEffect(() => {
    if (authMode === "signup" && isAdmin) setRole("customer");
  }, [authMode, isAdmin, setRole]);

  return (
    <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-slate-900">{authMode === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {isAdmin ? "Sign in with admin credentials." : "Enter your mobile number and choose your role."}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`rounded-lg py-2.5 text-sm font-bold transition ${
              authMode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setAuthMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-lg py-2.5 text-sm font-bold transition ${
              authMode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setAuthMode("signup")}
          >
            Signup
          </button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={isAdmin ? submitAdminLogin : submitAuth}>
          <Field label="Role">
            <select name="role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              {authMode === "login" && <option value="admin">Admin</option>}
            </select>
          </Field>
          {isAdmin ? (
            <>
              <Field label="Admin email">
                <input type="email" name="email" placeholder="admin@speedu.com" required />
              </Field>
              <Field label="Password">
                <input type="password" name="password" placeholder="Password" required />
              </Field>
            </>
          ) : (
            <Field label="Mobile">
              <input name="mobile" defaultValue={mobile} maxLength="10" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile" required />
            </Field>
          )}
          <Button variant="primary" className="w-full" disabled={loading} type="submit">
            {isAdmin ? (
              <>
                <Settings className="h-4 w-4" aria-hidden />
                Sign in as admin
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
        {!isAdmin && (
          <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            Your number is used only for secure login with OTP.
          </p>
        )}
      </Card>
    </main>
  );
}
