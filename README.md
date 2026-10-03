# PropMinds - Property Management Dashboard

A modern, comprehensive React application for landlords and property managers to manage tenants, units, payments, expenses, and maintenance notes.

---

## 🔑 Default Login Credentials

Access the administrative dashboard using the default credentials:

| Field | Default Value | Notes |
| :--- | :--- | :--- |
| **Username** | `admin` | Case-sensitive |
| **Password** | `password` | Can be updated in **Settings** (`/settings`) |

> 💡 **Credential Updates**: You can change your administrator username and password at any time from the **Settings** menu. The new credentials are automatically preserved in `localStorage`.

---

## 📚 System Documentation

For full details on this application, refer to the following comprehensive guides:

- **[Windows Setup & End-to-End Guide](WINDOWS_SETUP_GUIDE.md)**: Complete step-by-step tutorial for running on Windows laptops, 1-click desktop shortcuts, installable PWA app, local WiFi network access from phones, and automated Windows background services.
- **[Laptop Quickstart Guide](LAPTOP_RUN_GUIDE.md)**: 60-second guide to run PropMinds on any laptop (Windows, macOS, Linux).
- **[System Status & Upgrade Changelog](SYSTEM_STATUS_AND_CHANGELOG.md)**: Details the newly implemented v2.1 features (property/unit editing & deletion, non-destructive tenant archiving, rent+deposit bundled payments, expense editing, maintenance deletion, and tenant balances audit dossiers).
- **[Business Capabilities & End-User Guide](BUSINESS_CAPABILITIES.md)**: A complete, non-technical and business-oriented breakdown of all system functionalities, workflows, and benefits.
- **[System Gap Analysis & End-to-End Roadmap](SYSTEM_GAP_ANALYSIS.md)**: An exhaustive technical audit detailing what is required to turn this frontend prototype into an enterprise multi-tenant cloud service.
- **[Backend Implementation Guide](BACKEND_GUIDE.md)**: Technical guide for building an Express/PostgreSQL backend service.

---

## 🚀 Tech Stack

- **Frontend:** React 18 (TypeScript)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** React Context API
- **Routing:** React Router DOM
- **AI Integration:** Google Gemini API (for email drafting)
- **Build Tool:** Vite (implied environment)

## 📂 Project Structure

```
/
├── components/         # UI Components
│   ├── Dashboard.tsx   # Analytics and Charts
│   ├── Properties.tsx  # Property & Unit Management
│   ├── Tenants.tsx     # Tenant Management & Details
│   ├── Payments.tsx    # Payment Records & Sorting
│   ├── Expenses.tsx    # Expense Tracking & Categorization
│   ├── Reports.tsx     # Financial Reports & Export
│   ├── Login.tsx       # Admin Authentication
│   ├── Settings.tsx    # Credential Management & Security
│   └── ...
├── context/
│   └── AppContext.tsx  # Global State (Auth, Data Store)
├── services/
│   └── geminiService.ts # AI API Integration
├── types.ts            # TypeScript Interfaces
├── constants.ts        # Mock Data
└── App.tsx             # Main Entry & Routing
```

## 🌟 Key Features

1.  **Dashboard**: Visual analytics for revenue, occupancy rates, and lease expiry alerts.
2.  **Property Management**: Hierarchical view of Properties -> Units. Visual indicators for occupancy status (Occupied, Vacant, Maintenance).
3.  **Tenant Management**: 
    - Active vs Previous tenant archiving.
    - Detailed modal view with payment history and notes.
    - **AI Assistant**: Draft professional emails (reminders, notices) using Google Gemini.
4.  **Financials**: 
    - **Payments**: Record rent and deposits with receipt printing generation.
    - **Expenses**: Track maintenance, utilities, and tax costs per property or general overhead.
    - **Smart Inputs**: Real-time currency formatting (e.g., 1,000) for better readability.
5.  **Reports**: Comprehensive monthly breakdowns, income vs. expense charts, and CSV export.
6.  **Security**: Admin login protection (default: `admin` / `password`) with secure credential updates.

## 🔧 Configuration

**Environment Variables:**
To use the AI features, ensure `process.env.API_KEY` is available with a valid Google Gemini API Key.

## 📦 State Management & Offline Persistence

The app uses `AppContext.tsx` with automated browser `localStorage` synchronization:
- **Persistence**: All properties, units, tenants, lease documents, payment records, operating expenses, work orders, and credentials persist across browser reloads and computer restarts.
- **Factory Reset**: A secure "Reset to Initial Demo Data" option is available in **Settings** (`/settings`) if you wish to restore the factory demo portfolio.
- **Backend Ready**: Can be connected to a PostgreSQL/SQLite REST API server at any time (see `BACKEND_GUIDE.md` and `WINDOWS_SETUP_GUIDE.md`).