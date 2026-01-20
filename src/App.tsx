import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { OrdersPage } from './pages/OrdersPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { LoginPage } from './pages/LoginPage';

// Placeholder components for other routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <span className="text-4xl text-gray-300">⚙️</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    <p className="text-gray-500 mt-2 max-w-sm mx-auto">This module is currently being scaffolded and will be available in the next update.</p>
    <button className="mt-8 px-6 py-2 bg-upca-blue text-white rounded-xl font-bold shadow-lg shadow-upca-blue/20">Return Home</button>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<Placeholder title="Order Detail" />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/bookings" element={<Placeholder title="Bookings & Calendar" />} />
        <Route path="/deliverables" element={<Placeholder title="Deliverables" />} />
        <Route path="/billing" element={<Placeholder title="Billing & Invoices" />} />
        <Route path="/support" element={<Placeholder title="Support & Messages" />} />
      </Route>
    </Routes>
  );
}

export default App;
