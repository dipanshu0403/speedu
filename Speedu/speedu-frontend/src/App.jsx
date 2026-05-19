import { useSpeeduApp } from "./hooks/useSpeeduApp.js";
  import { Navbar } from "./components/layout/Navbar.jsx";
  import { Toast } from "./components/feedback/Toast.jsx";
  import { Home } from "./components/home/Home.jsx";
  import { Auth } from "./components/auth/Auth.jsx";
  import { Otp } from "./components/auth/Otp.jsx";
  import { AdminLogin } from "./components/auth/AdminLogin.jsx";
  import { Profile } from "./components/profile/Profile.jsx";
  import { Address } from "./components/address/Address.jsx";
  import { Service } from "./components/service/Service.jsx";
  import { Payment } from "./components/payment/Payment.jsx";
  import { PaymentSuccess } from "./components/payment/PaymentSuccess.jsx";
  import { Bookings } from "./components/bookings/Bookings.jsx";
  import { Agent } from "./components/agent/Agent.jsx";
  import { Admin } from "./components/admin/Admin.jsx";

  export default function App() {
    const app = useSpeeduApp();

    return (
      <div className="min-h-screen bg-stone-50 text-slate-800 antialiased">
        <Navbar
          token={app.token}
          role={app.role}
          go={app.go}
          logout={app.logout}
          userName={app.userName}
          userInfo={app.userInfo}
          goUpdateProfile={app.goUpdateProfile}
        />
        <Toast toasts={app.toasts} dismissToast={app.dismissToast} />
        {app.view === "home" && (<Home search={app.search} setSearch={app.setSearch} services={app.filteredServices} openService={app.openService} loadServices={app.loadServices} />)}
        {app.view === "auth" && (<Auth authMode={app.authMode} setAuthMode={app.setAuthMode} role={app.role} mobile={app.mobile} loading={app.loading} submitAuth={app.submitAuth} />)}
        {app.view === "otp" && (<Otp mobile={app.mobile} otpHint={app.otpHint} loading={app.loading} verifyOtp={app.verifyOtp} />)}
        {app.view === "adminLogin" && <AdminLogin loading={app.loading} submitAdminLogin={app.submitAdminLogin} />}
        {app.view === "profile" && (<Profile role={app.role} loading={app.loading} submitProfile={app.submitProfile} userInfo={app.userInfo} isUpdate={app.isUpdateProfile} />)}
        {app.view === "address" && <Address addresses={app.addresses} loading={app.loading} addAddress={app.addAddress} />}
        {app.view === "service" && (<Service service={app.selectedService} selectedVariant={app.selectedVariant} setSelectedVariant={app.setSelectedVariant} addresses={app.addresses} token={app.token} role={app.role} go={app.go} createBooking={app.createBooking} />)}
        {app.view === "payment" && (<Payment booking={app.draftBooking} loading={app.loading} createPayment={app.createPayment} />)}
        {app.view === "paymentSuccess" && <PaymentSuccess payment={app.paymentResult} go={app.go} />}
        {app.view === "bookings" && (<Bookings bookings={app.bookings} loadBookings={app.loadBookings} updateBooking={app.updateBooking} />)}
        {app.view === "agent" && (<Agent bookings={app.agentBookings} profileId={app.profileId} loadBookings={app.loadBookings} updateBooking={app.updateBooking} />)}
        {app.view === "admin" && (<Admin services={app.services} bookings={app.adminBookings} payments={app.payments} loading={app.loading} createService={app.createService} createVariant={app.createVariant} removeService={app.removeService} removeVariant={app.removeVariant} loadAdminData={app.loadAdminData} logoutAdmin={app.logoutAdmin} />)}
      </div>
    );
  }