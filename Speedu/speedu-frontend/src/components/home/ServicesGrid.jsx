import { Wrench } from "lucide-react";
import { titleCase } from "../../lib/format.js";

export function ServicesGrid({ services, openService }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-12">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Popular services</h2>
          <p className="mt-1 text-slate-600">Choose a category, pick a variant, and lock your visit time.</p>
        </div>
      </div>
      {services.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <button
              key={service._id}
              type="button"
              onClick={() => openService(service._id)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-300/80 hover:shadow-lift"
            >
              <div>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition group-hover:bg-emerald-100">
                  <Wrench className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold capitalize text-slate-900">
                  {titleCase(service.categoryName || "Service")}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{service.variants?.length || 0} variants available</p>
              </div>
              <span className="mt-6 text-sm font-bold text-emerald-700">View options →</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 py-16 text-center text-slate-500">
          No services found. Add services from the admin panel.
        </div>
      )}
    </section>
  );
}
