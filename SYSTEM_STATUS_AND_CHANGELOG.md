# PropMinds: System Status & Upgrade Changelog

**Release Date:** October 2026  
**System Version:** 2.2.0 (Floor Division, Water Utility Meter Tracking & Unit Status Edition)  
**Status:** High-Fidelity Interactive Property Management System with Full Local & Windows Standalone Readiness

---

## 1. Upgrade Summary

Following user requirements, **PropMinds v2.2.0** introduces structured multi-story floor organization with visual dividers and floor filter tabs, complete water utility meter reading tracking with automated consumption & bill calculations, WhatsApp utility invoice sharing, and customizable unit status/type notes across all modules.

---

## 2. Detailed Changelog of Newly Implemented Features (v2.2.0)

### 🏢 1. Floor Level Organization & Visual Division (`/properties`)
- **Floor Level Assignment**: Added floor selection to Unit info (`Ground Floor`, `1st Floor`, `2nd Floor`, `3rd Floor`, etc.) in Add Unit, Edit Unit, and Unit Details modals.
- **Visual Floor Division**: Multi-story properties visually organize units under designated floor headers with custom floor icons (`Layers`), unit counts, and clean visual grouping.
- **Floor Filtering & Grouping Toggle**: Landlords can filter units by specific floor using quick pill tabs (`All Floors`, `Ground Floor`, `1st Floor`, etc.) and toggle between "Grouped by Floor" and "Flat List" views.
- **Floor Badges**: Every unit row displays an intuitive floor level badge for instant identification.

---

### 💧 2. Water Utility Meter Tracking & Billing Functionality (`/properties`, `/payments`)
- **Water Utility Unit Fields**: Added `waterMeterNumber`, `currentWaterReading` (m³), `previousWaterReading` (m³), `waterReadingDate`, and `waterRatePerUnit` (Ksh per m³) to the Unit entity.
- **Quick Meter Reading Update Modal**: 
  - Clickable meter badge directly on unit rows or from inside the Unit Details modal.
  - Interactive modal to input new current readings and reading dates.
  - Live preview of calculated net water consumption (`m³`) and calculated water bill (`Ksh`).
  - Automatic archiving of previous readings upon saving.
- **WhatsApp Water Bill Invoicing**: One-click "Share Bill" button that formats a complete water invoice message (Meter #, Previous/Current Readings, Consumption, Tariff Rate, and Total Due) directly to the tenant's WhatsApp.
- **Dedicated Water Utility Card**: Unit Details modal highlights water utility metrics across 4 key indicators: Previous Reading, Current Reading, Net Consumption, and Total Water Due.
- **Water Utility in Payments Module**: Added "Water Utility (Meter Bill)" payment type in `/payments` with automatic bill amount derivation from meter readings.

---

### 🏷️ 3. Unit Status & Configuration Note (`/properties`, `/tenants`, `/reports`)
- **Unit Configuration Note (`unitType`)**: Units can be tagged with configuration notes (e.g. `2 Bedroom`, `1 Bedroom`, `Studio`, `Bedsitter`, `Penthouse`, `Master Ensuite 3-Bedroom`, or custom descriptions).
- **Preset & Custom Type Selector**: Convenient dropdown presets with a custom text field for specific property notes.
- **Cross-Module Integration**: The unit status note appears in Unit Cards, Unit Details modal, Tenant Assignment dropdowns, Tenant Details modal, Payment Receipts, and Tenant Financial Dossiers.

---

## 2. Detailed Changelog of Newly Implemented Features (v2.1.0)

### 🏢 1. Property & Unit Mutation Suite (`/properties`)
- **Full Property Editing**: Landlords can edit the Property Name, Physical Address, and Photo/Picture URL with real-time image preview and quick preset architectural photography options.
- **Property Deletion with Cascade Protection**: Allows deleting properties with intuitive confirmation showing associated units and auto-safeguarding active tenants.
- **Single Unit Deletion**: Enabled unit deletion directly from each unit row in the property listing as well as inside the Unit View modal.

---

### 👥 2. Non-Destructive Tenant Archiving & Flexible Onboarding (`/tenants`)
- **Move to "Previous Tenants" on Delete**: Deleting an active tenant vacates their assigned rental unit while preserving 100% of their historical data (lease start/end, phone, email, notes, digital lease signature, and all payment records). Their previous unit name is cached for instant historical reference.
- **Restore / Permanent Delete Options**: Tenants in the "Previous Tenants" tab can be inspected, restored back to "Active", or permanently purged if required.
- **Optional National ID / Passport**: The ID Number field when creating or editing a tenant is now completely optional (`idNumber?`), allowing fast onboarding when government IDs are pending.

---

### 💳 3. "Rent + Deposit" Bundled Payment & Dual Receipt Generation (`/payments`)
- **Combined "Rent + Deposit" Payment Type**: Landlords can record bundled initial move-in payments with a single transaction. The system automatically attributes the security deposit portion and calculates advance rent coverage.
- **Receipt Printing & Downloading**:
  - **Print Receipt**: Uses an isolated, clean print layout that triggers local printers or "Save as PDF" without opening disruptive popup tabs.
  - **Download Receipt (HTML)**: Generates a standalone, branded official payment receipt file named `Receipt_[ID]_[Tenant].html` that can be emailed or filed offline.
  - Receipt actions are available both on the payment confirmation modal and on every row in the payments table.

---

### 💸 4. Complete Expense & Maintenance Lifecycle (`/expenses`, `/maintenance`)
- **Expense Record Editing & Deletion**: Added Edit and Delete buttons on each expense table row and inside the Expense Details modal. A dedicated **Edit Expense Modal** allows modifying property allocation, category, date, amount, and description.
- **Maintenance Work Order Deletion**: Enabled Delete Work Order on every repair card and within the detailed Work Order inspection modal with user confirmation.

---

### 📑 5. Tenant Balances Audit & Individual Statement Dossier (`/reports`)
- **Tenant Balance Filter Tabs**:
  - **All Residents**: Full roster across the active scope.
  - **Paid Up to Date (Clear)**: Residents whose rent is paid up to today or into the future with zero arrears.
  - **With Arrears / Balances**: Highlights residents with overdue rent, displaying overdue days and exact arrears amounts.
- **Real-Time Tenant Search**: Instantly look up any resident by name, phone number, email, or unit name.
- **Individual Tenant Dossier / Statement Modal**:
  - Full resident profile (Contacts, ID, Occupants).
  - Tenancy timeline (Time entered / Move-in date, lease agreement duration, e-signature status).
  - Financial standing (Monthly rent rate, security deposit paid vs required, total lifetime payments, current balance/arrears).
  - Itemized transaction ledger table of all payments made by this tenant.
  - **Print Statement**: Clean printable statement for physical distribution.
  - **Download Statement (HTML)**: Exportable accounting record file.

---

### 💻 6. Laptop & Windows Standalone Readiness
- **[WINDOWS_SETUP_GUIDE.md](WINDOWS_SETUP_GUIDE.md)**: Exhaustive guide detailing Node.js installation, running offline, desktop PWA app creation, Windows Defender Firewall rule for mobile access over local WiFi, background service setup with PM2/NSSM, and production builds.
- **[LAPTOP_RUN_GUIDE.md](LAPTOP_RUN_GUIDE.md)**: Quickstart guide for macOS, Linux, and Windows laptops.
- **`start-propminds.bat`**: 1-click Windows desktop batch launcher that automatically opens the local server and launches your browser.

---

## 3. Previous Upgrade Changelog (v2.0.0)

### 🛠️ Dedicated Maintenance & Work Order Management Module (`/maintenance`)
- Interactive work order dashboard, priority triage, contractor tracking, and direct expense conversion.

### 💾 LocalStorage Client Persistence Engine
- Persistent local synchronization across all entities with factory demo data reset.

### ✍️ Digital Lease Agreement Generator & E-Signature Pad
- Statutory residential lease contract with HTML5 canvas signature pad and audit ledger.

### 📲 Direct Communication Dispatch (WhatsApp, Email & SMS)
- Multi-channel communication modal with Gemini AI integration.

---

### 📊 5. Advanced Financial & Multi-Property Reporting Engine
- **Property-Level Isolation**: Added a live **Property Selector** on the Reports page allowing managers to toggle between consolidated portfolio analytics or isolate a single estate.
- **Configurable Period Windows**: Filter financial and occupancy data across *This Month (1M)*, *Trailing 3 Months (3M)*, *Trailing 6 Months (6M)*, *Year to Date (YTD)*, and *All Time*.
- **Net Operating Income (NOI) Metric**: Real-time calculation of Gross Rent Revenue minus Total Operating Expenses with color-coded profitability status.
- **Operating Expense Ratio**: Calculates what percentage of rental revenue is consumed by operating overhead.
- **Dynamic Charting**: Inflow vs. Outflow area charts and occupancy donut graphs dynamically recalculate based on the chosen property and period filter.
- **Detailed Expense Table**: Itemized expense ledger displaying categorization, description, property allocation, and exact amounts.

---

## 3. Updated Capability Status Matrix

| System Component | Prototype State | Current State (v2.0) | Target Full Cloud Production |
| :--- | :--- | :--- | :--- |
| **Properties & Units** | Static mock data | **Persistent CRUD with unit dossiers** | Relational Cloud SQL DB |
| **Tenants & Archiving** | Static mock data | **Persistent CRUD with bidirectional unit sync** | Relational Cloud SQL DB |
| **Lease Contracts** | Date strings only | **Formal Agreement + Canvas E-Signature** | PDF Generation + Cloud Storage |
| **Rent & Deposit Ledger** | Static array | **Persistent ledger + Coverage calculator + Receipts** | M-Pesa STK Push / Webhook Sync |
| **Expenses Ledger** | Static array | **Persistent categorized expense tracking** | QuickBooks/Xero API Export |
| **Work Orders & Maintenance** | Missing | **Complete /maintenance module + Expense conversion** | Contractor Mobile App |
| **Reporting & P&L** | Fixed 6M view | **Property & Period filtering + NOI + CSV Export** | Tax/Schedule E Export |
| **Tenant Communication** | Static AI text box | **Gemini AI + WhatsApp/Email/SMS dispatch** | Background SMS Gateway Daemon |
| **Data Persistence** | Lost on refresh | **Full browser LocalStorage synchronization** | PostgreSQL with Cloud Backups |
| **Security & Auth** | Plain text state | **Admin settings + Custom password updates** | JWT/Bcrypt + Multi-Tenant RBAC |

---

## 4. Next Steps for Cloud Production (SaaS)

To take PropMinds beyond browser-persistent single-landlord usage into a multi-tenant SaaS commercial product:
1. **Backend API Provisioning**: Connect a Node.js/Express server (see `BACKEND_GUIDE.md`) to a hosted PostgreSQL instance on Cloud SQL.
2. **M-Pesa Daraja Live Credentials**: Register a Safaricom Daraja Developer account, obtain Consumer Key/Secret and Shortcode, and configure STK Push endpoints.
3. **Tenant Authentication Portal**: Introduce tenant login credentials so tenants can view their own dashboard independently from the landlord's administrative panel.
