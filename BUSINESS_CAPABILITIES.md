# PropMinds: Business Capabilities & Product Overview

## 1. Executive Summary

**PropMinds** is an integrated property management platform engineered to simplify, automate, and professionalize rental property operations. Designed specifically for landlords, property management firms, and estate caretakers, PropMinds bridges the gap between chaotic spreadsheets, physical paper receipts, and expensive legacy enterprise software.

With PropMinds, property managers gain real-time visibility into their rental income, vacant units, overdue arrears, operational expenses, and tenant communication—all from a single, intuitive interface.

---

## 2. Target Audience & Business Value

### Who PropMinds is Built For:
- **Private Landlords**: Individuals managing one or multiple apartment complexes who need hassle-free tracking of rent, deposits, and repairs.
- **Property Management Agencies**: Real estate agencies managing portfolios on behalf of multiple property owners.
- **Estate Caretakers & Building Managers**: On-site managers responsible for daily unit inspections, payment collection, and tenant notices.
- **Commercial & Mixed-Use Properties**: Managers tracking recurring lease obligations across retail, office, and residential units.

### Core Business Benefits:
- **Zero Rent Leakage**: Instant calculation of expected rent versus actual collected amounts, exposing overdue tenants immediately.
- **Automated Rent Accounting**: Dynamic coverage calculators determine exactly which months a payment covers and compute the tenant's new `Paid Until` date automatically.
- **Time Savings on Invoicing & Receipts**: Instant creation of formatted, printable payment receipts branded with property details.
- **Data-Driven Portfolio Growth**: High-level financial trend analysis comparing revenues directly against operational costs.
- **Professional Tenant Communications**: Integrated AI assistant crafts diplomatic, legally sound tenant letters in seconds.

---

## 3. Comprehensive Feature & Functionality Breakdown

### Module 1: Executive Operations Dashboard

The dashboard serves as the central command center, offering real-time visibility into operational health:

- **Key Performance Indicator (KPI) Cards**:
  - **Occupancy Rate**: Visual percentage gauge and ratio of occupied versus total available units across the portfolio.
  - **Total Monthly Revenue**: Real-time sum of rent and deposits collected within the active billing month.
  - **Expected Monthly Rent**: Theoretical 100% collection target based on occupied unit rates, providing an immediate collection deficit metric.
  - **Outstanding Arrears Balance**: Dynamic sum of all uncollected rent based on tenants whose paid-through dates have lapsed.
  - **Active Residents Count**: Total number of active tenants currently under lease.
- **6-Month Revenue Trend Visualizer**: Interactive bar chart comparing revenue collections over the trailing half-year, highlighting seasonality and performance.
- **Intelligent Alert Center**:
  - **Expiring Leases**: Proactive warning cards highlighting any leases expiring within the next 30 calendar days.
  - **Overdue Rent Warnings**: Prominent financial alerts indicating total uncollected rent and identifying defaulting accounts.

---

### Module 2: Property & Unit Portfolio Management

PropMinds organizes physical real estate assets in an intuitive hierarchical structure:

- **Multi-Property Cataloging**:
  - Record property names, physical street addresses, and representative building photography.
  - Quick-view summary badges displaying unit count and occupancy density per building.
- **Unit Inventory Control**:
  - Add individual apartments, suites, or rooms with custom nomenclature (e.g., *Apt 101*, *Penthouse B*).
  - Define custom monthly rental rates and required security deposit amounts per unit.
  - Real-time unit lifecycle statuses: `Occupied`, `Vacant`, and `Maintenance`.
- **Detailed Unit Dossiers**:
  - Comprehensive inspection modal displaying current rent, deposit status, and assigned tenant.
  - **Deposit Reconciliation Engine**: Displays whether security deposits are *Fully Paid*, *Partially Paid*, *Not Paid*, or *No Deposit Set*, with exact paid vs. balance figures.
  - **Move-In Date Tracking**: Directly links and updates move-in dates on tenant records.
  - **Unit Maintenance & Audit Notes**: Internal landlord notes logged with timestamps and author signatures for tracking physical condition and repairs.

---

### Module 3: Tenant Relationship Lifecycle Management

Maintain complete records for all occupants across their entire residency:

- **Active vs. Previous Tenant Archiving**:
  - Dedicated **Active Tenants** tab for current occupants.
  - Dedicated **Previous Tenants** tab archiving past residents with historical data preserved for legal and reference purposes.
  - Soft-delete capability: Moving a tenant out automatically frees their unit to `Vacant` and archives their file without destroying payment history.
- **Comprehensive Tenant Profile**:
  - Full legal name, verified national ID / passport number, mobile phone, and email address.
  - Number of registered occupants per household.
  - Lease commencement and scheduled termination dates.
  - Live rent status badge indicating whether the tenant is *Current* or *Overdue* with the exact lapse date.
- **Bidirectional Unit Synchronization**:
  - Assigning a tenant to a unit automatically updates the unit status to `Occupied`.
  - Vacating or reassigning a tenant automatically frees the previous unit.
- **Individual Tenant Ledger**:
  - Modal viewing reveals personal contact details, lease terms, and an itemized history of every payment ever made by that tenant.
- **Digital Lease Agreements & E-Signature Pad**:
  - Automatically compiles standard Residential Tenancy Agreements pre-populated with tenant details, property address, monthly rent, and deposit requirements.
  - Built-in on-screen digital signature pad allowing tenants and managers to sign with finger, stylus, or mouse.
  - Persistent signature retention, timestamped audit notes, and print/PDF-ready formal contract generation.
  - Visual `Lease Signed` status badge verification on active records.

---

### Module 4: Payments, Rent Ledger & Receipt Generation

PropMinds replaces manual paper receipt books with a digital ledger:

- **Real-Time Payment Recording**:
  - Multi-method support: **Bank Transfer**, **Cash**, **Mobile Money (M-Pesa)**, **Card**, or **Custom Channels**.
  - Payment classification: Tag entries as **Rent**, **Deposit**, or custom fee types (e.g., *Late Penalty*, *Water Surcharge*).
  - Number-formatted currency input fields ensuring readability (e.g., `15,000`).
- **Dynamic Rent Coverage Calculator**:
  - When recording rent, the system reads the unit’s monthly rent rate and calculates the exact fraction or multiple of months covered.
  - Automatically advances the tenant’s `Paid Until` date forward, eliminating manual calendar calculations and human error.
- **Searchable & Multi-Column Sortable Ledger**:
  - Search transactions instantly by tenant name.
  - Sort dynamically by Payment Date, Tenant Name, Unit, Payment Type, Method, Status, or Amount.
- **Printable Official Payment Receipts**:
  - Generates an official, branded printable receipt for any recorded transaction.
  - Displays Unique Receipt Number, Timestamp, Received From, Unit Name, Payment Method, Payment Category, and Total Amount in Ksh.
  - Printable directly to standard office printers or saveable as PDF for instant sharing via WhatsApp or email.

---

### Module 5: Maintenance & Work Order Management

A dedicated operational command center bridging tenant repair requests directly with contractor execution and financial accounting:

- **Work Order Lifecycle Tracking**:
  - Log, triage, and update repairs across `Open`, `In Progress`, `Pending Approval`, `Completed`, and `Cancelled` statuses.
- **Severity & Priority Management**:
  - Tag tickets with color-coded severity: `Emergency`, `High`, `Medium`, and `Low`.
  - Emergency and High priority issues trigger real-time warning alerts directly on the executive Dashboard.
- **Trade Categorization**:
  - Classify issues into Plumbing, Electrical, Structural, HVAC, Appliance, Pest Control, and General maintenance.
- **Contractor & Cost Tracking**:
  - Record external contractor names, direct click-to-call phone links, estimated repair quotes, and final invoice costs.
- **Automated Expense Conversion**:
  - One-click **"Log Expense"** action bridges completed repairs into the financial ledger under `Expenses` without double-entry manual typing.

---

### Module 6: Operating Expense & Cost Tracking

Keep a tight grip on operational overheads to understand true net operating income:

- **Granular Expense Categorization**:
  - Classify expenses into **Maintenance**, **Utilities**, **Property Taxes**, **Insurance**, or **General Overhead**.
- **Context-Aware Allocation**:
  - Attribute expenses to a specific property (e.g., *Roof repair at Sunset Apartments*) or log as *General / Overhead* business expenses.
- **Search & Filter Controls**:
  - Filter ledger by category and search by expense description or building name.
  - Sort transactions by date, cost, category, or property.
- **Audit Detail Inspection**:
  - View expanded expense dossiers with itemized descriptions, date stamps, and property attribution.

---

### Module 7: Financial Analytics & Business Intelligence Reports

Transform raw numbers into strategic insights:

- **Multi-Property & Custom Timeframe Filtering**:
  - Isolate financial statements to a single building or view consolidated portfolio-wide performance.
  - Dynamic timeframe filters: *This Month (1M)*, *Trailing 3 Months (3M)*, *Trailing 6 Months (6M)*, *Year to Date (YTD)*, and *All Time*.
- **Financial Performance Cards**:
  - Gross rent revenue collected vs. security deposits held.
  - Total operational expenses and Expense-to-Income ratio percentage.
  - **Net Operating Income (NOI)**: Real-time calculation of Gross Rent minus Total Operating Costs with color-coded profitability status.
  - Total outstanding rent arrears across the portfolio.
- **Income vs. Expense Trend Chart**:
  - Multi-month dual-area visual chart illustrating cash inflow vs. expense outflow trends over time.
- **Occupancy & Tenant Retention Insights**:
  - Donut chart depicting real-time portfolio occupancy breakdown (Occupied, Vacant, Maintenance).
  - Portfolio Vacancy Rate percentage.
  - **Average Duration of Stay**: Automatically calculated metric measuring tenant longevity in days.
- **Executive Reporting & Data Export**:
  - **One-Click CSV Export**: Downloads full payment records with tenant and unit names formatted for Excel or external accounting packages.
  - **Printable Executive Report**: Dedicated clean layout formatted specifically for printing or PDF archiving.

---

### Module 8: AI-Powered Tenant Communication & Direct Dispatch

Leveraging the Google Gemini API, PropMinds acts as an on-demand administrative copywriter:

- **Context-Aware Email & Letter Drafting**:
  - Select any tenant and click the **AI Assistant** icon to automatically inject the tenant's name, assigned apartment, lease end date, and payment status into the AI prompt.
- **Specialized Communication Templates**:
  - **Overdue Rent Reminder**: Professional yet firm notices requesting immediate payment with accurate balance and context details.
  - **Lease Expiry Notice**: Timely notifications informing tenants of upcoming lease expirations and renewal instructions.
  - **Maintenance Notification**: Polite notices advising occupants of scheduled repairs, utility interruptions, or inspections.
  - **Welcome Onboarding Message**: Warm introductory welcome letters detailing move-in procedures and building contacts.
- **Direct Multi-Channel Dispatch**:
  - **One-Click WhatsApp Launch**: Instantly opens WhatsApp Web or mobile app with the customized notice pre-filled to the tenant's mobile number.
  - **Native Email Launch**: Launches the default email client with recipient address, subject header, and draft body.
  - **SMS Text Trigger**: Opens native cellular SMS for quick mobile dispatch.

---

### Module 8: Security, Customization & Usability

- **Administrative Security**:
  - Dedicated login screen with username and password verification.
  - In-app **Settings** portal allowing administrators to update credentials with current password validation and confirmation checks.
  - Password visibility toggles for secure entry.
- **Dark Mode & Light Mode**:
  - Full system-wide theme switching supporting light and high-contrast dark themes to reduce eye strain during evening audits.
- **Mobile Responsive Design**:
  - Collapsible navigation drawer and mobile headers providing full usability on smartphones and tablets for caretakers walking through properties.

---

## 4. Standard Operational Workflows

### Workflow A: Onboarding a New Tenant
1. Navigate to **Tenants** $\rightarrow$ Click **Add Tenant**.
2. Enter the tenant's Full Name, ID Number, Phone, Email, and Occupants count.
3. Select an available unit from the dropdown list.
4. Set the Move-In Date and optional Lease End Date.
5. Click **Create Tenant**; the unit status automatically switches to `Occupied`.
6. Use the **AI Assistant** to generate and send a personalized Welcome Message.

### Workflow B: Recording Rent Collection
1. Navigate to **Payments** $\rightarrow$ Click **Record Payment**.
2. Select the tenant from the dropdown.
3. Enter the amount paid, payment method (e.g., M-Pesa), and payment date.
4. Inspect the **Rent Coverage Calculator** preview showing how many months are covered and the new `Paid Until` date.
5. Click **Record**; the tenant’s status updates, and a success confirmation appears.
6. Click **Print Receipt** to issue a physical copy or save a PDF.

### Workflow C: Managing Tenant Move-Out
1. Navigate to **Tenants** $\rightarrow$ Locate the tenant in the list.
2. Click the **Delete** icon.
3. Confirm the prompt: the tenant is moved to **Previous Tenants**, and their assigned unit immediately becomes `Vacant` and available for new occupancy.

---

## 5. Summary Matrix of Capabilities

| Module | Key Functionalities | Primary User Benefit |
| :--- | :--- | :--- |
| **Dashboard** | Real-time KPIs, 6-Month charts, Expiry & Default alerts, Urgent Repair warnings | Instant overview of financial health and urgent operational tasks |
| **Properties & Units** | Asset inventory, occupancy status, deposit reconciliation, unit notes | Complete tracking of physical properties, room status, and amenities |
| **Tenants & Leases** | Active/previous archiving, profile ledger, Digital Tenancy Agreement with Canvas E-Signature | Organized occupant records and enforceable signed contracts |
| **Payments** | Rent & deposit logging, auto-coverage calculator, printable receipts | Eliminates manual calculations and provides tamper-proof proof of payment |
| **Maintenance** | Full work order lifecycle, trade categories, contractor tracking, one-click expense conversion | Organized repair dispatch without double-entry cost logging |
| **Expenses** | Category logging, property attribution, search & filter | Full visibility into maintenance and operating overheads |
| **Reports & NOI** | Multi-property & timeframe filters, Net Operating Income, CSV download, print view | Clean financial reporting for owners, accountants, and tax filing |
| **AI Communication** | Gemini-powered notice drafting with direct WhatsApp, Email, and SMS dispatch | Saves hours spent drafting and delivers notices directly to tenant phones |
| **Security & UX** | Password updates, demo data reset, dark/light mode, mobile responsive layout | Secure access across any device in the office or on-site |
