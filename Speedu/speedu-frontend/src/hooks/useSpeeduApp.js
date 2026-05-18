import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config/api.js";
import { read, normalizeName, sameName, titleCase } from "../lib/format.js";
import { decodeJwt } from "../lib/jwt.js";

export function useSpeeduApp() {
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
    [services, search],
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
      flash(
        `${variantName} variant ${service.categoryName} me already exists. Duplicate variant add nahi hoga.`,
        "error",
      );
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
        [
          `/service/deleteServiceById/${service._id}`,
          `/service/${service._id}`,
          `/service/deleteService/${service._id}`,
          `/service/delete/${service._id}`,
        ],
        `${serviceName} service removed.`,
        "Backend me service delete route nahi mila.",
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
        "Backend me variant delete route nahi mila.",
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
      flash(
        "We could not connect your profile after login. Please make sure the backend returns user details after OTP verification.",
        "error",
      );
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

  return {
    view,
    setView,
    authMode,
    setAuthMode,
    role,
    mobile,
    token,
    refreshToken,
    adminToken,
    adminEmail,
    userId,
    profileId,
    profileType,
    addresses,
    services,
    filteredServices,
    selectedService,
    selectedVariant,
    setSelectedVariant,
    bookings,
    agentBookings,
    adminBookings,
    payments,
    draftBooking,
    paymentResult,
    otpHint,
    search,
    setSearch,
    message,
    error,
    toasts,
    loading,
    go,
    logout,
    logoutAdmin,
    dismissToast,
    loadServices,
    loadBookings,
    loadAdminData,
    createService,
    createVariant,
    removeService,
    removeVariant,
    submitAuth,
    submitAdminLogin,
    verifyOtp,
    submitProfile,
    addAddress,
    openService,
    createBooking,
    createPayment,
    updateBooking,
  };
}
