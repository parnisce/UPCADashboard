# UPCA Dashboard - Admin Panel

## Overview
The Admin Panel is a comprehensive management system for UPCA administrators to manage the business operations, including services, bookings, orders, payments, and client communications.

## Features

### 1. **Admin Dashboard** (`/admin`)
- Overview statistics (revenue, pending orders, in-progress, completed)
- Quick action buttons to navigate to key sections
- Recent orders table
- Real-time business metrics

### 2. **Services & Pricing** (`/admin/services`)
- Manage all service offerings
- Edit service names, descriptions, and base prices
- Toggle service availability (active/inactive)
- View included features for each service
- Add new services

### 3. **Scheduled Bookings** (`/admin/bookings`)
- View all scheduled photography sessions
- Filter by status (all, scheduled, in-progress)
- Bookings grouped by date
- Quick stats: upcoming shoots, in-progress, unique dates
- Detailed booking information including agent, time, and services

### 4. **Order Management** (`/admin/orders`)
- Comprehensive order list with search and filtering
- Search by address, order ID, or agent name
- Filter by order status
- Bulk selection and actions
- Inline status updates via dropdown
- Export functionality
- Status breakdown statistics

### 5. **Order Detail Page** (`/admin/orders/:id`)
- Complete order information
- Property details (address, agent, shoot date)
- Services list with pricing
- Order timeline visualization
- **Status Management**: Update order status
- **Payment Management**: Confirm payments and track payment status
- Quick actions: download invoice, edit details, message client

### 6. **Messages** (`/admin/messages`)
- Real-time messaging with clients and brokers
- Conversation list with search
- Unread message indicators
- Order-linked conversations
- Message history
- Send messages to clients

## Access

### For Admin Users
1. Login with an admin account (role: `upca_admin`)
2. Click "Admin Panel" button in the client dashboard sidebar
3. Navigate to `/admin` directly

### Switching Between Views
- **From Client to Admin**: Click "Admin Panel" in sidebar (only visible to admins)
- **From Admin to Client**: Click "Client View" in admin sidebar

## Routes

```
/admin                    - Admin Dashboard
/admin/services           - Services & Pricing Management
/admin/bookings           - Scheduled Bookings Calendar
/admin/orders             - Order Management List
/admin/orders/:id         - Order Detail & Management
/admin/messages           - Client Communication
```

## Key Capabilities

### Order Status Management
Admins can update order status through multiple stages:
- Draft
- Scheduled
- In Progress
- Editing
- Delivered
- Archived

### Payment Confirmation
- View payment amounts
- Track payment status (pending, confirmed, paid)
- Confirm payments with one click

### Client Communication
- Message individual clients
- View conversation history
- Link messages to specific orders
- Real-time message indicators

## Design Features

- **Dark Sidebar Theme**: Professional admin interface with gradient dark sidebar
- **Responsive Design**: Works on all device sizes
- **Quick Actions**: Fast access to common tasks
- **Visual Feedback**: Status colors, hover effects, and transitions
- **Search & Filter**: Powerful tools to find specific orders or bookings

## Future Enhancements

Potential additions:
- Analytics dashboard with charts
- Automated email notifications
- Photographer assignment system
- Calendar integration
- File upload management
- Advanced reporting
- Revenue analytics
- Customer relationship management (CRM) features

## Technical Notes

- Built with React + TypeScript
- Uses React Router for navigation
- Styled with Tailwind CSS
- Lucide React for icons
- Shared components with client dashboard
- Type-safe with TypeScript interfaces
