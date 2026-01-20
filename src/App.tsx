import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { OrdersPage } from './pages/OrdersPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { LoginPage } from './pages/LoginPage';

import { CreateOrderPage } from './pages/CreateOrderPage';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { DeliverablesPage } from './pages/DeliverablesPage';

import { AccountPage } from './pages/AccountPage';
import { EditPropertyPage } from './pages/EditPropertyPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { BillingPage } from './pages/BillingPage';
import { BookingsPage } from './pages/BookingsPage';
import { PaymentMethodsPage } from './pages/PaymentMethodsPage';
import { SupportPage } from './pages/SupportPage';

import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

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
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
