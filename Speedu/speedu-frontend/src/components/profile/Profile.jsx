import { Button } from "../ui/Button.jsx";
  import { Card } from "../ui/Card.jsx";
  import { Field } from "../ui/Field.jsx";

  export function Profile({ role, loading, submitProfile, userInfo, isUpdate }) {
    return (
      <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg p-8">
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
            <Button variant="primary" disabled={loading} type="submit">
              {isUpdate ? "Update profile" : "Save profile"}
            </Button>
          </form>
        </Card>
      </main>
    );
  }
  