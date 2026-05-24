# SmartSaaS Dashboard — Fixes & Features Implementation Prompt

## Codebase Overview

React + Vite + TailwindCSS v4 SaaS dashboard with:
- **Auth**: Login/Signup via `AuthContext` + `AuthService` + `StorageService` (localStorage)
- **Routing**: React Router v6 with protected `/dashboard`, `/dashboard/sales`, `/dashboard/customers`
- **State**: Three contexts — `AuthContext`, `CustomerContext`, `OrderContext`
- **Storage**: All data persisted in `localStorage` via `StorageService`
- **UI**: Glassmorphism dark/light theme, `react-hot-toast`, `recharts`, `jsPDF`
- **Key data shapes**:
  - Customer: `{ id, name, email, address, phone, status, spend, date }`
  - Order: `{ id, customerId, date, status, globalDiscount, items: [{ id, name, qty, price, discount, gst }] }`

---

## BUGS TO FIX

### 1. Customers Page — Pagination Not Working
**File**: `src/pages/Customers.jsx`

**Problem**: `ITEMS_PER_PAGE = 10` is set and `paginatedCustomers` is sliced correctly, but the "Showing X results" footer text shows `sortedCustomers.length` (total) instead of current page count. Pagination buttons exist but the UI is slightly off. The `useEffect(() => setCurrentPage(1), [searchTerm])` resets on search — that's correct, keep it.

**Fix**:
- Footer text: change to show `"Showing {paginatedCustomers.length} of {sortedCustomers.length} results"`
- Ensure Prev/Next buttons are disabled correctly (already done, just verify)
- Add page number pills between Prev/Next for better UX: show up to 5 page numbers, with ellipsis for large sets

---

### 2. Mobile — Edit/Delete Customer Buttons Not Visible
**File**: `src/pages/Customers.jsx`

**Problem**: Action buttons have `opacity-0 group-hover:opacity-100 md:opacity-100` — on mobile (touch devices), hover never fires so buttons stay invisible. There's no long-press or tap-to-reveal.

**Fix**:
- Remove `opacity-0 group-hover:opacity-100` from the action `<td>` buttons entirely — always show them
- On mobile, use smaller icon-only buttons (✏️ and 🗑️ emoji or SVG icons) with `px-2 py-1` instead of text labels + padding
- Make the Actions column always visible on all screen sizes (remove any `hidden` class from that `<th>` / `<td>`)

---

### 3. Mobile — Order Status Dropdown in OrderList Broken
**File**: `src/components/CustomerDetail/OrderList.jsx`

**Problem**: The status `<select>` inside the order table has custom background-image arrow styling + `appearance-none`. On mobile this renders oddly. The table itself has `overflow-x-auto` on the wrapper but the select dropdown clips. Also table columns are too wide for small screens.

**Fix**:
- Wrap the table in a `<div className="w-full overflow-x-auto -mx-0">` with `min-w-[600px]` on the `<table>`
- The status select: keep the custom styling but add `min-w-[110px]` so it doesn't collapse
- On the Order ID, Date columns — add `whitespace-nowrap` to `<td>` cells
- Add a horizontal scroll hint on mobile: `after:` pseudo or just rely on the overflow container

---

## FEATURES TO ADD

### 4. Dashboard — Pending Payments Card
**File**: `src/pages/Dashboard.jsx`

**What to build**:
- Add a 4th KPI metric card: **"Pending Payments"** showing total ₹ value of all orders with `status === "Pending"`
- Style: `border-b-4 border-b-amber-500`, amber color scheme matching existing card pattern
- **On click**: navigate to `/dashboard/customers` BUT we need a way to pre-filter. Use React Router's `useNavigate` with state: `navigate('/dashboard/customers', { state: { filterStatus: 'Pending' } })`
- In `Customers.jsx`, on component mount read `location.state?.filterStatus`. If present, open the first customer that has pending orders and set `viewingCustomer` to them — OR better: show a banner "Showing customers with Pending orders" and filter the customer list to only those with ≥1 pending order

**Implementation detail**:
```jsx
// Dashboard.jsx — add to metric cards grid (change to 2x2 or 4-col on lg)
const pendingOrders = orders.filter(o => o.status === "Pending");
const pendingTotal = pendingOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);

// Card JSX
<div onClick={() => navigate('/dashboard/customers', { state: { filterStatus: 'Pending' }})}
     className="cursor-pointer glass-panel p-6 rounded-2xl border-b-4 border-b-amber-500 group hover:scale-[1.02] transition-transform">
  <p>Pending Payments</p>
  <h3>₹{formatCurrency(pendingTotal)}</h3>
  <p>{pendingOrders.length} orders awaiting payment</p>
</div>
```

In `Customers.jsx`:
```jsx
import { useLocation } from 'react-router-dom';
const location = useLocation();

useEffect(() => {
  if (location.state?.filterStatus === 'Pending') {
    // Set a pendingFilter state that filters the customer table
    // to only show customers who have ≥1 order with status Pending
    setPendingFilterActive(true);
  }
}, [location.state]);
```
Add a dismissible amber banner when `pendingFilterActive` is true. Filter `sortedCustomers` through `orders` to only show customers with pending orders.

When user clicks a customer row while `pendingFilterActive`, open `CustomerDetail` and also pass `defaultOrderFilter: 'Pending'` so `OrderList` pre-selects "Pending" in its status dropdown.

---

### 5. Dashboard — Recent Activity Orders Clickable
**File**: `src/pages/Dashboard.jsx`

**What to build**:
- Each order in "Recent Activity" list should be clickable
- On click: navigate to `/dashboard/customers` with state `{ openCustomerId: order.customerId, openOrderId: order.id }`

In `Customers.jsx`:
- Read `location.state?.openCustomerId` on mount
- Find that customer, call `setViewingCustomer(customer)`
- Pass `defaultOrderId: location.state?.openOrderId` to `CustomerDetail`

In `CustomerDetail.jsx`:
- Accept prop `defaultOrderId`
- In a `useEffect`, if `defaultOrderId` is set, find the order, call `handleEditOrder(order)` to open it in `OrderBuilder`

**UI change in Dashboard**: wrap each recent activity item in a `<button>` or `<div onClick>`:
```jsx
<div key={order.id} 
     onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: order.customerId, openOrderId: order.id }})}
     className="cursor-pointer ... hover:ring-1 hover:ring-purple-500/30 rounded-xl">
```

---

### 6. Sales Page — Daily Sales Per Customer Table
**File**: `src/pages/Sales.jsx`

**What to build**:
- New section below the existing charts: **"Daily Sales Breakdown"**
- A grouped table: rows grouped by date, then by customer, showing Paid vs Pending amounts
- Data shape needed:
```js
// Group orders by date
const dailySales = orders.reduce((acc, order) => {
  const date = order.date;
  if (!acc[date]) acc[date] = [];
  acc[date].push(order);
  return acc;
}, {});
```
- Table columns: Date | Customer ID | Customer Name (looked up from customers context) | Paid Amount | Pending Amount | Status
- For customer name, use `useCustomerContext()` and find by `customerId`
- Style: collapsible rows per date (toggle open/closed with a chevron), or just a flat table with date as a merged/grouped left column

---

### 7. Sales Page — Gross Sales Card Clickable (Customer + Order Detail Modal)
**File**: `src/pages/Sales.jsx`

**What to build**:
- Clicking the "Gross Sales Volume" KPI card opens a **slide-over panel** (similar to Profile/Settings panels already in the app)
- Panel content: list of all `completedSales` grouped by customer
- For each customer: show customer name (lookup from CustomerContext), total paid, list of their orders with order ID, date, amount
- Add a local state: `const [isSalesDetailOpen, setIsSalesDetailOpen] = useState(false)`
- Reuse the existing slide-over pattern from `Profile.jsx` / `Settings.jsx`

```jsx
// Panel structure
<div className={`fixed inset-y-0 right-0 z-[70] w-full sm:w-[480px] glass-panel ...`}>
  <div className="p-6">
    <h2>Sales Breakdown by Customer</h2>
    {/* Group completedSales by customerId */}
    {Object.entries(salesByCustomer).map(([custId, custOrders]) => (
      <div key={custId} className="mb-4 glass-panel p-4 rounded-xl">
        <p className="font-bold">{getCustomerName(custId)}</p>
        <p>Total: ₹{formatCurrency(custOrders.reduce(...)}</p>
        {custOrders.map(order => <div key={order.id}>...</div>)}
      </div>
    ))}
  </div>
</div>
```

---

### 8. Sales Page — Total Units Sold Card Clickable (Product Breakdown Modal)
**File**: `src/pages/Sales.jsx`

**What to build**:
- Clicking "Total Units Sold" KPI card opens a second slide-over panel
- Panel shows a **product breakdown**: each unique item name, total units sold, total revenue from that item, and list of customers who bought it
- Data derivation:
```js
const productBreakdown = completedSales.reduce((acc, order) => {
  order.items.forEach(item => {
    const key = item.name || 'Unknown';
    if (!acc[key]) acc[key] = { name: key, totalQty: 0, totalRevenue: 0, customers: new Set() };
    acc[key].totalQty += Number(item.qty);
    acc[key].totalRevenue += calculateRowTotal(item);
    acc[key].customers.add(order.customerId);
  });
  return acc;
}, {});
```
- Panel columns per product: Product Name | Units Sold | Revenue | Customers (count + names on expand)
- Sort by totalQty descending

---

### 9. Sales Page — Recent Transactions Clickable
**File**: `src/pages/Sales.jsx`

**What to build**:
- Each row in "Recent Transactions" table should be clickable
- On click: open an **inline order detail modal** (a `<dialog>` or absolute-positioned card) showing:
  - Order ID, date, status, customer name
  - Full item breakdown table (same as OrderBuilder's read-only view)
  - Total calculation with GST and discounts
  - A "Go to Customer" button that navigates to `/dashboard/customers` with state `{ openCustomerId: order.customerId }`
- Add local state: `const [selectedSaleOrder, setSelectedSaleOrder] = useState(null)`
- Modal overlay pattern: fixed inset, click backdrop to close, `z-50`

---

## ADDITIONAL IMPROVEMENTS (Bonus)

### 10. Customers.jsx — Email Field Missing
The customer table doesn't show email. The `CustomerHeader` uses `customer.email` but `AddCustomerModal` doesn't have an email field. Add email input to `AddCustomerModal` and `EditCustomerModal`.

### 11. OrderList.jsx — Empty State Improvement  
When `orders.length === 0` (not just filtered), show a more helpful empty state with an illustration/emoji and a direct "Create First Order" CTA button.

### 12. Dashboard — Metric Cards Grid Layout
Change from `grid-cols-1 sm:grid-cols-3` to `grid-cols-2 lg:grid-cols-4` to accommodate the new Pending Payments card. On mobile show 2 columns.

### 13. Navigation — Pass State Cleanly
After navigating with `location.state`, clear the state so refreshing the page doesn't re-trigger the filter. Use `window.history.replaceState({}, '')` or `navigate(location.pathname, { replace: true, state: {} })` after consuming the state in a `useEffect`.

---

## FILE CHANGE SUMMARY

| File | Change Type |
|------|-------------|
| `src/pages/Customers.jsx` | Fix pagination text, fix mobile buttons, add location.state handling, pending filter banner |
| `src/pages/Dashboard.jsx` | Add pending card, clickable recent activity, 4-col grid |
| `src/pages/Sales.jsx` | Daily sales table, 3 clickable cards/rows, 2 slide-over panels, product breakdown |
| `src/components/CustomerDetail/OrderList.jsx` | Fix mobile table layout, status dropdown min-width |
| `src/pages/PopUps/AddCustomerModal.jsx` | Add email field |
| `src/pages/PopUps/EditCustomer.jsx` | Add email field |
| `src/pages/CustomerDetail.jsx` | Accept `defaultOrderId` + `defaultOrderFilter` props, auto-open order in edit mode |

---

## KEY PATTERNS ALREADY IN CODEBASE (reuse these)

- **Slide-over panel**: See `src/components/Profile.jsx` — fixed right panel, backdrop overlay, translate-x animation
- **Toast confirmation**: See `CustomerContext.jsx` deleteCustomer — `toast((t) => <JSX>, { duration: Infinity })`  
- **Navigation with state**: Use `useNavigate` from react-router-dom; read with `useLocation().state`
- **Glass styles**: `.glass-panel`, `.glass-modal`, `.neon-text` — defined in `index.css`
- **Order total calc**: Always use `calculateOrderTotal(order)` from `src/utils/financeUtils.js`
- **Customer lookup**: `useCustomerContext().customers.find(c => c.id === order.customerId)`
- **Dark mode selects**: Add `className="dark:bg-slate-900"` to `<option>` elements

---

## CONSTRAINTS

- Do NOT change `StorageService` or data shapes — all existing localStorage keys must remain compatible
- Do NOT change routing structure — same paths, just pass state via `navigate(path, { state })`  
- Keep all existing animations (`animate-in`, `slide-up-fade`, etc.)
- Mobile breakpoint is `md` (768px) — ensure all new UI works from 375px width up
- The `PopModal` portal target (`document.getElementById('PopModal')`) must exist in `index.html` — verify it's there or add `<div id="PopModal"></div>` before `</body>`
