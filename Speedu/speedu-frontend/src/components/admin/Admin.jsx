import { ClipboardList, CreditCard, IndianRupee, LogOut, Plus, Settings, Trash2, Wrench } from "lucide-react";
import { money, titleCase } from "../../lib/format.js";
import { statusPillClass } from "../../lib/statusStyles.js";
import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { Field } from "../ui/Field.jsx";

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <strong className="mt-1 block text-2xl font-black text-slate-900">{value}</strong>
    </div>
  );
}

export function Admin({
  services,
  bookings,
  payments,
  loading,
  createService,
  createVariant,
  removeService,
  removeVariant,
  loadAdminData,
  logoutAdmin,
}) {
  const revenue = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin control</h2>
          <p className="mt-1 text-slate-600">Services, variants, bookings, and payments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={() => loadAdminData()}>
            <Settings className="h-4 w-4" aria-hidden />
            Refresh data
          </Button>
          <Button variant="danger" type="button" onClick={logoutAdmin}>
            <LogOut className="h-4 w-4" aria-hidden />
            Admin logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Wrench className="h-5 w-5" />} label="Services" value={services.length} />
        <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Bookings" value={bookings.length} />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="Payments" value={payments.length} />
        <StatCard icon={<IndianRupee className="h-5 w-5" />} label="Revenue" value={money(revenue)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h3 className="text-lg font-bold text-slate-900">Create service</h3>
          <form className="mt-4 grid gap-4" onSubmit={createService}>
            <Field label="Service name">
              <input name="categoryName" placeholder="e.g. Electrician" maxLength="60" required />
            </Field>
            <Button variant="primary" disabled={loading} type="submit">
              <Plus className="h-4 w-4" aria-hidden />
              Add service
            </Button>
          </form>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-900">Create variant</h3>
          <form className="mt-4 grid gap-4" onSubmit={createVariant}>
            <Field label="Service">
              <select name="serviceId" required>
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {titleCase(service.categoryName)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Variant name">
                <input name="variantName" placeholder="Fan repair" maxLength="80" required />
              </Field>
              <Field label="Price (₹)">
                <input type="number" name="variantPrice" min="1" step="1" placeholder="199" required />
              </Field>
            </div>
            <Button variant="primary" disabled={loading} type="submit">
              <Plus className="h-4 w-4" aria-hidden />
              Add variant
            </Button>
          </form>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-900">Services & variants</h3>
          <div className="mt-4 grid max-h-[480px] gap-3 overflow-y-auto pr-1">
            {services.length ? (
              services.map((service) => (
                <div key={service._id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-slate-900">{titleCase(service.categoryName)}</strong>
                    <button
                      type="button"
                      title="Remove service"
                      aria-label={`Remove ${service.categoryName}`}
                      disabled={loading}
                      className="inline-grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => removeService(service)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.variants?.length ? (
                      service.variants.map((variant) => (
                        <span
                          key={variant._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                        >
                          <span>
                            {variant.variantName} — {money(variant.variantPrice)}
                          </span>
                          <button
                            type="button"
                            title="Remove variant"
                            aria-label={`Remove ${variant.variantName}`}
                            disabled={loading}
                            className="inline-grid h-7 w-7 place-items-center rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                            onClick={() => removeVariant(service, variant)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No variants</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">No services.</div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-900">Recent bookings</h3>
          <div className="mt-4 grid max-h-[480px] gap-2 overflow-y-auto">
            {bookings.slice(0, 8).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <div className="min-w-0">
                  <strong className="block truncate text-sm text-slate-900">
                    {booking.serviceName || booking.serviceId?.categoryName || "Service"}
                  </strong>
                  <p className="truncate text-xs text-slate-500">
                    {booking.variantName || "Variant"} — {money(booking.price)}
                  </p>
                </div>
                <span className={`shrink-0 ${statusPillClass(booking.status)}`}>{booking.status}</span>
              </div>
            ))}
            {!bookings.length && <div className="py-10 text-center text-sm text-slate-500">No bookings.</div>}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-slate-900">Payments</h3>
          <div className="mt-4 grid max-h-[480px] gap-2 overflow-y-auto">
            {payments.slice(0, 8).map((payment) => (
              <div key={payment._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <div className="min-w-0">
                  <strong className="text-sm text-slate-900">{money(payment.amount)}</strong>
                  <p className="truncate text-xs text-slate-500">
                    {payment.paymentMethod} — {payment.transactionId}
                  </p>
                </div>
                <span className={`shrink-0 ${statusPillClass(payment.paymentStatus)}`}>{payment.paymentStatus}</span>
              </div>
            ))}
            {!payments.length && <div className="py-10 text-center text-sm text-slate-500">No payments.</div>}
          </div>
        </Card>
      </div>
    </section>
  );
}
