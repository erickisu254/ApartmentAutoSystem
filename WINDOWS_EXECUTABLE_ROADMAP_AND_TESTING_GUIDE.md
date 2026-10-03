# 🏢 PropMinds: Windows Executable Roadmap & Backend Verification Guide

**Document Version:** 1.0.0  
**Target Environment:** Windows 10 / Windows 11 (x64)  
**System Architecture:** Full-Stack Node.js (Express) + React 19 (Vite) + Resilient Dual Database Engine  

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [What Has Already Been Implemented](#2-what-has-already-been-implemented)
   - [2.1 Backend Engine (`/server/server.js`)](#21-backend-engine-serverserverjs)
   - [2.2 Dual Database Architecture (PostgreSQL + In-Memory Fallback)](#22-dual-database-architecture-postgresql--in-memory-fallback)
   - [2.3 Complete Frontend Client Application](#23-complete-frontend-client-application)
   - [2.4 Authentication & Security Architecture](#24-authentication--security-architecture)
3. [What is Left to Create a Windows Executable (`.exe`)](#3-what-is-left-to-create-a-windows-executable-exe)
   - [3.1 Packaging Strategy Comparison](#31-packaging-strategy-comparison)
   - [3.2 Recommended Solution: Electron Desktop Package](#32-recommended-solution-electron-desktop-package)
   - [3.3 Embedded Offline Database: SQLite Integration](#33-embedded-offline-database-sqlite-integration)
   - [3.4 Step-by-Step Remaining Implementation Checklist](#34-step-by-step-remaining-implementation-checklist)
4. [How to Run and Test the System (Backend Verification Guide)](#4-how-to-run-and-test-the-system-backend-verification-guide)
   - [4.1 Prerequisites on Windows](#41-prerequisites-on-windows)
   - [4.2 Step-by-Step Launch Instructions](#42-step-by-step-launch-instructions)
   - [4.3 Systematic Backend Verification Checklist](#43-systematic-backend-verification-checklist)
   - [4.4 Testing with Real PostgreSQL vs Standalone Fallback](#44-testing-with-real-postgresql-vs-standalone-fallback)
   - [4.5 Windows Troubleshooting & Common Pitfalls](#45-windows-troubleshooting--common-pitfalls)

---

## 1. Executive Summary

PropMinds is a high-fidelity property management system designed to track properties, units, multi-story floor assignments, water meter utility billing, tenant leasing, rent collection, operating expenses, maintenance work orders, and AI-powered tenant correspondence.

The application has been unified into a single full-stack architecture where the Node.js Express backend directly hosts the REST API endpoints on port `3000` while serving the compiled React single-page application (SPA).

---

## 2. What Has Already Been Implemented

### 2.1 Backend Engine (`/server/server.js`)

The backend is fully written and operational in `/server/server.js`. It exposes an exhaustive REST API:

| Category | HTTP Method & Path | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **System** | `GET /api/health` | Returns backend status and database mode (`postgres` or `in-memory`) | Public |
| **Auth** | `POST /api/auth/login` | Authenticates username & password with bcrypt; issues 24h JWT token | Public |
| **Auth** | `PUT /api/auth/credentials` | Updates administrative username and password hash | Bearer Token |
| **Auth** | `GET /api/auth/me` | Validates session token and returns active administrator user | Bearer Token |
| **Properties** | `GET /api/properties` | Lists all properties ordered by creation date | Bearer Token |
| **Properties** | `POST /api/properties` | Creates a new property record | Bearer Token |
| **Properties** | `PUT /api/properties/:id` | Updates name, physical address, and image URL | Bearer Token |
| **Properties** | `DELETE /api/properties/:id` | Deletes property with cascade protection for active tenants | Bearer Token |
| **Units** | `GET /api/units` | Lists units with floor level, unit type note, and meter details | Bearer Token |
| **Units** | `POST /api/units` | Creates unit with deposit, rent, and initial water reading | Bearer Token |
| **Units** | `PUT /api/units/:id` | Full update of unit pricing, status, and occupancy | Bearer Token |
| **Units** | `PATCH /api/units/:id/meter` | Quick update of current/final water meter readings and dates | Bearer Token |
| **Tenants** | `GET /api/tenants` | Lists active and previous tenants with lease details | Bearer Token |
| **Tenants** | `POST /api/tenants` | Onboards tenant and automatically marks assigned unit as Occupied | Bearer Token |
| **Tenants** | `DELETE /api/tenants/:id` | Soft-deletes active tenant to "Previous" status, freeing assigned unit | Bearer Token |
| **Tenants** | `POST /api/tenants/:id/restore` | Restores an archived tenant back to "Active" | Bearer Token |
| **Tenants** | `POST /api/tenants/:id/sign-lease` | Stores digital canvas signature & generates audit log entry | Bearer Token |
| **Payments** | `GET /api/payments` | Retrieves transaction ledger with rent/deposit portions | Bearer Token |
| **Payments** | `POST /api/payments` | Logs payment & triggers rent engine to advance tenant `paidUntil` | Bearer Token |
| **Expenses** | `GET /api/expenses` | Lists operating expenses categorized by property | Bearer Token |
| **Expenses** | `POST /api/expenses` | Logs operating expense | Bearer Token |
| **Expenses** | `PUT /api/expenses/:id` | Updates category, amount, date, or description | Bearer Token |
| **Expenses** | `DELETE /api/expenses/:id` | Deletes expense entry | Bearer Token |
| **Maintenance** | `GET /api/maintenance` | Lists tickets across status, priority, and category | Bearer Token |
| **Maintenance** | `POST /api/maintenance` | Creates ticket with estimated cost & contractor contact | Bearer Token |
| **Maintenance** | `POST /api/maintenance/:id/convert-to-expense` | Resolves ticket and creates linked expense record | Bearer Token |
| **Notes** | `POST /api/notes` | Attaches chronological audit notes to tenants or units | Bearer Token |
| **AI Proxy** | `POST /api/ai/draft-communication` | Generates context-aware tenant notices via Google Gemini API | Bearer Token |

### 2.2 Dual Database Architecture (PostgreSQL + In-Memory Fallback)

To prevent crashes when a user runs the system without an external database, `/server/server.js` contains an intelligent dual-pool engine:
1. **PostgreSQL Mode:** When `DB_HOST` is specified in `.env`, the server attempts to connect to PostgreSQL, creates all relational tables (`users`, `properties`, `units`, `tenants`, `payments`, `expenses`, `maintenance_tickets`, `notes`, `system_settings`), creates indexes, foreign keys, and seeds the default administrator.
2. **In-Memory Fallback Mode:** When `DB_HOST` is omitted or PostgreSQL is unreachable, the system automatically falls back to an in-memory SQL execution engine. It is pre-seeded with complete sample properties (Sunset Apartments, Highland Heights), units across multiple floors, active and historical tenants, payments, expenses, and maintenance tickets. The app boots immediately with zero database installation required.

### 2.3 Complete Frontend Client Application

The React 19 frontend is fully compiled and integrated with the backend:
- **Dashboard:** Real-time occupancy percentage, monthly collected rent vs. expected rent, total outstanding balances, and a 6-month historical revenue chart.
- **Properties & Floor Division:** Multi-story visual grouping with tabs (`All Floors`, `Ground Floor`, `1st Floor`, etc.), unit mutation suite, and image previews.
- **Water Utility Meter Billing:** Water meter ID tracking, current vs. previous reading diff calculation, water tariff rate computation (Ksh/m³), and 1-click WhatsApp utility invoice generator.
- **Tenancy Lifecycle:** Active vs. Previous tenant tabs, digital signature canvas modal for tenancy agreements, and lease term management.
- **Financial Engine:** Automated `paidUntil` calculation advancing by integer and fractional months based on payment amount.
- **Maintenance Tickets:** Categorized work orders with status escalation and 1-click conversion to operating expenses.
- **Reporting & Dossiers:** Period filters (`1M`, `3M`, `6M`, `YTD`, `ALL`), property filters, and printable single-tenant audit dossiers.
- **Settings & Security:** Form to update administrative credentials, system entity counters, and dark/light mode toggle.
- **AI Manager:** Generates professional letters for overdue rent, lease expirations, maintenance visits, and welcome packets.

### 2.4 Authentication & Security Architecture

- Passwords hashed using `bcryptjs` with salt rounds = 10.
- Sessions secured with standard JSON Web Tokens (24-hour expiration).
- Protected API routes verified via `authenticateToken` middleware.
- Client stores JWT token in `localStorage` and automatically sends `Authorization: Bearer <token>` on all requests.

---

## 3. What is Left to Create a Windows Executable (`.exe`)

Currently, running the system on a Windows laptop requires **Node.js** installed on the computer to run `node server/server.js`. To convert PropMinds into a true **standalone `.exe`** that any non-technical user can double-click and run on any Windows laptop without installing Node.js, Git, or PostgreSQL, the following components are needed:

### 3.1 Packaging Strategy Comparison

There are three ways to package a full-stack Node.js + React application for Windows:

| Packaging Strategy | Technology | Final Output | Advantages | Considerations |
| :--- | :--- | :--- | :--- | :--- |
| **A. Desktop App (Recommended)** | **Electron** + `electron-builder` | `PropMinds-Setup.exe` (Installer or Portable) | • Looks and behaves like a native Windows application (custom title bar, desktop icon, system tray).<br>• No browser tabs needed.<br>• Silent internal server management. | Installer size ~80–120MB (includes Chromium + Node runtime). |
| **B. Native CLI / Server `.exe`** | **`@yao-pkg/pkg`** or **Node.js SEA** | `propminds-server.exe` | • Small file size (~40MB).<br>• Runs the Express server as a Windows binary.<br>• Automatically opens default browser. | Shows a brief command window unless configured as a windowed service. |
| **C. Windows Inno Setup Installer** | **Inno Setup** + Portable Node.js | `PropMinds-Installer.exe` | • Bundles a lightweight portable Node.js build.<br>• Creates Start Menu & Desktop shortcuts.<br>• Uninstalls cleanly via Windows Settings. | Requires orchestrating background service launcher. |

### 3.2 Recommended Solution: Electron Desktop Package

The industry standard for packaging React + Node full-stack applications on Windows is **Electron**.

```
┌────────────────────────────────────────────────────────┐
│               PropMinds.exe (Electron Window)          │
│                                                        │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │    React 19 Frontend  │◄──┤  Express REST API    │  │
│  │    (Vite SPA Dist)    │   │  (server/server.js)  │  │
│  └───────────────────────┘   └──────────┬───────────┘  │
│                                         │              │
│                                         ▼              │
│                              ┌──────────────────────┐  │
│                              │ Embedded SQLite DB   │  │
│                              │ (%APPDATA%\data.db)  │  │
│                              └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 3.3 Embedded Offline Database: SQLite Integration

In the current setup, when PostgreSQL is not running, data is held in memory and resets if the process exits. For a standalone desktop executable:
1. **Swap in-memory arrays for SQLite (`better-sqlite3` or `sqlite3`)**:
   - SQLite writes to a single local file on disk: `%APPDATA%\PropMinds\propminds.db`.
   - Data persists across computer restarts without requiring PostgreSQL to be installed on the user's laptop.
2. The existing SQL queries in `/server/server.js` (`CREATE TABLE IF NOT EXISTS`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`) are standard SQL and map cleanly to SQLite.

### 3.4 Step-by-Step Remaining Implementation Checklist

Here is the exact task list required to produce the final `.exe`:

1. **Persistent Local Database Layer**:
   - [ ] Add `better-sqlite3` or an embedded SQLite driver in `/server`.
   - [ ] Configure the database file path to point to `path.join(process.env.APPDATA || './data', 'PropMinds', 'propminds.db')`.
   - [ ] Initialize tables automatically on first launch.

2. **Electron Main Process Script (`/electron/main.js`)**:
   - [ ] Create `main.js` that starts Express server on an available localhost port.
   - [ ] Create a native `BrowserWindow` loading `http://localhost:3000`.
   - [ ] Add application window menu, minimize, maximize, and graceful shutdown (ensuring the Node process terminates when the window closes).

3. **Application Icon & Windows Assets**:
   - [ ] Create an application icon (`assets/icon.ico`) with 256x256, 128x128, 64x64, 48x48, 32x32, and 16x16 layers.

4. **Electron-Builder Configuration**:
   - [ ] Add `electron-builder` configuration in `package.json`:
     ```json
     "build": {
       "appId": "com.propminds.app",
       "productName": "PropMinds Property Management",
       "win": {
         "target": ["nsis", "portable"],
         "icon": "assets/icon.ico"
       },
       "nsis": {
         "oneClick": false,
         "allowToChangeInstallationDirectory": true,
         "createDesktopShortcut": true,
         "createStartMenuShortcut": true
       }
     }
     ```

5. **Build Script & Compilation**:
   - [ ] Add package script: `"dist:win": "npm run build && electron-builder --win"`.
   - [ ] Running this generates `dist/PropMinds Setup 2.2.0.exe` ready for distribution.

---

## 4. How to Run and Test the System (Backend Verification Guide)

### 4.1 Prerequisites on Windows

To run the application on a Windows laptop:
1. **Node.js (v18, v20, or v22 LTS)**:
   - Download installer from [https://nodejs.org/](https://nodejs.org/).
   - Open Command Prompt and verify:
     ```cmd
     node -v
     npm -v
     ```
2. **Git** (optional, for cloning).

### 4.2 Step-by-Step Launch Instructions

#### Step 1: Open Project Directory in Command Prompt
- Open Windows File Explorer and navigate to the project root folder.
- Click on the address bar at the top, type `cmd` and press **Enter**.

#### Step 2: Install Project Dependencies
Run the install command once:
```cmd
npm install
```

#### Step 3: Build the Frontend Assets
Compile the React frontend into the `/dist` directory:
```cmd
npm run build
```
*(This produces the optimized production bundle that `/server/server.js` serves).*

#### Step 4: Start the Full-Stack System
Run:
```cmd
npm run dev
```
*Alternatively, you can double-click `start-propminds.bat` located in the root folder.*

You will see:
```text
PropMinds Backend running on http://0.0.0.0:3000
Database tables verified and ready.
Default admin seeded (admin / password). Change this before going live.
```

#### Step 5: Access the Application
Open any web browser (Chrome, Edge, Firefox, Brave) and navigate to:
```text
http://localhost:3000
```

---

### 4.3 Systematic Backend Verification Checklist

Follow these steps to verify that the backend in `/server/server.js` is fully connected and responding properly:

#### Test 1: Verify Server Health & Mode
Open a new Command Prompt or browser tab and check the health endpoint:
- **Browser URL:** `http://localhost:3000/api/health`
- **Command Prompt (curl):**
  ```cmd
  curl -s http://localhost:3000/api/health
  ```
- **Expected Response:**
  ```json
  {"status":"Cuchy is watching","database":"in-memory"}
  ```
  *(If PostgreSQL is connected, `"database"` will display `"postgres"`).*

#### Test 2: Verify Authentication Endpoint (`POST /api/auth/login`)
- Navigate to `http://localhost:3000/#/login`.
- Enter the default administrative credentials:
  - **Username:** `admin`
  - **Password:** `password`
- Click **Sign In**.
- **Expected Result:** Successful authentication, token stored in `localStorage`, and immediate transition to the Dashboard (`#/`).
- **Command Line Verification:**
  ```cmd
  curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"password\"}"
  ```
- **Expected Response:** JSON object containing `token` and `user` profile (`id`, `username: "admin"`, `role: "admin"`).

#### Test 3: Inspect Backend Requests in Browser DevTools
1. Press `F12` or `Ctrl + Shift + I` in Google Chrome or Microsoft Edge.
2. Click on the **Network** tab and select the **Fetch/XHR** filter.
3. Refresh the page or click between **Dashboard**, **Properties**, and **Tenants**.
4. You will observe clean HTTP `200 OK` requests to:
   - `/api/properties`
   - `/api/units`
   - `/api/tenants`
   - `/api/payments`
   - `/api/expenses`
   - `/api/maintenance`
5. Click on any request and inspect **Headers** to verify `Authorization: Bearer <JWT_TOKEN>`.

#### Test 4: Verify Property & Unit CRUD Mutation
1. Navigate to **Properties** (`#/properties`).
2. Click **+ Add Property**.
3. Enter Name: `Greenwood Residency`, Address: `45 Park Lane, Nairobi`, click **Add Property**.
4. Check DevTools: Verify a `POST /api/properties` request returned `201 Created`.
5. The new property appears immediately in the UI.

#### Test 5: Verify Water Utility Meter Billing Logic
1. On any property with units, click on a unit row or the meter icon.
2. Select **Update Meter Reading**.
3. Enter a new current reading (e.g., if previous was `124.5`, enter `135.0`).
4. Notice the live computation: Net consumption = `10.5 m³`, Bill = `Ksh 1,575.00`.
5. Click **Save Reading**.
6. Check DevTools: Verify a `PATCH /api/units/:id/meter` request returned `200 OK`.

#### Test 6: Verify Rent Calculation Engine
1. Navigate to **Payments** (`#/payments`).
2. Click **+ Record Payment**.
3. Select an occupied unit, choose type **Rent**, and record an amount equal to or greater than the monthly rent.
4. Click **Record Payment**.
5. Navigate to **Tenants** (`#/tenants`) and inspect the tenant:
6. Notice that the tenant's **Paid Until** date has automatically moved forward by the corresponding number of months.

#### Test 7: Verify Maintenance Ticket Conversion to Operating Expense
1. Navigate to **Maintenance** (`#/maintenance`).
2. Choose an Open or In-Progress ticket, click **Options** (`...`) -> **Convert to Expense**.
3. Enter actual cost: `3500`.
4. Click **Confirm Conversion**.
5. Check DevTools: Verify `POST /api/maintenance/:id/convert-to-expense` returned `200 OK`.
6. Navigate to **Expenses** (`#/expenses`): Verify that a linked expense entry (`Work Order: ...`) was created with matching amount.

---

### 4.4 Testing with Real PostgreSQL vs Standalone Fallback

#### Using the Standalone In-Memory Engine (Default)
- Leave `DB_HOST=` blank in `.env`.
- No database installation is required.
- Everything runs self-contained.

#### Connecting to Real PostgreSQL
If you want to verify against a local or cloud PostgreSQL database:
1. Ensure PostgreSQL is installed and running on your machine (or Supabase / Neon / Cloud SQL).
2. Create database:
   ```sql
   CREATE DATABASE propminds_db;
   ```
3. Update `.env` in the root folder:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=propminds_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your_jwt_secret_key_2026
   ```
4. Restart the server (`npm run dev`).
5. Notice in the console log:
   ```text
   PropMinds Backend running on http://0.0.0.0:3000
   Forging database tables...
   Database tables verified and ready.
   Default admin seeded (admin / password).
   ```
6. Check `/api/health`:
   ```json
   {"status":"Cuchy is watching","database":"postgres"}
   ```

---

### 4.5 Windows Troubleshooting & Common Pitfalls

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 3000 is already in use** (`EADDRINUSE`) | Another app (or an old server process) is holding port 3000. | Open Command Prompt as Administrator and run:<br>`netstat -ano \| findstr :3000`<br>`taskkill /F /PID <PID_NUMBER>` |
| **Missing modules (`MODULE_NOT_FOUND`)** | Dependencies were not fully installed in root. | Run `npm install` in the root folder. |
| **Blank white screen in browser** | Frontend root was not rendered or build assets missing. | Ensure `npm run build` completed successfully and inspect browser console (`F12`) for JavaScript syntax errors. |
| **Login fails with "Invalid credentials"** | Incorrect default credentials entered. | Use **`admin`** for username and **`password`** for password (all lowercase). |
| **AI Draft generation returns placeholder draft** | `GEMINI_API_KEY` is not present in `.env`. | Add `GEMINI_API_KEY=AIzaSy...` to your `.env` file to enable real Gemini model generation. |

---

*End of Guide.*
