import { money } from "../../lib/format.js";
import { statusPillClass } from "../../lib/statusStyles.js";
import { Button } from "../ui/Button.jsx";

const idOf = (value) => (typeof value === "object" && value ? value._id : value);

export function Agent({ bookings, profileId, loadBookings, updateBooking }) {
  const assignedBookings = bookings.filter((booking) => String(idOf(booking.agentId) || "") === String(profileId || ""));
  const completedBookings = assignedBookings.filter((booking) => booking.status === "COMPLETED");
  const walletIncome = completedBookings.reduce(
    (total, booking) => total + Number(booking.earningBreakdown?.agentIncome || 0),
    0,
  );
  const gstCut = completedBookings.reduce(
    (total, booking) => total + Number(booking.earningBreakdown?.gstAmount || 0),
    0,
  );
  const platformCut = completedBookings.reduce(
    (total, booking) => total + Number(booking.earningBreakdown?.platformFee || 0),
    0,
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Agent dashboard</h2>
          <p className="mt-1 text-slate-600">Accept, run, and complete assigned jobs.</p>
        </div>
        <Button variant="secondary" type="button" onClick={loadBookings}>
          Refresh
        </Button>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">Wallet income</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{money(walletIncome)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Services repaired</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{completedBookings.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">GST cut</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{money(gstCut)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Platform cut</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{money(platformCut)}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {bookings.length ? (
          bookings.map((booking) => {
            const assignedAgentId = idOf(booking.agentId);
            const assignedToCurrentAgent = String(assignedAgentId || "") === String(profileId || "");
            const availableToAccept = booking.status === "PENDING" && !assignedAgentId;

            return (
              <div
                key={booking._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <strong className="text-lg text-slate-900">
                    {booking.serviceName || booking.serviceId?.categoryName || "Service"}
                  </strong>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.variantName || "Variant"} for {booking.customerId?.fullName || "Customer"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={statusPillClass(availableToAccept ? "PENDING" : booking.status)}>
                    {availableToAccept ? "AVAILABLE" : booking.status}
                  </span>
                  {availableToAccept && (
                    <Button variant="primary" type="button" onClick={() => updateBooking(booking._id, "accept", { agentId: profileId })}>
                      Accept
                    </Button>
                  )}
                  {assignedToCurrentAgent && booking.status === "ACCEPTED" && (
                    <Button variant="primary" type="button" onClick={() => updateBooking(booking._id, "start")}>
                      Start
                    </Button>
                  )}
                  {assignedToCurrentAgent && booking.status === "ONGOING" && (
                    <Button variant="primary" type="button" onClick={() => updateBooking(booking._id, "complete")}>
                      Complete
                    </Button>
                  )}
                  {assignedToCurrentAgent && ["ACCEPTED", "ONGOING"].includes(booking.status) && (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => updateBooking(booking._id, "cancel", { cancelReason: "Cancelled by agent" })}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500">No bookings available.</div>
        )}
      </div>

      <div className="mt-10">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Income history</h3>
          <p className="mt-1 text-sm text-slate-500">Completed services with payment, cuts, and final agent income.</p>
        </div>
        <div className="grid gap-3">
          {completedBookings.length ? (
            completedBookings.map((booking) => (
              <div
                key={`history-${booking._id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <strong className="text-base text-slate-900">
                      {booking.serviceName || booking.serviceId?.categoryName || "Service"}
                    </strong>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.variantName || "Variant"} for {booking.customerId?.fullName || "Customer"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Completed {booking.completedAt ? new Date(booking.completedAt).toLocaleDateString("en-IN") : booking.bookingDate}
                    </p>
                  </div>
                  <div className="grid min-w-64 gap-1 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                      <span>Payment</span>
                      <strong className="text-slate-900">{money(booking.earningBreakdown?.grossAmount || booking.price)}</strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>GST cut</span>
                      <span>{money(booking.earningBreakdown?.gstAmount)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Platform cut</span>
                      <span>{money(booking.earningBreakdown?.platformFee)}</span>
                    </div>
                    <div className="mt-2 flex justify-between gap-4 border-t border-slate-100 pt-2 font-bold text-emerald-700">
                      <span>Agent income</span>
                      <span>{money(booking.earningBreakdown?.agentIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
              No completed service income yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
