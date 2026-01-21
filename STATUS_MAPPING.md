# Status Mapping Guide

The Admin Panel `Status` fields now map directly to the Client Dashboard `Timeline` steps. Here is how they connect:

| Admin Status | Client View (Timeline Step) | Progress Bar | Description |
| :--- | :--- | :--- | :--- |
| **Draft** | *None* | 0% | Order created but not yet scheduled. |
| **Scheduled** | **Shoot Booked** | 0% | Photographer is confirmed for the shoot. |
| **In Progress** | **On Site** | 33% | Shoot is happening or photos are being taken. |
| **Editing** | **Post-Production** | 66% | Media is being edited/processed. |
| **Delivered** | **Media Ready** | 100% | Files are ready for download. |
| **Archived** | **Media Ready** | 100% | Order completed and archived. |

## For Admins
- When you select a status in the **Admin Order Detail** page, you will now see the corresponding Client View name in parentheses.
- Example: `In Progress (Client: On Site)`
- This ensures you know exactly what the client sees when you update an order.

## For Clients
- The timeline automatically updates to reflect the current status.
- **Draft** orders show the Order ID and details but no active timeline steps.
- **Archived** orders show full completion (Same as Delivered).
