import { Button } from "../ui/Button.jsx";
  import { Card } from "../ui/Card.jsx";
  import { Field } from "../ui/Field.jsx";
  import { titleCase } from "../../lib/format.js";

  export function Profile({ role, loading, submitProfile, userInfo, isUpdate, services = [] }) {
    const selectedServiceIds = new Set((userInfo?.services || []).map((service) => String(service?._id || service)));

    return (
      <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {isUpdate ? "Update Profile" : (role === "agent" ? "Agent profile" : "Customer profile")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isUpdate ? "Update your profile information." : "Complete your profile to continue using Speedu."}
          </p>
          <form className="mt-6 grid gap-4" onSubmit={submitProfile}>
            <Field label="Full name">
              <input name="fullName" required defaultValue={userInfo?.fullName || ""} />
            </Field>
            <Field label="Email">
              <input type="email" name="email" defaultValue={userInfo?.email || ""} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Gender">
                <select name="gender" required defaultValue={userInfo?.gender || "male"}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </Field>
              <Field label="Date of birth">
                <input type="date" name="dob" defaultValue={userInfo?.dob || ""} />
              </Field>
            </div>
            {role === "agent" && (
              <Field label="Services you can do">
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
                  {services.length ? services.map((service) => (
                    <label key={service._id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        name="services"
                        value={service._id}
                        defaultChecked={selectedServiceIds.has(String(service._id))}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>{titleCase(service.categoryName || "Service")}</span>
                    </label>
                  )) : (
                    <p className="col-span-full text-sm text-slate-500">Admin panel se services add karo, fir agent profile complete hogi.</p>
                  )}
                </div>
              </Field>
            )}
            <Button variant="primary" disabled={loading} type="submit">
              {isUpdate ? "Update profile" : "Save profile"}
            </Button>
          </form>
        </Card>
      </main>
    );
  }
  
