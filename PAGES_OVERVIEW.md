# 📋 Application Pages Overview

## Complete UI/UX Breakdown

All pages are built with **Tailwind CSS** for a clean, modern interface. Below is what you'll see in each page.

---

## 1️⃣ LOGIN PAGE (`/login`)

**Layout:** Centered card with gradient background

```
┌─────────────────────────────────────┐
│  IT Asset Inventory Management      │
│  Login                              │
├─────────────────────────────────────┤
│  📧 Email:     [admin@company.com]  │
│  🔒 Password:  [password123]        │
│                                     │
│              [Login Button]         │
│                                     │
│  Demo Credentials:                  │
│  • admin@company.com                │
│  • john.doe@company.com             │
│  • viewer@company.com               │
└─────────────────────────────────────┘
```

**Features:**
- Pre-filled demo credentials
- Error message display
- Loading state during login
- Responsive on all devices

---

## 2️⃣ DASHBOARD PAGE (`/dashboard`)

**Layout:** Full-width with sidebar

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  Dashboard                                 │
│ Dashboard   ├──────────────────────────────────────────  │
│ Assets      │  [Total]  [IT]  [Non-IT]                  │
│ Purchases   │  [Active] [Inactive] [Disposed]           │
│ Contracts   │                                            │
│ Reports     │  Expiring Contracts (Next 30 Days)        │
│ Users       │  ┌───────────────────────────────────────┐│
│👤 Profile   │  │ Contract Name    | Vendor  | 15 days ││
│ Logout      │  │ Contract 2       | Vendor2 | 22 days ││
│             │  └───────────────────────────────────────┘│
│             │                                            │
│             │  Quick Stats        │  By Category        │
│             │  ├─ Active    4     │  ├─ IT Assets  3   │
│             │  ├─ Inactive  1     │  └─ Non-IT     2   │
│             │  └─ Disposed  0     │                    │
│             │                                            │
│             │  Recent Assets (Last 5)                   │
│             │  ┌────┬───────┬──────┬────────┬──────────┐│
│             │  │Tag │Type   │Serial│Status  │Date     ││
│             │  ├────┼───────┼──────┼────────┼──────────┤│
│             │  │LAP1│Laptop │A123  │Active  │May 29   ││
│             │  │...                                    ││
│             │  └────┴───────┴──────┴────────┴──────────┘│
└──────────────────────────────────────────────────────────┘
```

**Features:**
- 6 stat cards (clickable, with colors)
- Stat cards show:
  - Total Assets (blue)
  - IT Assets (purple)
  - Non-IT Assets (gray)
  - Active (green)
  - Inactive (orange)
  - Disposed (red)
- Expiring contracts section with days-left badges
- Quick stats sidebar (Active, Inactive, Disposed, Total)
- Category breakdown (IT vs Non-IT)
- Recent assets table
- Loading skeletons during fetch
- Smooth animations

---

## 3️⃣ ASSETS PAGE (`/assets`)

**Layout:** Full table with filter bar

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  Assets                [+ Add Asset]       │
│ ...         ├──────────────────────────────────────────  │
│             │                                            │
│             │  Filters:                                 │
│             │  ┌──────┬──────────┬──────────┬──────────┐ │
│             │  │Search│Category  │Sub Type  │Status    │ │
│             │  │[___] │[IT/Non] │[......]  │[Active]  │ │
│             │  └──────┴──────────┴──────────┴──────────┘ │
│             │  65 assets found                            │
│             │                                            │
│             │  ┌──────┬───┬──────┬────┬────┬────┬───┬─┐ │
│             │  │Tag   │Sub│Serial│MAC │Stat│Asnd│Add│A│ │
│             │  ├──────┼───┼──────┼────┼────┼────┼───┼─┤ │
│             │  │LAP-01│Lpt│S123  │MAC │✓Ac │John│V E D│ │
│             │  │DEK-01│Dsk│S456  │MAC │✗In │Jane│V E D│ │
│             │  │...                                    │ │
│             │  └──────┴───┴──────┴────┴────┴────┴───┴─┘ │
│             │                                            │
│             │  < Page 1 of 4  [1] [2] [3] [4]  Next >   │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Filter bar with:
  - Search (serial no, asset tag)
  - Category dropdown (IT/Non-IT)
  - Sub Type dropdown (9 types)
  - Status dropdown (active/inactive/disposed)
  - Clear filters button
- Table with 8 columns:
  - Asset Tag (bold)
  - Sub Type
  - Serial Number (copyable)
  - MAC Address (copyable)
  - Status (colored badge)
  - Assigned To
  - Date Added
  - Actions (View, Edit, Delete)
- Pagination (20 items per page)
- Loading skeletons
- Empty state message
- Row hover effect

---

## 4️⃣ ASSET DETAIL PAGE (`/assets/:id`)

**Layout:** Two-column responsive

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  LAP-001                   [Print] [Edit]  │
│ ...         │  🟢 Active | IT | Laptop                  │
│             ├──────────────────────────────────────────  │
│             │                                            │
│             │  ┌─ Basic Info ─┐   ┌─ Technical ──────┐ │
│             │  │              │   │                  │ │
│             │  │ Asset Tag    │   │ OS Type: Windows │ │
│             │  │ LAP-001      │   │ OS Ver: Win11    │ │
│             │  │              │   │ Processor: i7    │ │
│             │  │ Category     │   │ RAM: 16 GB       │ │
│             │  │ IT           │   │ Disk: 512 GB     │ │
│             │  │              │   │ ✓ OS Activated   │ │
│             │  │ Sub Type     │   │ ✓ MS Office      │ │
│             │  │ Laptop       │   │                  │ │
│             │  │              │   │ Office Key: ...  │ │
│             │  │ Serial No    │   │                  │ │
│             │  │ DELL-123     │   │                  │ │
│             │  │ (Copy)       │   │                  │ │
│             │  │              │   │                  │ │
│             │  │ Assigned To  │   └──────────────────┘ │
│             │  │ John Doe     │                        │
│             │  │ [Assign Btn] │                        │
│             │  └──────────────┘                        │
│             │                                            │
│             │  Installed Software:                      │
│             │  [MS Office] [Chrome] [Slack] [Adobe]    │
│             │  [Antivirus] [VPN]                       │
│             │                                            │
│             │  Configuration:                           │
│             │  ┌────────────────────────────────────┐  │
│             │  │ Custom monitor arrangement...      │  │
│             │  │ Dual display setup with            │  │
│             │  │ external keyboard                  │  │
│             │  └────────────────────────────────────┘  │
│             │                                            │
│             │  Audit History:                           │
│             │  ┌──┬────┬──────┬──────┬──────────────┐  │
│             │  │Dn│User│Field │Old   │New          │  │
│             │  ├──┼────┼──────┼──────┼──────────────┤  │
│             │  │May│Admin│Status│New  │Active       │  │
│             │  │29│     │      │     │             │  │
│             │  │May│John │Assgn │—   │John Doe     │  │
│             │  │28│     │      │     │             │  │
│             │  └──┴────┴──────┴──────┴──────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Header with:
  - Large asset tag
  - Status badge (colored)
  - Category/Type info
  - Print, Edit, Back buttons
- Left column (Basic Info):
  - Asset Tag, Category, Sub Type
  - Serial No (copyable)
  - MAC Address (copyable)
  - Assigned To (with Assign button)
  - Purchase date
- Right column (Technical Details - IT only):
  - Only shows non-empty fields
  - OS Type, Version, Product ID
  - Processor, Manufacturer
  - Cores, RAM, Disk, Disk Model
  - Office Key (copyable)
  - OS Activation status (✓/✕)
  - MS Office status (✓/✕)
- Software list as blue pills
- Configuration & Others text areas
- Audit history table with:
  - Date, User, Field, Old Value, New Value
- Print button (window.print())
- Assign modal

---

## 5️⃣ ASSET FORM PAGE (`/assets/new` and `/assets/:id/edit`)

**Layout:** Single column form with two sections

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  Add Asset                                 │
│ ...         ├──────────────────────────────────────────  │
│             │                                            │
│             │  ┌─ Basic Information ──────────────────┐ │
│             │  │                                      │ │
│             │  │ Asset Tag *        │ Category *     │ │
│             │  │ [LAP-001]          │ [IT / Non-IT]  │ │
│             │  │                                      │ │
│             │  │ Sub Type *         │ Serial Number  │ │
│             │  │ [Computer]         │ [DELL-123]     │ │
│             │  │                                      │ │
│             │  │ MAC Address        │ Status *       │ │
│             │  │ [00:1A:2B:...]     │ [Active]       │ │
│             │  │                                      │ │
│             │  │ Purchase           │ Assigned To    │ │
│             │  │ [Select purchase]  │ [Select user]  │ │
│             │  │                                      │ │
│             │  └──────────────────────────────────────┘ │
│             │                                            │
│             │  ┌─ Technical Details (IT only) ────────┐ │
│             │  │                                      │ │
│             │  │ OS Type        │ OS Version         │ │
│             │  │ [Windows]      │ [Windows 11]       │ │
│             │  │                                      │ │
│             │  │ Product ID     │ ☐ OS Activated    │ │
│             │  │ [XXXXX]        │                    │ │
│             │  │                                      │ │
│             │  │ Processor      │ Manufacturer       │ │
│             │  │ [Intel i7]     │ [Dell]             │ │
│             │  │                                      │ │
│             │  │ Cores   │ RAM (GB)  │ Disk (GB)      │ │
│             │  │ [8]     │ [16]      │ [512]          │ │
│             │  │                                      │ │
│             │  │ Disk Model:                          │ │
│             │  │ [Samsung SSD 970]                    │ │
│             │  │                                      │ │
│             │  │ ☐ MS Office Installed               │ │
│             │  │   [Office Key (if MS Office=true)]  │ │
│             │  │                                      │ │
│             │  │ Software List (textarea):            │ │
│             │  │ ┌──────────────────────────────────┐│ │
│             │  │ │ Chrome                           ││ │
│             │  │ │ Slack                            ││ │
│             │  │ │ Adobe Creative Suite             ││ │
│             │  │ └──────────────────────────────────┘│ │
│             │  │                                      │ │
│             │  │ Configuration (textarea):            │ │
│             │  │ ┌──────────────────────────────────┐│ │
│             │  │ │ Dual monitor setup with USB...   ││ │
│             │  │ └──────────────────────────────────┘│ │
│             │  │                                      │ │
│             │  └──────────────────────────────────────┘ │
│             │                                            │
│             │              [Cancel] [Create Asset]      │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Two sections:
  1. **Basic Information** (always visible)
     - Asset Tag, Category, Sub Type (required)
     - Serial No, MAC Address (optional)
     - Status, Purchase, Assigned To
  2. **Technical Details** (only if Category = IT)
     - All OS/processor/RAM/disk fields
     - MS Office toggle with conditional Office Key field
     - Software List, Configuration, Others textareas
- React Hook Form validation:
  - Inline error messages
  - Red border on error fields
  - Required field indicators (*)
- Submit/Cancel buttons
- Success toast on save
- Redirects to asset detail on success

---

## 6️⃣ PURCHASES PAGE (`/purchases`)

**Layout:** Table with expandable rows

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  Purchases               [+ Add Purchase]  │
│ ...         ├──────────────────────────────────────────  │
│             │                                            │
│             │  Filters:                                 │
│             │  ┌──────────────┬──────────┬──────────────┐ │
│             │  │Vendor Name   │From Date │To Date       │ │
│             │  │[Dell]        │[--/--]   │[--/--]       │ │
│             │  └──────────────┴──────────┴──────────────┘ │
│             │  2 purchases found                          │
│             │                                            │
│             │  ┌────────┬────────┬─────────┬─────┬────┬─┐ │
│             │  │Purch ID│Vendor  │Email    │Date │Amt │S│ │
│             │  ├────────┼────────┼─────────┼─────┼────┼─┤ │
│             │  │PUR-001 │Dell    │vendor@d │May1 │₹50K│✓│ │
│             │  │        │        │         │     │    │ │ │
│             │  │ ├─ Linked Assets:                      │ │
│             │  │ │ • LAP-001 (Laptop) - Active         │ │
│             │  │ │ • LAP-002 (Laptop) - Active         │ │
│             │  │ └─                                    │ │
│             │  │                                        │ │
│             │  │PUR-002 │Lenovo │vendor@l │May5 │₹75K│✓│ │
│             │  │        │        │         │     │    │ │ │
│             │  │ ├─ Linked Assets:                      │ │
│             │  │ │ • DES-001 (Desktop) - Active        │ │
│             │  │ └─                                    │ │
│             │  └────────┴────────┴─────────┴─────┴────┴─┘ │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Filter bar:
  - Vendor name search
  - Date range (from/to)
  - Clear filters button
- Table with columns:
  - Purchase ID
  - Vendor Name
  - Vendor Email
  - Purchase Date
  - Total Amount
  - Status (colored badge)
  - Actions (Edit, Delete - admin only)
- **Expandable Rows:**
  - Click row to expand
  - Shows linked assets
  - Asset Tag, Type, Status listed
- Modal for Add/Edit:
  - All purchase fields
  - Form validation
  - Success toast
- Delete confirmation modal

---

## 7️⃣ CONTRACTS PAGE (`/contracts`)

**Layout:** Table with banner

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  Contracts              [+ Add Contract]   │
│ ...         ├──────────────────────────────────────────  │
│             │                                            │
│             │  ⚠️  2 contracts expiring within 30 days  │
│             │  • Support Contract - Expires Jun 15      │
│             │  • Software License - Expires Jun 20      │
│             │                                            │
│             │  Status Filter: [All / Active / ...]      │
│             │  3 contracts found                         │
│             │                                            │
│             │  ┌────────┬─────────┬────────┬────┬────┬─┐ │
│             │  │Cont ID │Name     │Vendor  │From│Till│S│ │
│             │  ├────────┼─────────┼────────┼────┼────┼─┤ │
│             │  │CON-001 │Support  │Vendor1 │May1│Jun15│🟢│ │
│             │  │CON-002 │License  │Vendor2 │Jan1│Dec31│🔴│ │
│             │  │CON-003 │Warranty │Vendor3 │Jun1│Aug31│🔵│ │
│             │  └────────┴─────────┴────────┴────┴────┴─┘ │
│             │                                            │
│             │  Status Badges:                           │
│             │  🟢 Active (in date range)               │
│             │  🔵 Upcoming (not started yet)           │
│             │  🔴 Expired (past end date)              │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- **Expiring Soon Banner:**
  - Shows contracts expiring within 30 days
  - Lists contract name and expiry date
  - Only visible if contracts expiring
- Filter:
  - By Status (Active, Upcoming, Expired)
  - Clear filters button
- Table with columns:
  - Contract ID
  - Contract Name
  - Vendor Name
  - Active From date
  - Active Till date
  - Status badge (Green/Blue/Red)
  - Actions (Edit, Delete - admin only)
- Status calculation:
  - Checks current date against dates
  - Dynamically sets status
- Modal for Add/Edit:
  - All contract fields
  - Status selector
  - Description textarea
- Delete confirmation modal

---

## 8️⃣ REPORTS PAGE (`/reports`)

**Layout:** Charts grid with export buttons

```
┌──────────────────────────────────────────────────────────┐
│ 💻 Sidebar  │  Reports  [📥 Export Assets] [📥 Audit Log]│
│ ...         ├──────────────────────────────────────────  │
│             │                                            │
│             │  ┌─ Assets by Sub Type ──┬─ OS Activation ┐ │
│             │  │                       │                │ │
│             │  │ ┌───────────────────┐ │ ┌────────────┐│ │
│             │  │ │   Bar Chart       │ │ │ Pie Chart  ││ │
│             │  │ │ Computer   ████ 8 │ │ │ Activated  ││ │
│             │  │ │ Laptop     ██ 5   │ │ │ ███ 65%    ││ │
│             │  │ │ Printer    ██ 3   │ │ │            ││ │
│             │  │ │ Mobile     █ 1    │ │ │ Not Activa ││ │
│             │  │ │            +more  │ │ │ ██ 35%     ││ │
│             │  │ └───────────────────┘ │ └────────────┘│ │
│             │  │ Total: 20 assets      │ (IT Assets)   │ │
│             │  └───────────────────────┴────────────────┘ │
│             │                                            │
│             │  ┌─ MS Office Status ─┬─ Asset Status ───┐ │
│             │  │                    │                  │ │
│             │  │ ┌──────────────┐   │ ┌──────────────┐│ │
│             │  │ │ Pie Chart    │   │ │ Bar Chart    ││ │
│             │  │ │ Licensed ███ │   │ │ Active  ████ ││ │
│             │  │ │ 60%          │   │ │ Inactive ██  ││ │
│             │  │ │              │   │ │ Disposed █   ││ │
│             │  │ │ Not Lic. ██  │   │ │              ││ │
│             │  │ │ 40%          │   │ │              ││ │
│             │  │ └──────────────┘   │ └──────────────┘│ │
│             │  │ (IT Assets)        │ Total: 20      │ │
│             │  └────────────────────┴──────────────────┘ │
│             │                                            │
│             │  ┌─ Recent Audit Log ────────────────────┐ │
│             │  │ 45 changes (last 50)                  │ │
│             │  │ ┌──┬──────┬──────┬──────┬─────────┐  │ │
│             │  │ │Dt│User  │Asset │Field │Old→New  │  │ │
│             │  │ ├──┼──────┼──────┼──────┼─────────┤  │ │
│             │  │ │Dy│Admin │LAP01 │Stat  │New→Actv │  │ │
│             │  │ │  │      │      │      │         │  │ │
│             │  │ │Da│John  │DES02 │Assgd │—→John D │  │ │
│             │  │ │  │      │      │      │         │  │ │
│             │  │ │Mo│Admin │PRI01 │Stat  │Actv→Ina │  │ │
│             │  │ │  │      │      │      │         │  │ │
│             │  │ └──┴──────┴──────┴──────┴─────────┘  │ │
│             │  └──────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- **Header:**
  - Title "Reports"
  - Two export buttons:
    - "📥 Export Assets CSV"
    - "📥 Export Audit Log CSV"
- **4 Charts (using Recharts):**
  1. **Assets by Sub Type** - Bar Chart
     - X-axis: Sub Type names
     - Y-axis: Count
     - Colored bars
     - Total count in subtitle
  2. **OS Activation Status** - Pie Chart
     - Activated (Activated count)
     - Not Activated (Not Activated count)
     - Color-coded slices
     - Hover shows percentages
  3. **MS Office Status** - Pie Chart
     - Licensed (count)
     - Not Licensed (count)
     - Color-coded slices
  4. **Asset Status Breakdown** - Bar Chart
     - Active (green bar)
     - Inactive (amber bar)
     - Disposed (red bar)
     - Interactive tooltips
- **Audit Log Table:**
  - 50 most recent changes
  - Columns: Date, User, Asset, Field, Old Value, New Value
  - Hover effect
  - Shows change history

---

## 🎨 Design System

### Colors Used
- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Danger:** Red (#ef4444)
- **Neutral:** Gray

### Typography
- **Headings:** Bold, dark gray
- **Body Text:** Regular, medium gray
- **Labels:** Semibold, smaller

### Components
- **Cards:** White bg, 1px gray border, subtle shadow
- **Buttons:** Blue bg, white text, hover darkens
- **Inputs:** Gray border, blue focus ring
- **Tables:** Striped rows, hover highlight
- **Badges:** Colored bg, darker text, rounded

### Spacing
- **Padding:** 6px, 12px, 24px (p-1, p-3, p-6)
- **Margin:** 8px, 16px, 24px (mb-2, mb-4, mb-6)
- **Gap:** 16px, 24px (gap-4, gap-6)

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | Single column, stacked |
| Tablet | 768-1024px | 2-column, compact |
| Desktop | > 1024px | Full width, optimal spacing |

All pages adapt to screen size!

---

## ✨ Animations & Effects

- **Smooth Transitions:** 200-300ms on all interactive elements
- **Hover Effects:** Subtle shadow/background change
- **Loading:** CSS animate-pulse on skeleton loaders
- **Button Feedback:** Visual state on click
- **Modals:** Fade-in with center positioning

---

## 🎯 UX Features

✅ Inline form validation
✅ Toast notifications (success/error)
✅ Loading states
✅ Empty states
✅ Confirmation dialogs for destructive actions
✅ Copy-to-clipboard buttons
✅ Keyboard shortcuts (Ctrl+P for print)
✅ Responsive on all devices
✅ Accessible (ARIA labels, proper semantics)
✅ Print-friendly layouts

---

Everything is ready to explore! Start the project and enjoy! 🎉
