import { LogOut, Phone, Sparkles, User, Edit } from "lucide-react";
  import { useState } from "react";
  import { Button } from "../ui/Button.jsx";

  export function Navbar({ token, role, go, logout, userName, userInfo, goUpdateProfile }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
            <Button variant="nav" onClick={() => go("home")}>Services</Button>
            <Button variant="nav" onClick={() => go("admin")}>Admin</Button>
            {token && role === "customer" && (
              <Button variant="nav" onClick={() => go("bookings")}>My bookings</Button>
            )}
            {token && role === "agent" && (
              <Button variant="nav" onClick={() => go("agent")}>Dashboard</Button>
            )}
            {token && (
              <Button variant="nav" onClick={() => go("address")}>Address</Button>
            )}

            {token ? (
              <div className="relative ml-1">
                {/* Only first letter circle - no name text */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 transition-all"
                  title={userName || "Profile"}
                >
                  {userName ? userName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                      {/* User info header */}
                      <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                          {userName ? userName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{userName || "User"}</p>
                          <p className="text-xs text-slate-500 capitalize">{role}</p>
                        </div>
                      </div>

                      {/* User details */}
                      {userInfo?.mobile && (
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-500">Mobile</span>
                          <span className="font-medium text-slate-700">{userInfo.mobile}</span>
                        </div>
                      )}
                      {userInfo?.email && (
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-500">Email</span>
                          <span className="font-medium text-slate-700">{userInfo.email}</span>
                        </div>
                      )}
                      {userInfo?.gender && (
                        <div className="mb-1 flex justify-between text-sm capitalize">
                          <span className="text-slate-500">Gender</span>
                          <span className="font-medium text-slate-700">{userInfo.gender}</span>
                        </div>
                      )}
                      {userInfo?.dob && (
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-500">Date of Birth</span>
                          <span className="font-medium text-slate-700">{userInfo.dob}</span>
                        </div>
                      )}

                      {/* Update Profile button */}
                      <button
                        type="button"
                        onClick={() => { setDropdownOpen(false); goUpdateProfile(); }}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
                      >
                        <Edit className="h-4 w-4" />
                        Update Profile
                      </button>

                      {/* Logout button */}
                      <button
                        type="button"
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
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
  