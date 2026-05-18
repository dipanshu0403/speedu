import { statusPillClass } from "../../lib/statusStyles.js";
import { Button } from "../ui/Button.jsx";

export function Agent({ bookings, profileId, loadBookings, updateBooking }) {
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
      <div className="grid gap-3">
        {bookings.length ? (
          bookings.map((booking) => (
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
                <span className={statusPillClass(booking.status)}>{booking.status}</span>
                {booking.status === "PENDING" && (
                  <Button variant="primary" type="button" onClick={() => updateBooking(booking._id, "accept", { agentId: profileId })}>
                    Accept
                  </Button>
                )}
                {booking.status === "ACCEPTED" && (
                  <Button variant="primary" type="button" onClick={() => updateBooking(booking._id, "start")}>
                    Start
                  </Button>
                )}
                {booking.status === "ONGOING" && (
                  <Button variant="primary" type="button" onClick={() => updateBooking(booking._id, "complete")}>
                    Complete
                  </Button>
                )}
                {["PENDING", "ACCEPTED"].includes(booking.status) && (
                  <Button variant="secondary" type="button" onClick={() => updateBooking(booking._id, "reject")}>
                    Reject
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500">No assigned bookings.</div>
        )}
      </div>
    </section>
  );
}
