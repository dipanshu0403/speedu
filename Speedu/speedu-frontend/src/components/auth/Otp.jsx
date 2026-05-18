import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { Field } from "../ui/Field.jsx";

export function Otp({ mobile, otpHint, loading, verifyOtp }) {
  return (
    <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-slate-900">Verify OTP</h2>
        <p className="mt-2 text-sm text-slate-600">We sent a code to {mobile}.</p>
        {otpHint && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Development OTP: <strong>{otpHint}</strong>
          </div>
        )}
        <form className="mt-6 grid gap-4" onSubmit={verifyOtp}>
          <Field label="OTP">
            <input name="otp" maxLength="6" inputMode="numeric" placeholder="••••••" required />
          </Field>
          <Button variant="primary" className="w-full" disabled={loading} type="submit">
            Verify & continue
          </Button>
        </form>
      </Card>
    </main>
  );
}
