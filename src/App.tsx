import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AdminLayout } from "./layouts/AdminLayout";

import { Dashboard } from "./pages/Dashboard";
import { OrdersPage } from "./pages/OrdersPage";
import { PropertiesPage } from "./pages/PropertiesPage";

import { CustomerLoginPage } from "./pages/auth/CustomerLoginPage";
import { CustomerRegisterPage } from "./pages/auth/CustomerRegisterPage";
import { AdminLoginPage } from "./pages/auth/AdminLoginPage";

import { CreateOrderPage } from "./pages/CreateOrderPage";
import { AddPropertyPage } from "./pages/AddPropertyPage";
import { DeliverablesPage } from "./pages/DeliverablesPage";

import { AccountPage } from "./pages/AccountPage";
import { EditPropertyPage } from "./pages/EditPropertyPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { BillingPage } from "./pages/BillingPage";
import { BookingsPage } from "./pages/BookingsPage";
import { PaymentMethodsPage } from "./pages/PaymentMethodsPage";
import { SupportPage } from "./pages/SupportPage";
import { MessagesPage } from "./pages/MessagesPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminServicesPage } from "./pages/admin/AdminServicesPage";
import { AdminBookingsPage } from "./pages/admin/AdminBookingsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminMessagesPage } from "./pages/admin/AdminMessagesPage";
import { AdminOrderDetailPage } from "./pages/admin/AdminOrderDetailPage";

import { RequireAdmin } from "./components/RequireAdmin";

import { UserProvider } from "./contexts/UserContext";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Routes>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/register" element={<CustomerRegisterPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ✅ Admin-only routes */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
            </Route>
          </Route>

          {/* Client Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/new" element={<AddPropertyPage />} />
            <Route path="/properties/edit/:id" element={<EditPropertyPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/deliverables" element={<DeliverablesPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
