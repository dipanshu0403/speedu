import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Home,
  IndianRupee,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  UsersRound,
  WalletCards,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://speedu-backend-0xid.onrender.com/api";

const read = (key, fallback = "") => localStorage.getItem(key) || fallback;
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const titleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
const normalizeName = (value = "") => String(value || "").trim().replace(/\s+/g, " ");
const sameName = (left = "", right = "") => normalizeName(left).toLowerCase() === normalizeName(right).toLowerCase();

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

function App() {
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [role, setRole] = useState(read("speedu_role", "customer"));
  const [mobile, setMobile] = useState("");
  const [token, setToken] = useState(read("speedu_access_token"));
  const [refreshToken, setRefreshToken] = useState(read("speedu_refresh_token"));
  const [adminToken, setAdminToken] = useState(read("speedu_admin_access_token"));
  const [adminEmail, setAdminEmail] = useState(read("speedu_admin_email"));
  const [userId, setUserId] = useState(read("speedu_user_id"));
  const [profileId, setProfileId] = useState(read("speedu_profile_id"));
  const [profileType, setProfileType] = useState(read("speedu_profile_type"));
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("speedu_addresses") || "[]");
    } catch {
      return [];
    }
  });
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [agentBookings, setAgentBookings] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [draftBooking, setDraftBooking] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [otpHint, setOtpHint] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const filteredServices = useMemo(
    () => services.filter((item) => (item.categoryName || "").toLowerCase().includes(search.toLowerCase())),
    [services, search]
  );

  async function api(path, options = {}) {
    const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) throw new Error(data.message || "Request failed");
    return data;
  }

  async function adminApi(path, options = {}, tokenOverride = adminToken) {
    const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
    if (tokenOverride) headers.Authorization = `Bearer ${tokenOverride}`;

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) throw new Error(data.message || "Admin request failed");
    return data;
  }

  function flash(text, type = "success") {
    if (!text) return;
    const id = `${Date.now()}-${Math.random()}`;
    setMessage("");
    setError("");
    setToasts((current) => [...current, { id, text, type }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function saveSession(data) {
    const payload = decodeJwt(data.accessToken || "");
    const nextToken = data.accessToken || "";
    const nextRefresh = data.refreshToken || "";
    const nextRole = data.role || role;
    const nextUserId = data.userId || payload.userId || payload.id || "";

    setToken(nextToken);
    setRefreshToken(nextRefresh);
    setRole(nextRole);
    setUserId(nextUserId);
    localStorage.setItem("speedu_access_token", nextToken);
    localStorage.setItem("speedu_refresh_token", nextRefresh);
    localStorage.setItem("speedu_role", nextRole);
    localStorage.setItem("speedu_user_id", nextUserId);
  }

  function saveProfile(id, type) {
    setProfileId(id || "");
    setProfileType(type || "");
    localStorage.setItem("speedu_profile_id", id || "");
    localStorage.setItem("speedu_profile_type", type || "");
  }

  function saveAddresses(nextAddresses) {
    const cleanAddresses = nextAddresses || [];
    setAddresses(cleanAddresses);
    localStorage.setItem("speedu_addresses", JSON.stringify(cleanAddresses));
  }

  function logout() {
    [
      "speedu_access_token",
      "speedu_refresh_token",
      "speedu_role",
      "speedu_mobile",
      "speedu_user_id",
      "speedu_profile_id",
      "speedu_profile_type",
      "speedu_addresses",
    ].forEach((key) => localStorage.removeItem(key));
    location.reload();
  }

  function logoutAdmin() {
    localStorage.removeItem("speedu_admin_access_token");
    localStorage.removeItem("speedu_admin_refresh_token");
    localStorage.removeItem("speedu_admin_email");
    setAdminToken("");
    setAdminEmail("");
    setView("home");
  }

  async function loadServices() {
    try {
      const result = await api("/service/getService");
      setServices(result.data || []);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function loadBookings() {
    if (!profileId) return;
    try {
      const path = role === "agent" ? `/booking/agent/${profileId}` : `/booking/customer/${profileId}`;
      const result = await api(path);
      if (role === "agent") setAgentBookings(result.data || []);
      else setBookings(result.data || []);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function loadAdminData(tokenOverride = adminToken) {
    try {
      const [bookingResult, paymentResult] = await Promise.all([
        adminApi("/booking/all", {}, tokenOverride),
        adminApi("/payment/all", {}, tokenOverride),
        loadServices(),
      ]);
      setAdminBookings(bookingResult.data || []);
      setPayments(paymentResult.data || []);
    } catch (err) {
      flash(err.message, "error");
    }
  }

  async function go(nextView) {
    setMessage("");
    setError("");
    setView(nextView);
    if (nextView === "admin" && !adminToken) {
      setView("adminLogin");
      return;
    }
    if (nextView === "home") await loadServices();
    if (nextView === "bookings" || nextView === "agent") await loadBookings();
    if (nextView === "admin") await loadAdminData();
  }

  async function createService(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const categoryName = normalizeName(new FormData(formElement).get("categoryName"));
    if (!categoryName) {
      flash("Service name required hai.", "error");
      return;
    }
    if (services.some((service) => sameName(service.categoryName, categoryName))) {
      flash(`${categoryName} service already exists. Duplicate service add nahi hogi.`, "error");
      return;
    }
    try {
      setLoading(true);
      await adminApi("/service/createService", {
        method: "POST",
        body: JSON.stringify({ categoryName }),
      });
      formElement.reset();
      await loadServices();
      flash("Service created successfully.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function createVariant(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const serviceId = form.get("serviceId");
    const variantName = normalizeName(form.get("variantName"));
    const variantPrice = Number(form.get("variantPrice"));
    const service = services.find((item) => item._id === serviceId);
    if (!serviceId || !service) {
      flash("Pehle service select karo.", "error");
      return;
    }
    if (!variantName) {
      flash("Variant name required hai.", "error");
      return;
    }
    if (!Number.isFinite(variantPrice) || variantPrice <= 0) {
      flash("Variant price 0 se zyada hona chahiye.", "error");
      return;
    }
    if ((service.variants || []).some((variant) => sameName(variant.variantName, variantName))) {
      flash(`${variantName} variant ${service.categoryName} me already exists. Duplicate variant add nahi hoga.`, "error");
      return;
    }
    try {
      setLoading(true);
      await adminApi(`/service/${serviceId}/variant`, {
        method: "POST",
        body: JSON.stringify({ variantName, variantPrice }),
      });
      formElement.reset();
      await loadServices();
      flash("Variant created successfully.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function removeFromAdminApi(paths, successText, missingText) {
    const attempts = [];

    for (const path of paths) {
      try {
        const data = await adminApi(path, { method: "DELETE" });
        if (data.success !== false) {
          await loadServices();
          flash(successText);
          return;
        }
      } catch (err) {
        attempts.push(`${path}: ${err.message}`);
        if (!/not found|cannot|route|404|method/i.test(err.message)) throw err;
      }
    }

    throw new Error(`${missingText} Tried: ${attempts.join(", ")}`);
  }

  async function removeService(service) {
    if (!service?._id) return;
    const serviceName = titleCase(service.categoryName || "service");
    if (!window.confirm(`${serviceName} service remove karni hai? Iske variants bhi remove ho sakte hain.`)) return;
    try {
      setLoading(true);
      await removeFromAdminApi(
        [`/service/deleteServiceById/${service._id}`, `/service/${service._id}`, `/service/deleteService/${service._id}`, `/service/delete/${service._id}`],
        `${serviceName} service removed.`,
        "Backend me service delete route nahi mila."
      );
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function removeVariant(service, variant) {
    if (!service?._id || !variant?._id) return;
    const variantName = titleCase(variant.variantName || "variant");
    if (!window.confirm(`${variantName} variant remove karna hai?`)) return;
    try {
      setLoading(true);
      await removeFromAdminApi(
        [
          `/service/${service._id}/variant/${variant._id}`,
          `/service/${service._id}/variant/delete/${variant._id}`,
          `/service/variant/${variant._id}`,
          `/service/deleteVariant/${variant._id}`,
        ],
        `${variantName} variant removed.`,
        "Backend me variant delete route nahi mila."
      );
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextMobile = form.get("mobile").trim();
    const nextRole = form.get("role");
    setMobile(nextMobile);
    setRole(nextRole);
    localStorage.setItem("speedu_mobile", nextMobile);
    localStorage.setItem("speedu_role", nextRole);

    try {
      setLoading(true);
      const result = await api(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify({ mobile: nextMobile, role: nextRole }),
      });
      setOtpHint(result.data?.otp || "");
      setView("otp");
      flash("OTP sent successfully.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitAdminLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email").trim();
    const password = form.get("password");

    try {
      setLoading(true);
      const result = await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = result.data || {};
      setAdminToken(data.accessToken || "");
      setAdminEmail(data.email || email);
      localStorage.setItem("speedu_admin_access_token", data.accessToken || "");
      localStorage.setItem("speedu_admin_refresh_token", data.refreshToken || "");
      localStorage.setItem("speedu_admin_email", data.email || email);
      setView("admin");
      await loadAdminData(data.accessToken);
      flash("Admin login successful.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    const otp = new FormData(event.currentTarget).get("otp").trim();
    try {
      setLoading(true);
      const result = await api("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile, role, otp }),
      });
      saveSession(result.data || {});
      const completed = result.data?.isProfileCompleted && profileId && profileType === role;
      const nextView = completed ? (role === "agent" ? "agent" : "home") : "profile";
      setView(nextView);
      if (nextView === "home") await loadServices();
      if (nextView === "agent") await loadBookings();
      flash("Login successful.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile(event) {
    event.preventDefault();
    if (!userId) {
      flash("We could not connect your profile after login. Please make sure the backend returns user details after OTP verification.", "error");
      return;
    }

    try {
      setLoading(true);
      const path = role === "agent" ? `/agent/agentProfile/${userId}` : `/customer/profile/${userId}`;
      const result = await api(path, { method: "POST", body: new FormData(event.currentTarget) });
      saveProfile(result.data?._id, role);
      const nextView = role === "agent" ? "agent" : "home";
      setView(nextView);
      if (nextView === "home") await loadServices();
      flash("Profile saved successfully.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function addAddress(event) {
    event.preventDefault();
    if (!profileId) {
      flash("Please complete your profile first.", "error");
      return;
    }

    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const path = role === "agent" ? `/agent/agentAddresses/${profileId}` : `/customer/addresses/${profileId}`;
    try {
      setLoading(true);
      const result = await api(path, { method: "POST", body: JSON.stringify(body) });
      const nextAddresses = result.data || [];
      saveAddresses(nextAddresses);
      event.currentTarget.reset();
      flash("Address saved successfully.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function openService(serviceId) {
    try {
      setLoading(true);
      const result = await api(`/service/getServiceById/${serviceId}`);
      setSelectedService(result.data);
      setSelectedVariant(null);
      setView("service");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function createBooking(event) {
    event.preventDefault();
    if (!selectedVariant) {
      flash("Please select a service variant first.", "error");
      return;
    }

    const form = new FormData(event.currentTarget);
    let addressId = form.get("savedAddressId");

    if (!addressId) {
      const addressBody = {
        line1: form.get("line1"),
        line2: form.get("line2"),
        city: form.get("city"),
        state: form.get("state"),
        pincode: form.get("pincode"),
      };

      if (!addressBody.line1 || !addressBody.city || !addressBody.state || !addressBody.pincode) {
        flash("Please select a saved address or enter a new address.", "error");
        return;
      }

      const addressResult = await api(`/customer/addresses/${profileId}`, {
        method: "POST",
        body: JSON.stringify(addressBody),
      });
      const nextAddresses = addressResult.data || [];
      saveAddresses(nextAddresses);
      addressId = nextAddresses.at(-1)?._id;
    }

    if (!addressId) {
      flash("We could not save your address. Please try again.", "error");
      return;
    }

    const body = {
      customerId: profileId,
      serviceId: selectedService._id,
      variantId: selectedVariant._id,
      bookingDate: form.get("bookingDate"),
      bookingTime: form.get("bookingTime"),
      addressId,
    };

    try {
      setLoading(true);
      const result = await api("/booking/create", { method: "POST", body: JSON.stringify(body) });
      setDraftBooking(result.data);
      setView("payment");
      flash("Booking created. Please complete the payment.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function createPayment(event) {
    event.preventDefault();
    try {
      setLoading(true);
      const result = await api("/payment/create", {
        method: "POST",
        body: JSON.stringify({
          bookingId: draftBooking._id,
          customerId: profileId,
          paymentMethod: new FormData(event.currentTarget).get("paymentMethod"),
        }),
      });
      setPaymentResult(result.data);
      setView("paymentSuccess");
      await loadBookings();
      flash("Payment successful.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function updateBooking(bookingId, action, payload = {}) {
    try {
      setLoading(true);
      await api(`/booking/${action}/${bookingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      await loadBookings();
      flash("Booking updated.");
    } catch (err) {
      flash(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div className="app-shell">
      <Header token={token} role={role} go={go} logout={logout} />
      <ToastHost toasts={toasts} dismissToast={dismissToast} />
      {view === "home" && (
        <HomeView
          search={search}
          setSearch={setSearch}
          services={filteredServices}
          openService={openService}
          loadServices={loadServices}
          message={message}
          error={error}
        />
      )}
      {view === "auth" && (
        <AuthView
          authMode={authMode}
          setAuthMode={setAuthMode}
          role={role}
          mobile={mobile}
          loading={loading}
          submitAuth={submitAuth}
          message={message}
          error={error}
        />
      )}
      {view === "otp" && <OtpView mobile={mobile} otpHint={otpHint} loading={loading} verifyOtp={verifyOtp} message={message} error={error} />}
      {view === "adminLogin" && <AdminLoginView loading={loading} submitAdminLogin={submitAdminLogin} message={message} error={error} />}
      {view === "profile" && <ProfileView role={role} loading={loading} submitProfile={submitProfile} message={message} error={error} />}
      {view === "address" && <AddressView addresses={addresses} loading={loading} addAddress={addAddress} message={message} error={error} />}
      {view === "service" && (
        <ServiceView
          service={selectedService}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          addresses={addresses}
          token={token}
          role={role}
          go={go}
          createBooking={createBooking}
          message={message}
          error={error}
        />
      )}
      {view === "payment" && <PaymentView booking={draftBooking} loading={loading} createPayment={createPayment} message={message} error={error} />}
      {view === "paymentSuccess" && <PaymentSuccessView payment={paymentResult} go={go} message={message} error={error} />}
      {view === "bookings" && <BookingsView bookings={bookings} loadBookings={loadBookings} updateBooking={updateBooking} message={message} error={error} />}
      {view === "agent" && (
        <AgentView
          bookings={agentBookings}
          profileId={profileId}
          loadBookings={loadBookings}
          updateBooking={updateBooking}
          message={message}
          error={error}
        />
      )}
      {view === "admin" && (
        <AdminView
          services={services}
          bookings={adminBookings}
          payments={payments}
          loading={loading}
          createService={createService}
          createVariant={createVariant}
          removeService={removeService}
          removeVariant={removeVariant}
          loadAdminData={loadAdminData}
          adminEmail={adminEmail}
          logoutAdmin={logoutAdmin}
          message={message}
          error={error}
        />
      )}
    </div>
  );
}

function Header({ token, role, go, logout }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => go("home")}>
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        <span>Speedu</span>
      </button>
      <nav className="nav">
        <button onClick={() => go("home")}>Services</button>
        <button onClick={() => go("admin")}>Admin</button>
        {token && role === "customer" && <button onClick={() => go("bookings")}>My bookings</button>}
        {token && role === "agent" && <button onClick={() => go("agent")}>Dashboard</button>}
        {token && <button onClick={() => go("address")}>Address</button>}
        {token ? (
          <button className="btn secondary" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        ) : (
          <button className="btn primary" onClick={() => go("auth")}>
            <Phone size={17} /> Login
          </button>
        )}
      </nav>
    </header>
  );
}

function Alerts({ message, error }) {
  return null;
}

function ToastHost({ toasts, dismissToast }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type === "error" ? "error" : "success"}`} key={toast.id}>
          <span className="toast-icon">{toast.type === "error" ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}</span>
          <span className="toast-text">{toast.text}</span>
          <button className="toast-close" type="button" onClick={() => dismissToast(toast.id)} aria-label="Close notification">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function HomeView({ search, setSearch, services, openService, loadServices, message, error }) {
  return (
    <main>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={17} /> Trusted home services
          </div>
          <h1>Home services, booked without stress.</h1>
          <p>Speedu customers can find nearby agents for repairs, cleaning, maintenance and everyday home work.</p>
          <div className="search">
            <Search size={20} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search electrician, cleaning, plumber" />
            <button className="btn primary" onClick={loadServices}>
              Refresh
            </button>
          </div>
        </div>
        <div className="hero-art" />
      </section>
      <section className="section">
        <Alerts message={message} error={error} />
        <div className="section-head">
          <div>
            <h2>Popular services</h2>
            <p>Choose a service, pick a variant, and book a time slot.</p>
          </div>
        </div>
        {services.length ? (
          <div className="grid">
            {services.map((service) => (
              <button className="service-card" key={service._id} onClick={() => openService(service._id)}>
                <span className="service-icon">
                  <Wrench size={24} />
                </span>
                <div>
                  <h3>{titleCase(service.categoryName || "Service")}</h3>
                  <p>{service.variants?.length || 0} variants available</p>
                </div>
                <strong>View options</strong>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">No services found. Add services from the admin panel.</div>
        )}
      </section>
      <WhyChooseUs />
      <ContactSection />
      <Footer go={openService} services={services} />
    </main>
  );
}

function WhyChooseUs() {
  const items = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Verified professionals",
      text: "Agent profiles, addresses, and availability make service assignment simple.",
    },
    {
      icon: <CalendarDays size={24} />,
      title: "Fast booking",
      text: "Customers can choose a service, variant, time slot, and address in one flow.",
    },
    {
      icon: <WalletCards size={24} />,
      title: "Easy payment",
      text: "COD and online payment options keep payment status easy to track.",
    },
    {
      icon: <UsersRound size={24} />,
      title: "Customer + agent app",
      text: "Customer bookings and the agent dashboard are available in one frontend.",
    },
  ];

  return (
    <section className="section feature-band">
      <div className="section-head">
        <div>
          <h2>Why choose Speedu</h2>
          <p>Simple, practical and built around your current backend APIs.</p>
        </div>
      </div>
      <div className="feature-grid">
        {items.map((item) => (
          <div className="feature" key={item.title}>
            <span className="feature-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="section">
      <div className="contact-strip">
        <div>
          <h2>Need help with a booking?</h2>
          <p>Customers and agents can reach Speedu support for booking, payment or profile issues.</p>
        </div>
        <div className="contact-actions">
          <a className="btn primary" href="tel:+919876543210"><Phone size={17} /> Call support</a>
          <a className="btn secondary" href="mailto:support@speedu.in"><Mail size={17} /> Email us</a>
        </div>
      </div>
    </section>
  );
}

function Footer({ services, go }) {
  return (
    <footer className="footer">
      <div>
        <div className="brand footer-brand">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Speedu</span>
        </div>
        <p>Reliable home service booking for customers and agents.</p>
      </div>
      <div>
        <h3>Services</h3>
        {services.slice(0, 5).map((service) => (
          <button key={service._id} onClick={() => go(service._id)}>{titleCase(service.categoryName)}</button>
        ))}
      </div>
      <div>
        <h3>Contact</h3>
        <p>support@speedu.in</p>
        <p>+91 xxxxx-xxxxx</p>
      </div>
    </footer>
  );
}

function AuthView({ authMode, setAuthMode, role, mobile, loading, submitAuth, message, error }) {
  return (
    <main className="auth-wrap">
      <section className="card auth-panel">
        <Alerts message={message} error={error} />
        <h2>{authMode === "login" ? "Login" : "Signup"}</h2>
        <p className="muted">Enter your mobile number and select your role.</p>
        <div className="tabs">
          <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
            Login
          </button>
          <button className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>
            Signup
          </button>
        </div>
        <form className="form" onSubmit={submitAuth}>
          <Field label="Mobile">
            <input name="mobile" defaultValue={mobile} maxLength="10" pattern="[6-9][0-9]{9}" placeholder="Enter mobile number" required />
          </Field>
          <Field label="Role">
            <select name="role" defaultValue={role}>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </select>
          </Field>
          <button className="btn primary" disabled={loading}>
            Send OTP
          </button>
        </form>
      </section>
    </main>
  );
}

function OtpView({ mobile, otpHint, loading, verifyOtp, message, error }) {
  return (
    <main className="auth-wrap">
      <section className="card auth-panel">
        <Alerts message={message} error={error} />
        <h2>Verify OTP</h2>
        <p className="muted">An OTP was sent to {mobile}.</p>
        {otpHint && <div className="notice">Development OTP: <strong>{otpHint}</strong></div>}
        <form className="form top-gap" onSubmit={verifyOtp}>
          <Field label="OTP">
            <input name="otp" maxLength="6" required />
          </Field>
          <button className="btn primary" disabled={loading}>
            Verify OTP
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminLoginView({ loading, submitAdminLogin, message, error }) {
  return (
    <main className="auth-wrap">
      <section className="card auth-panel">
        <Alerts message={message} error={error} />
        <Settings size={30} />
        <h2>Admin login</h2>
        <p className="muted">The admin panel is protected for the owner only.</p>
        <form className="form" onSubmit={submitAdminLogin}>
          <Field label="Admin email">
            <input type="email" name="email" placeholder="Enter Your E-mail addressed" required />
          </Field>
          <Field label="Password">
            <input type="password" name="password" placeholder="Enter password" required />
          </Field>
          <button className="btn primary" disabled={loading}>
            <ShieldCheck size={17} /> Login as admin
          </button>
        </form>
      </section>
    </main>
  );
}

function ProfileView({ role, loading, submitProfile, message, error }) {
  return (
    <main className="auth-wrap">
      <section className="card auth-panel">
        <Alerts message={message} error={error} />
        <h2>{role === "agent" ? "Agent profile" : "Customer profile"}</h2>
        <p className="muted">Complete your profile to continue.</p>
        <form className="form" onSubmit={submitProfile}>
          <Field label="Full name"><input name="fullName" required /></Field>
          <Field label="Email"><input type="email" name="email" /></Field>
          <div className="split">
            <Field label="Gender">
              <select name="gender" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </Field>
            <Field label="Date of birth"><input type="date" name="dob" /></Field>
          </div>
          <Field label="Profile photo"><input type="file" name="profile" accept="image/*" /></Field>
          <button className="btn primary" disabled={loading}>Save profile</button>
        </form>
      </section>
    </main>
  );
}

function AddressView({ addresses, loading, addAddress, message, error }) {
  return (
    <section className="section">
      <div className="layout">
        <div className="card panel">
          <Alerts message={message} error={error} />
          <h2>Add address</h2>
          <p className="muted">Save your address once and select it directly while booking.</p>
          <form className="form" onSubmit={addAddress}>
            <Field label="Line 1"><input name="line1" required /></Field>
            <Field label="Line 2"><input name="line2" /></Field>
            <div className="split">
              <Field label="City"><input name="city" required /></Field>
              <Field label="State"><input name="state" required /></Field>
            </div>
            <Field label="Pincode"><input name="pincode" pattern="[0-9]{6}" required /></Field>
            <button className="btn primary" disabled={loading}>Add address</button>
          </form>
        </div>
        <aside className="card panel">
          <MapPin size={26} />
          <h3>Saved addresses</h3>
          <div className="list">
            {addresses.length ? addresses.map((address) => (
              <div className="mini-row" key={address._id}>
                <div>
                  <strong>{address.line1}</strong>
                  <p className="muted">{address.city}, {address.state} - {address.pincode}</p>
                </div>
              </div>
            )) : <div className="empty">No saved address yet.</div>}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ServiceView({ service, selectedVariant, setSelectedVariant, addresses, token, role, go, createBooking, message, error }) {
  return (
    <section className="section">
      <Alerts message={message} error={error} />
      <div className="section-head">
        <div>
          <h2>{titleCase(service?.categoryName || "Service")}</h2>
          <p>Select a variant and create your booking.</p>
        </div>
        <button className="btn secondary" onClick={() => go("home")}><ArrowLeft size={17} /> Back</button>
      </div>
      <div className="layout">
        <div className="card panel">
          <h3>Variants</h3>
          <div className="list">
            {service?.variants?.length ? (
              service.variants.map((variant) => (
                <div className="row-card" key={variant._id}>
                  <div>
                    <strong>{titleCase(variant.variantName || "Variant")}</strong>
                    <p className="muted">Professional visit and service support</p>
                  </div>
                  <div className="toolbar">
                    <span className="price">{money(variant.variantPrice)}</span>
                    <button className={`btn ${selectedVariant?._id === variant._id ? "primary" : "secondary"}`} onClick={() => setSelectedVariant(variant)}>
                      Select
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">No variants found.</div>
            )}
          </div>
        </div>
        <aside className="card panel">
          <h3>Book service</h3>
          {token && role === "customer" ? (
            <form className="form" onSubmit={createBooking}>
              <div className="notice">{selectedVariant ? `${selectedVariant.variantName}: ${money(selectedVariant.variantPrice)}` : "Please select a variant first."}</div>
              <div className="split">
                <Field label="Date"><input type="date" name="bookingDate" required /></Field>
                <Field label="Time"><input type="time" name="bookingTime" required /></Field>
              </div>
              {addresses.length > 0 && (
                <Field label="Saved address">
                  <select name="savedAddressId" defaultValue="">
                    <option value="">Use new address</option>
                    {addresses.map((address) => (
                      <option key={address._id} value={address._id}>
                        {address.line1}, {address.city}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="address-block">
                <p className="muted">New address</p>
                <Field label="House / flat / street"><input name="line1" placeholder="House no, street, area" /></Field>
                <Field label="Landmark"><input name="line2" placeholder="Nearby landmark" /></Field>
                <div className="split">
                  <Field label="City"><input name="city" /></Field>
                  <Field label="State"><input name="state" /></Field>
                </div>
                <Field label="Pincode"><input name="pincode" pattern="[0-9]{6}" /></Field>
              </div>
              <button className="btn primary"><CalendarDays size={17} /> Create booking</button>
              <button className="btn secondary" type="button" onClick={() => go("address")}>Add address</button>
            </form>
          ) : (
            <>
              <p className="muted">Please log in as a customer to book this service.</p>
              <button className="btn primary" onClick={() => go("auth")}>Login</button>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

function PaymentView({ booking, loading, createPayment, message, error }) {
  return (
    <main className="auth-wrap">
      <section className="card auth-panel">
        <Alerts message={message} error={error} />
        <CreditCard size={30} />
        <h2>Payment</h2>
        <p className="muted">{booking?.serviceName || "Service"} - {booking?.variantName || "Variant"}</p>
        <h3>{money(booking?.price)}</h3>
        <form className="form" onSubmit={createPayment}>
          <Field label="Method">
            <select name="paymentMethod">
              <option value="COD">COD</option>
              <option value="ONLINE">Online</option>
            </select>
          </Field>
          <button className="btn primary" disabled={loading}><IndianRupee size={17} /> Pay now</button>
        </form>
      </section>
    </main>
  );
}

function PaymentSuccessView({ payment, go, message, error }) {
  return (
    <main className="auth-wrap">
      <section className="card auth-panel">
        <Alerts message={message} error={error} />
        <CheckCircle2 size={34} className="green" />
        <h2>Booking confirmed</h2>
        <div className="row-card">
          <div>
            <strong>{money(payment?.amount)}</strong>
            <p className="muted">TXN: {payment?.transactionId || ""}</p>
          </div>
          <span className="status SUCCESS">{payment?.paymentStatus || "SUCCESS"}</span>
        </div>
        <button className="btn primary top-gap" onClick={() => go("bookings")}>View bookings</button>
      </section>
    </main>
  );
}

function BookingsView({ bookings, loadBookings, updateBooking, message, error }) {
  return (
    <section className="section">
      <Alerts message={message} error={error} />
      <div className="section-head">
        <div><h2>My bookings</h2><p>Customer booking history.</p></div>
        <button className="btn secondary" onClick={loadBookings}>Refresh</button>
      </div>
      <div className="list">
        {bookings.length ? bookings.map((booking) => (
          <div className="row-card" key={booking._id}>
            <div>
              <strong>{booking.serviceName || booking.serviceId?.categoryName || "Service"}</strong>
              <p className="muted">{booking.variantName || "Variant"} on {booking.bookingDate} at {booking.bookingTime}</p>
            </div>
            <div className="toolbar">
              <span className="price">{money(booking.price)}</span>
              <span className={`status ${booking.status}`}>{booking.status}</span>
              {["PENDING", "ACCEPTED"].includes(booking.status) && (
                <button className="btn danger" onClick={() => updateBooking(booking._id, "cancel", { cancelReason: "Cancelled by customer" })}>Cancel</button>
              )}
            </div>
          </div>
        )) : <div className="empty">No bookings yet.</div>}
      </div>
    </section>
  );
}

function AgentView({ bookings, profileId, loadBookings, updateBooking, message, error }) {
  return (
    <section className="section">
      <Alerts message={message} error={error} />
      <div className="section-head">
        <div><h2>Agent dashboard</h2><p>Manage your assigned bookings.</p></div>
        <button className="btn secondary" onClick={loadBookings}>Refresh</button>
      </div>
      <div className="list">
        {bookings.length ? bookings.map((booking) => (
          <div className="row-card" key={booking._id}>
            <div>
              <strong>{booking.serviceName || booking.serviceId?.categoryName || "Service"}</strong>
              <p className="muted">{booking.variantName || "Variant"} for {booking.customerId?.fullName || "Customer"}</p>
            </div>
            <div className="toolbar">
              <span className={`status ${booking.status}`}>{booking.status}</span>
              {booking.status === "PENDING" && <button className="btn primary" onClick={() => updateBooking(booking._id, "accept", { agentId: profileId })}>Accept</button>}
              {booking.status === "ACCEPTED" && <button className="btn primary" onClick={() => updateBooking(booking._id, "start")}>Start</button>}
              {booking.status === "ONGOING" && <button className="btn primary" onClick={() => updateBooking(booking._id, "complete")}>Complete</button>}
              {["PENDING", "ACCEPTED"].includes(booking.status) && <button className="btn secondary" onClick={() => updateBooking(booking._id, "reject")}>Reject</button>}
            </div>
          </div>
        )) : <div className="empty">No assigned bookings.</div>}
      </div>
    </section>
  );
}

function AdminView({
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
  message,
  error,
}) {
  return (
    <section className="section">
      <Alerts message={message} error={error} />
      <div className="section-head">
        <div>
          <h2>Admin control</h2>
          <p>Manage services, variants, bookings, and payments.</p>
        </div>
        <div className="toolbar">
          <button className="btn secondary" onClick={() => loadAdminData()}><Settings size={17} /> Refresh</button>
          <button className="btn danger" onClick={logoutAdmin}><LogOut size={17} /> Admin logout</button>
        </div>
      </div>

      <div className="admin-stats">
        <StatCard icon={<Wrench size={22} />} label="Services" value={services.length} />
        <StatCard icon={<ClipboardList size={22} />} label="Bookings" value={bookings.length} />
        <StatCard icon={<CreditCard size={22} />} label="Payments" value={payments.length} />
        <StatCard icon={<IndianRupee size={22} />} label="Revenue" value={money(payments.reduce((sum, item) => sum + Number(item.amount || 0), 0))} />
      </div>

      <div className="layout admin-layout">
        <div className="card panel">
          <h3>Create service</h3>
          <form className="form" onSubmit={createService}>
            <Field label="Service name"><input name="categoryName" placeholder="Electrician" maxLength="60" required /></Field>
            <button className="btn primary" disabled={loading}><Plus size={17} /> Add service</button>
          </form>
        </div>

        <div className="card panel">
          <h3>Create variant</h3>
          <form className="form" onSubmit={createVariant}>
            <Field label="Service">
              <select name="serviceId" required>
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>{titleCase(service.categoryName)}</option>
                ))}
              </select>
            </Field>
            <div className="split">
              <Field label="Variant name"><input name="variantName" placeholder="Fan repair" maxLength="80" required /></Field>
              <Field label="Price"><input type="number" name="variantPrice" min="1" step="1" placeholder="199" required /></Field>
            </div>
            <button className="btn primary" disabled={loading}><Plus size={17} /> Add variant</button>
          </form>
        </div>
      </div>

      <div className="admin-columns">
        <div className="card panel">
          <h3>Services and variants</h3>
          <div className="list">
            {services.length ? services.map((service) => (
              <div className="admin-service" key={service._id}>
                <div className="admin-service-head">
                  <strong>{titleCase(service.categoryName)}</strong>
                  <button
                    className="icon-danger"
                    type="button"
                    title="Remove service"
                    aria-label={`Remove ${service.categoryName}`}
                    disabled={loading}
                    onClick={() => removeService(service)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="chip-row">
                  {service.variants?.length ? service.variants.map((variant) => (
                    <span className="chip removable-chip" key={variant._id}>
                      <span>{variant.variantName} - {money(variant.variantPrice)}</span>
                      <button
                        type="button"
                        title="Remove variant"
                        aria-label={`Remove ${variant.variantName}`}
                        disabled={loading}
                        onClick={() => removeVariant(service, variant)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  )) : <span className="muted">No variants</span>}
                </div>
              </div>
            )) : <div className="empty">No services found.</div>}
          </div>
        </div>

        <div className="card panel">
          <h3>Recent bookings</h3>
          <div className="list">
            {bookings.slice(0, 8).map((booking) => (
              <div className="mini-row" key={booking._id}>
                <div>
                  <strong>{booking.serviceName || booking.serviceId?.categoryName || "Service"}</strong>
                  <p className="muted">{booking.variantName || "Variant"} - {money(booking.price)}</p>
                </div>
                <span className={`status ${booking.status}`}>{booking.status}</span>
              </div>
            ))}
            {!bookings.length && <div className="empty">No bookings found.</div>}
          </div>
        </div>

        <div className="card panel">
          <h3>Payments</h3>
          <div className="list">
            {payments.slice(0, 8).map((payment) => (
              <div className="mini-row" key={payment._id}>
                <div>
                  <strong>{money(payment.amount)}</strong>
                  <p className="muted">{payment.paymentMethod} - {payment.transactionId}</p>
                </div>
                <span className={`status ${payment.paymentStatus}`}>{payment.paymentStatus}</span>
              </div>
            ))}
            {!payments.length && <div className="empty">No payments found.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
