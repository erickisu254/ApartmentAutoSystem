# 🏢 PropMinds: Comprehensive Windows Operational & Complete Backend Specification

> **Target Audience:** System Administrators, Windows Laptop Users, Full-Stack Engineers, and Autonomous AI Coding Agents.  
> **Scope:** Complete instructions to deploy, run, and maintain PropMinds on any Windows laptop with zero friction, accompanied by an exhaustive, self-contained architecture and database specification allowing an AI model to construct the entire backend without requiring access to other system files.

---

## 📑 Master Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Zero-Friction Windows Laptop Deployment Guide](#2-zero-friction-windows-laptop-deployment-guide)
3. [Exhaustive Database Architecture & Schemas (SQL)](#3-exhaustive-database-architecture--schemas-sql)
4. [Complete REST API Specification for Backend Generation](#4-complete-rest-api-specification-for-backend-generation)
5. [Core Business Logic & State Transition Rules](#5-core-business-logic--state-transition-rules)
6. [Ready-to-Deploy Backend Reference Implementation (Express + SQLite)](#6-ready-to-deploy-backend-reference-implementation-express--sqlite)
7. [Frontend API Adapter & Production Build](#7-frontend-api-adapter--production-build)
8. [Automated Backup, Data Security & Troubleshooting](#8-automated-backup-data-security--troubleshooting)

---

## 1. System Overview & Architecture

### 1.1 Purpose & Domain
**PropMinds** is an enterprise-grade property management system engineered for residential and commercial property owners, landlords, and estate managers. It manages the entire tenancy lifecycle:
- **Buildings & Units:** Multi-property organization, floor level hierarchies (Ground, 1st, 2nd, etc.), floor-based visual division, custom unit types & descriptors, terms/notes, and water utility meter reading tracking.
- **Tenancy Lifecycle:** Active tenants vs. historical/previous tenants, move-in/out dates, occupant counts, digital lease agreements with canvas signatures, and contact info.
- **Financial Engine:** Rent and deposit tracking, split payments (`Rent + Deposit`), automated `paidUntil` date calculations, partial-month accounting, receipts, and deposit balances.
- **Maintenance & Operations:** Work orders across categories (Plumbing, Electrical, Structural, HVAC, Appliance, Pest Control, General), emergency status escalation, contractor WhatsApp dispatch, and 1-click conversion to operating expenses.
- **Operating Expenses:** Property-specific and general overhead expense logging, categorized cost tracking, and NOI calculations.
- **Executive Analytics:** Real-time Net Operating Income (NOI), expense ratios, collection rates, occupancy rates, and printable single-tenant audit dossiers.
- **AI Manager:** Generative communication drafting for overdue rent, lease expirations, maintenance updates, and welcome letters via Google Gemini API.

### 1.2 Architectural Topology
```
┌────────────────────────────────────────────────────────────────────────┐
│                        WINDOWS LAPTOP RUNTIME                          │
│                                                                        │
│   ┌───────────────────────────┐      ┌──────────────────────────────┐  │
│   │   Browser / Desktop PWA   │      │ Mobile Devices on Local WiFi │  │
│   │ (Chrome / Edge / Firefox) │      │   (http://192.168.x.x:3000)  │  │
│   └─────────────┬─────────────┘      └──────────────┬───────────────┘  │
│                 │                                   │                  │
│                 ▼                                   ▼                  │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                      Vite Dev Server / Express                   │  │
│   │                            Port: 3000                           │  │
│   └────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│                 ┌──────────────────┴──────────────────┐                │
│                 ▼                                     ▼                │
│   ┌───────────────────────────┐         ┌───────────────────────────┐  │
│   │  Local Storage Data Sync  │         │   REST API Backend Engine │  │
│   │    (Standalone Mode)      │         │   (Node/Express + SQLite) │  │
│   └───────────────────────────┘         └─────────────┬─────────────┘  │
│                                                       │                │
│                                                       ▼                │
│                                         ┌───────────────────────────┐  │
│                                         │  SQLite Database File     │  │
│                                         │   (propminds.db) / PG     │  │
│                                         └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Zero-Friction Windows Laptop Deployment Guide

Follow these minimal-setup instructions to get the system operational on any Windows 10 or Windows 11 laptop within 3 minutes.

### 2.1 One-Time Prerequisites Installation
Open **PowerShell** as Administrator (press `Win + X` and select **Terminal** or **PowerShell**):

```powershell
# 1. Install Node.js LTS (includes npm)
winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements

# 2. Install Git (recommended for cloning/updating)
winget install Git.Git --silent --accept-package-agreements --accept-source-agreements
```
*Note: If you prefer manual installation, download the installer from [https://nodejs.org/](https://nodejs.org/) (choose LTS) and run it.*

Verify installation in a new terminal window:
```cmd
node -v
npm -v
```

---

### 2.2 Quick Start (Terminal Method)
1. Place the project directory on your laptop (e.g., `C:\PropMinds` or `C:\Users\YourName\Documents\ApartmentSystem`).
2. Open Windows Command Prompt in this folder (open folder in File Explorer, click the address bar, type `cmd`, and press Enter).
3. Install dependencies and start:
```cmd
npm install
npm run dev
```
4. PropMinds will start on `http://localhost:3000`.

**Default Login Credentials:**
- **Username:** `admin`
- **Password:** `password`
*(Credentials can be updated anytime inside the **Settings** view).*

---

### 2.3 1-Click Desktop Launcher (`start-propminds.bat`)
Create or verify the `start-propminds.bat` file in your root folder. This enables starting the system with a single double-click, automatically opening your default web browser:

```bat
@echo off
title PropMinds Property Management System
cd /d "%~dp0"
echo ========================================================
echo   PropMinds Property Management System - Windows Launcher
echo ========================================================
echo.

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo [INFO] First time setup detected. Installing packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
)

:: Launch browser in background after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the application server
echo [INFO] Starting PropMinds on http://localhost:3000 ...
call npm run dev
pause
```

**To put a shortcut on your Desktop:**
1. Right-click `start-propminds.bat` in File Explorer.
2. Select **Show more options** > **Send to** > **Desktop (create shortcut)**.
3. Rename the shortcut on your desktop to **PropMinds Manager**.
4. (Optional) Right-click shortcut > **Properties** > **Change Icon** to customize its appearance.

---

### 2.4 Headless / Silent Windows Launcher (`start-propminds-silent.vbs`)
If you do not want a black command prompt window visible while running:
Create a file named `start-propminds-silent.vbs` in the root folder:

```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c npm run dev", 0, False
WScript.Sleep 2000
WshShell.Run "http://localhost:3000"
```
Double-clicking this `.vbs` file runs the server completely in the background and opens your browser.

---

### 2.5 Turn PropMinds into an Installable Desktop App (PWA)
1. Open Google Chrome or Microsoft Edge and navigate to `http://localhost:3000`.
2. In the browser URL bar:
   - **Microsoft Edge:** Click the **App available** icon or click the **3 dots** > **Apps** > **Install PropMinds**.
   - **Google Chrome:** Click the **Install icon** on the right side of the address bar or click **3 dots** > **Save and share** > **Install page as app**.
3. PropMinds will now open in its own standalone, frameless desktop window.
4. Right-click the PropMinds taskbar icon and select **Pin to taskbar** for instant daily access.

---

### 2.6 Accessing PropMinds from Other Devices on Local WiFi (Phone/Tablet)
To record payments or check unit meter readings on your phone while walking the property:
1. Ensure your phone and Windows laptop are connected to the same WiFi network.
2. Modify your `package.json` dev script or run:
```cmd
npm run dev -- --host 0.0.0.0
```
3. Find your Windows laptop's local IP address:
   - In terminal, type: `ipconfig`
   - Look for **IPv4 Address** (e.g., `192.168.1.45`).
4. Allow Port 3000 through Windows Defender Firewall (Run in Admin PowerShell once):
```powershell
New-NetFirewallRule -DisplayName "PropMinds Local Access" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```
5. On your phone's browser, open: `http://192.168.1.45:3000`. You have full real-time access.

---

### 2.7 Auto-Start on Windows Boot
To have PropMinds run automatically whenever you turn on your laptop:
1. Press `Win + R`, type `shell:startup`, and press Enter. This opens your Windows Startup folder.
2. Create a shortcut to `start-propminds.bat` (or `start-propminds-silent.vbs`) and paste it inside this folder.
3. Every time Windows logs in, PropMinds will start automatically.

---

## 3. Exhaustive Database Architecture & Schemas (SQL)

This section provides the complete data model capturing every single field, note, optional descriptor, water utility meter reading, floor level, digital signature, and financial attribute present in the system.

### 3.1 Entity Relationship Diagram (Conceptual)
```
  ┌────────────────┐       1:N       ┌────────────────┐
  │   PROPERTIES   ├────────────────►│     UNITS      │
  └───────┬────────┘                 └───────┬────────┘
          │ 1:N                              │ 1:1 (Current)
          │                                  ▼
          │ 1:N                      ┌────────────────┐
          ├─────────────────────────►│    TENANTS     │
          │                          └───────┬────────┘
          ▼                                  │ 1:N
  ┌────────────────┐                         ▼
  │    EXPENSES    │                 ┌────────────────┐
  └────────────────┘                 │    PAYMENTS    │
          ▲                          └────────────────┘
          │ (Converted from)
  ┌───────┴────────┐       1:N       ┌────────────────┐
  │  MAINTENANCE   ├────────────────►│     NOTES      │
  │    TICKETS     │                 │ (Polymorphic)  │
  └────────────────┘                 └────────────────┘
```

---

### 3.2 Production PostgreSQL Schema DDL (`schema.postgresql.sql`)

```sql
-- ============================================================================
-- PropMinds Property Management System - Complete PostgreSQL DDL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'manager', 'accountant'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. UNITS TABLE
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    floor VARCHAR(50) DEFAULT 'Ground Floor', -- e.g. 'Ground Floor', '1st Floor', '2nd Floor', 'Basement'
    unit_type VARCHAR(100) DEFAULT '1 Bedroom', -- 'Single Room', 'Bedsitter', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Penthouse', 'Shop / Commercial'
    unit_type_note TEXT, -- Custom descriptor (e.g. 'Big room', 'Master ensuite', 'Balcony view') that never overrides unit_type
    utility_note TEXT, -- Additional notes/terms (e.g. 'Water deposit is 1000', 'Prepaid token meter #452')
    rent_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'Vacant', -- 'Occupied', 'Vacant', 'Maintenance'
    tenant_id VARCHAR(50), -- Reference to current active tenant (synced bidirectionally)
    
    -- Water Utility & Meter Setup (Without Tariff)
    water_meter_number VARCHAR(100), -- Water meter identifier e.g. 'WM-101-G'
    initial_water_reading NUMERIC(10, 2) DEFAULT 0.00, -- Initial reading when tenant enters the unit (m³)
    initial_water_reading_date DATE, -- Date tenant entered / move-in reading date
    current_water_reading NUMERIC(10, 2) DEFAULT 0.00, -- Current reading that can be changed anytime (m³)
    current_water_reading_date DATE, -- Date current reading was read
    final_water_reading NUMERIC(10, 2), -- Final reading when tenant leaves the unit (m³)
    final_water_reading_date DATE, -- Date of final departure reading
    
    -- Compatibility / Legacy Fields
    previous_water_reading NUMERIC(10, 2) DEFAULT 0.00,
    water_reading_date DATE,
    water_rate_per_unit NUMERIC(10, 2) DEFAULT 150.00,
    features JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50) NOT NULL,
    id_number VARCHAR(100), -- National ID or Passport Number
    lease_start DATE, -- Move-In / Lease Start Date
    lease_end DATE, -- Lease Expiration Date (Nullable for periodic tenancies)
    occupants INTEGER DEFAULT 1,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE SET NULL, -- Currently assigned unit
    previous_unit_id VARCHAR(50), -- Last assigned unit ID before move-out
    previous_unit_name VARCHAR(100), -- Cached unit name for permanent historical reports
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Previous'
    paid_until DATE, -- Calculated date up to which rent has been paid in full
    
    -- Digital Tenancy Agreement Signature
    lease_signed BOOLEAN DEFAULT FALSE,
    lease_signature TEXT, -- Base64 PNG signature canvas data URL
    lease_signed_date TIMESTAMP WITH TIME ZONE,
    
    documents JSONB DEFAULT '[]'::jsonb, -- Attached PDF/file names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint back to units.tenant_id after tenants table creation
ALTER TABLE units ADD CONSTRAINT fk_units_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id VARCHAR(50) NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    method VARCHAR(50) NOT NULL DEFAULT 'Mobile Money', -- 'Cash', 'Bank Transfer', 'Mobile Money', 'Card', 'Other'
    type VARCHAR(50) NOT NULL DEFAULT 'Rent', -- 'Rent', 'Deposit', 'Rent + Deposit', 'Water Utility', 'Other'
    rent_portion NUMERIC(12, 2) DEFAULT 0.00, -- Split payment rent part
    deposit_portion NUMERIC(12, 2) DEFAULT 0.00, -- Split payment deposit part
    status VARCHAR(30) NOT NULL DEFAULT 'Completed', -- 'Completed', 'Pending', 'Failed'
    notes TEXT, -- Transaction references, M-Pesa codes, or bank wire notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. OPERATING EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) REFERENCES properties(id) ON DELETE SET NULL, -- NULL or 'general' indicates general overhead
    category VARCHAR(50) NOT NULL, -- 'Maintenance', 'Utilities', 'Tax', 'Insurance', 'Other'
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MAINTENANCE TICKETS / WORK ORDERS TABLE
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE SET NULL,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'General', -- 'Plumbing', 'Electrical', 'Structural', 'HVAC', 'Appliance', 'Pest Control', 'General'
    priority VARCHAR(30) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Emergency'
    status VARCHAR(30) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Pending Approval', 'Completed', 'Cancelled'
    estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
    actual_cost NUMERIC(12, 2),
    reported_date DATE NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    contractor_name VARCHAR(150),
    contractor_phone VARCHAR(50),
    converted_to_expense BOOLEAN DEFAULT FALSE, -- True if already recorded in expenses table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. POLYMORPHIC NOTES AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(50) PRIMARY KEY,
    target_type VARCHAR(30) NOT NULL, -- 'tenant', 'unit', 'maintenance_ticket'
    target_id VARCHAR(50) NOT NULL, -- ID of the tenant, unit, or ticket
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Landlord',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SYSTEM CONFIGURATION & SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_floor ON units(floor);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_unit ON tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_unit ON payments(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_notes_target ON notes(target_type, target_id);
```

---

### 3.3 Zero-Setup Embedded SQLite Schema DDL (`schema.sqlite.sql`)
For a local standalone Windows setup without installing PostgreSQL, this SQLite schema runs out-of-the-box using Node.js (`better-sqlite3` or `sqlite3`):

```sql
-- ============================================================================
-- PropMinds Property Management System - Embedded SQLite DDL (propminds.db)
-- ============================================================================
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor TEXT DEFAULT 'Ground Floor',
    unit_type TEXT DEFAULT '1 Bedroom',
    unit_type_note TEXT,
    utility_note TEXT,
    rent_amount REAL NOT NULL DEFAULT 0.0,
    deposit_amount REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Vacant',
    tenant_id TEXT,
    water_meter_number TEXT,
    initial_water_reading REAL DEFAULT 0.0,
    initial_water_reading_date TEXT,
    current_water_reading REAL DEFAULT 0.0,
    current_water_reading_date TEXT,
    final_water_reading REAL,
    final_water_reading_date TEXT,
    previous_water_reading REAL DEFAULT 0.0,
    water_reading_date TEXT,
    water_rate_per_unit REAL DEFAULT 150.0,
    features TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    id_number TEXT,
    lease_start TEXT,
    lease_end TEXT,
    occupants INTEGER DEFAULT 1,
    unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
    previous_unit_id TEXT,
    previous_unit_name TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    paid_until TEXT,
    lease_signed INTEGER DEFAULT 0,
    lease_signature TEXT,
    lease_signed_date TEXT,
    documents TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'Mobile Money',
    type TEXT NOT NULL DEFAULT 'Rent',
    rent_portion REAL DEFAULT 0.0,
    deposit_portion REAL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Completed',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Open',
    estimated_cost REAL DEFAULT 0.0,
    actual_cost REAL,
    reported_date TEXT NOT NULL,
    scheduled_date TEXT,
    completed_date TEXT,
    contractor_name TEXT,
    contractor_phone TEXT,
    converted_to_expense INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Landlord',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Complete REST API Specification for Backend Generation

An AI model or developer implementing the backend needs only the following endpoints and data contracts to build the entire server.

### 4.1 Authentication Endpoints
- **`POST /api/auth/login`**
  - **Payload:** `{ "username": "admin", "password": "password" }`
  - **Success (200):** `{ "token": "jwt_or_session_token", "user": { "username": "admin", "role": "admin" } }`
  - **Error (401):** `{ "error": "Invalid username or password" }`
- **`PUT /api/auth/credentials`**
  - **Payload:** `{ "currentPassword": "password", "newUsername": "admin", "newPassword": "newSecretPassword" }`
  - **Success (200):** `{ "message": "Credentials updated successfully" }`
- **`GET /api/auth/me`**
  - Returns authenticated user details.

---

### 4.2 Property Endpoints
- **`GET /api/properties`**
  - **Response (200):** Array of `Property` objects with unit counts and occupancy statistics.
- **`POST /api/properties`**
  - **Payload:** `{ "name": "Sunset Apartments", "address": "124 Sunset Blvd", "image": "https://..." }`
  - **Response (201):** Created `Property` object with generated `id`.
- **`PUT /api/properties/:id`**
  - **Payload:** Partial/Full `Property` object.
  - **Response (200):** Updated `Property` object.
- **`DELETE /api/properties/:id`**
  - Cascade deletes all associated units, expenses, and maintenance tickets.
  - Automatically transitions active tenants in those units to `status = 'Previous'` while retaining their historical unit name.

---

### 4.3 Unit Endpoints
- **`GET /api/units`**
  - Optional Query Params: `?propertyId=p1&floor=Ground%20Floor&status=Vacant`
  - **Response (200):** Array of `Unit` objects with embedded `notes` array.
- **`POST /api/units`**
  - **Payload:**
    ```json
    {
      "propertyId": "p1",
      "name": "Apt 101",
      "floor": "Ground Floor",
      "unitType": "Single Room",
      "unitTypeNote": "Big room with balcony",
      "utilityNote": "Water deposit is 1000",
      "rentAmount": 15000,
      "depositAmount": 15000,
      "status": "Vacant",
      "waterMeterNumber": "WM-101",
      "initialWaterReading": 120.0,
      "initialWaterReadingDate": "2024-01-01",
      "currentWaterReading": 120.0,
      "currentWaterReadingDate": "2024-01-01",
      "finalWaterReading": null,
      "finalWaterReadingDate": null
    }
    ```
- **`PUT /api/units/:id`**
  - Updates unit fields. Synchronizes `tenantId` bidirectionally (assigning a tenant updates tenant's `unitId` and sets unit to `Occupied`; unassigning sets unit to `Vacant`).
- **`PATCH /api/units/:id/meter`** (Quick Meter Reading Update)
  - **Payload:**
    ```json
    {
      "currentWaterReading": 138.5,
      "currentWaterReadingDate": "2024-02-15",
      "finalWaterReading": 145.0,
      "finalWaterReadingDate": "2024-03-01"
    }
    ```
  - **Response (200):** Updated unit with net consumption calculation.
- **`DELETE /api/units/:id`**
  - Deletes unit. If occupied, sets tenant `unitId = null`, `previousUnitId = unit.id`, and `previousUnitName = unit.name`.

---

### 4.4 Tenant Endpoints
- **`GET /api/tenants`**
  - Optional Query Params: `?status=Active` or `?status=Previous`
  - **Response (200):** Array of `Tenant` objects with notes and payment summaries.
- **`POST /api/tenants`**
  - **Payload:**
    ```json
    {
      "fullName": "Jane Wanjiku",
      "phone": "+254 712 345678",
      "email": "jane@example.com",
      "idNumber": "ID29384721",
      "unitId": "u1",
      "leaseStart": "2024-01-01",
      "leaseEnd": "2025-01-01",
      "occupants": 2
    }
    ```
  - **Side-Effect:** Marks assigned unit `status = 'Occupied'` and `tenantId = tenant.id`.
- **`PUT /api/tenants/:id`**
  - Updates tenant details. If `unitId` changes, clears old unit's assignment and marks new unit occupied.
- **`DELETE /api/tenants/:id`**
  - **If Active Tenant:** Soft-deletes to `status = 'Previous'`, sets `unitId = null`, unlinks unit to `Vacant`, and archives `previousUnitName`.
  - **If Already Previous:** Permanently deletes tenant record from database.
- **`POST /api/tenants/:id/restore`**
  - Restores a Previous tenant back to `status = 'Active'`.
- **`POST /api/tenants/:id/sign-lease`**
  - **Payload:** `{ "signatureDataUrl": "data:image/png;base64,iVBORw0KGgo..." }`
  - **Side-Effect:** Sets `leaseSigned = true`, `leaseSignature = signatureDataUrl`, `leaseSignedDate = CURRENT_TIMESTAMP`, and appends an audit log note.

---

### 4.5 Payment & Financial Endpoints
- **`GET /api/payments`**
  - Optional Query Params: `?tenantId=t1&unitId=u1&type=Rent&status=Completed`
- **`POST /api/payments`**
  - **Payload:**
    ```json
    {
      "tenantId": "t1",
      "unitId": "u1",
      "amount": 30000,
      "date": "2024-01-05",
      "method": "Mobile Money",
      "type": "Rent + Deposit",
      "rentPortion": 15000,
      "depositPortion": 15000,
      "status": "Completed",
      "notes": "M-Pesa Ref QHD839201"
    }
    ```
  - **Side-Effect:** Automatically advances tenant's `paidUntil` date using the rent portion calculation.

---

### 4.6 Operating Expense Endpoints
- **`GET /api/expenses`**
  - Filter by `propertyId`, `category`, and date ranges.
- **`POST /api/expenses`**
  - **Payload:** `{ "propertyId": "p1", "category": "Utilities", "amount": 4500, "date": "2024-01-10", "description": "Common area lighting bill" }`
- **`PUT /api/expenses/:id`**
- **`DELETE /api/expenses/:id`**

---

### 4.7 Maintenance & Work Order Endpoints
- **`GET /api/maintenance`**
- **`POST /api/maintenance`**
  - **Payload:**
    ```json
    {
      "propertyId": "p1",
      "unitId": "u1",
      "tenantId": "t1",
      "title": "Kitchen Sink Pipe Leak",
      "description": "Slow drip beneath the sink counter",
      "category": "Plumbing",
      "priority": "High",
      "status": "Open",
      "estimatedCost": 2500,
      "reportedDate": "2024-01-12",
      "contractorName": "John Plumber",
      "contractorPhone": "+254 700 112233"
    }
    ```
  - **Side-Effect:** If priority is `High` or `Emergency`, and the unit is not occupied, marks the unit `status = 'Maintenance'`.
- **`PUT /api/maintenance/:id`**
- **`POST /api/maintenance/:id/convert-to-expense`**
  - **Payload:** `{ "actualCost": 2200 }`
  - **Side-Effect:**
    1. Sets ticket `actualCost = 2200`, `status = 'Completed'`, `convertedToExpense = true`, `completedDate = TODAY`.
    2. Automatically creates an `Expense` record linked to the ticket's `propertyId` with category `'Maintenance'` and description formatted with unit and contractor details.

---

### 4.8 Polymorphic Notes Endpoints
- **`POST /api/notes`**
  - **Payload:** `{ "targetType": "unit", "targetId": "u1", "content": "Checked water seals on move in", "author": "Landlord" }`
- **`GET /api/notes/:targetType/:targetId`**
  - Returns notes chronologically ordered descending.

---

### 4.9 Executive Analytics & Report Endpoints
- **`GET /api/reports/kpis`**
  - Returns `{ totalRentCollected, totalDepositsCollected, totalOperatingExpenses, netOperatingIncome, expenseRatio, occupancyRate, collectionRate, totalOutstandingBalance }`.
- **`GET /api/reports/dossier/:tenantId`**
  - Returns a compiled JSON dossier ready for printing: tenant details, lease status, digital signature, full payment audit trail, unit water meter history, and all administrative notes.

---

### 4.10 AI Assistant Proxy Endpoint
- **`POST /api/ai/draft-communication`**
  - **Payload:** `{ "tenantName": "Jane Wanjiku", "type": "overdue_rent", "details": "Overdue rent balance of Ksh 15,000 for January" }`
  - **Server-Side Action:** Proxies request securely to Gemini API (`gemini-2.5-flash`), preventing API key exposure to the browser.

---

## 5. Core Business Logic & State Transition Rules

When constructing the backend or frontend state managers, the following business rules must be followed exactly to avoid logic errors:

### 5.1 Rent Date Calculation Engine (`paidUntil`)
When a completed payment of type `'Rent'` or `'Rent + Deposit'` is processed:
1. Determine the effective start date:
   - If tenant has an existing `paidUntil` date, start date = `tenant.paidUntil`.
   - Else if tenant has a `leaseStart` date, start date = `tenant.leaseStart`.
   - Else, start date = `payment.date`.
2. Determine the rent portion paid:
   - If `type === 'Rent'`, `rentAmountPaid = payment.amount`.
   - If `type === 'Rent + Deposit'`:
     - If `payment.rentPortion` is defined and `> 0`, use it.
     - Else, `depositRequirement = unit.depositAmount || unit.rentAmount`. Remainder = `payment.amount - depositRequirement`. If remainder `> 0`, `rentAmountPaid = remainder`. Else default to `unit.rentAmount`.
3. Compute coverage:
   - `monthsPaid = rentAmountPaid / unit.rentAmount`.
   - `fullMonths = Math.floor(monthsPaid)`.
   - `partialMonthRatio = monthsPaid - fullMonths`.
   - Add `fullMonths` to start date.
   - If `partialMonthRatio > 0`, add `Math.round(partialMonthRatio * 30)` days.
4. Save resulting date formatted as `YYYY-MM-DD` in `tenant.paidUntil`.

---

### 5.2 Unit Type & Custom Descriptor Independence
- A unit has two distinct classification attributes:
  1. `unitType`: Standardized choice from presets (`Single Room`, `Bedsitter`, `Studio`, `1 Bedroom`, `2 Bedroom`, `3 Bedroom`, `4 Bedroom`, `Penthouse`, `Shop / Commercial`, `Custom / Other`).
  2. `unitTypeNote`: Custom free-form text input (e.g., `"Big room"`, `"Master Ensuite"`, `"Ground floor corner balcony"`).
- **Rule:** Selecting or modifying `unitType` must **never** clear or overwrite `unitTypeNote`. Conversely, typing in `unitTypeNote` must **never** clear or change the chosen `unitType`.
- **Display Rule:** When both exist, format as: `${unitType} • ${unitTypeNote}` (e.g. `Single Room • Big room`).

---

### 5.3 Additional Note / Terms Field
- `utilityNote`: Stores terms or deposit notes like `"Water deposit is 1000"`, `"No smoking"`, or `"Prepaid token meter #9123"`.
- Must be rendered in unit cards, view modal overview, tenant lease sections, and WhatsApp dispatch messages.

---

### 5.4 Water Utility Meter Reading (Tariff-Free)
- **Inputs:**
  - `initialWaterReading` (m³) + `initialWaterReadingDate` (recorded upon move-in).
  - `currentWaterReading` (m³) + `currentWaterReadingDate` (recorded periodically anytime).
  - `finalWaterReading` (m³) + `finalWaterReadingDate` (optional, recorded upon tenant departure).
- **Net Consumption Rule:**
  - If `finalWaterReading` is recorded: `consumed = Math.max(0, finalWaterReading - initialWaterReading)`.
  - Else: `consumed = Math.max(0, currentWaterReading - initialWaterReading)`.
- **No Tariff:** The system does not compute tariff billing formulas in the meter setup; only readings, reading dates, and consumed volume (m³) are tracked.

---

### 5.5 Active vs. Previous Tenant Lifecycle
- **Tenant Move-Out (Soft Deletion):**
  - When an active tenant is deleted, their record is **not** erased from the database.
  - Set `status = 'Previous'`.
  - Set `previousUnitId = tenant.unitId`.
  - Retrieve the unit's name and set `previousUnitName = unit.name`.
  - Set `unitId = null`.
  - Set the unit's `status = 'Vacant'` and `tenantId = null`.
- **Permanent Deletion:** Only when a tenant with `status === 'Previous'` is explicitly deleted are they permanently removed from the database.

---

### 5.6 Maintenance Ticket to Expense Conversion
When `convertTicketToExpense(ticketId, actualCost)` is invoked:
1. Locate the ticket.
2. Create a new `Expense` record:
   - `id`: Unique expense ID.
   - `propertyId`: `ticket.propertyId`.
   - `category`: `'Maintenance'`.
   - `amount`: `actualCost`.
   - `date`: Today's date (`YYYY-MM-DD`).
   - `description`: `"Work Order: ${ticket.title} (Unit: ${unit.name}) - Contractor: ${ticket.contractorName}"`.
3. Update ticket:
   - `actualCost = actualCost`.
   - `status = 'Completed'`.
   - `convertedToExpense = true`.
   - `completedDate = TODAY`.

---

## 6. Ready-to-Deploy Backend Reference Implementation (Express + SQLite)

An AI model can deploy this complete backend into a single `server.js` file inside the project.

### 6.1 `server.js` Implementation
```javascript
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'propminds.db');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Error opening database:', err);
  else {
    console.log('Connected to SQLite database at:', DB_PATH);
    initializeSchema();
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initializeSchema() {
  await run(`CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT NOT NULL, image TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY, property_id TEXT NOT NULL, name TEXT NOT NULL,
    floor TEXT DEFAULT 'Ground Floor', unit_type TEXT DEFAULT '1 Bedroom',
    unit_type_note TEXT, utility_note TEXT, rent_amount REAL NOT NULL,
    deposit_amount REAL DEFAULT 0, status TEXT DEFAULT 'Vacant', tenant_id TEXT,
    water_meter_number TEXT, initial_water_reading REAL DEFAULT 0,
    initial_water_reading_date TEXT, current_water_reading REAL DEFAULT 0,
    current_water_reading_date TEXT, final_water_reading REAL,
    final_water_reading_date TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT, phone TEXT NOT NULL,
    id_number TEXT, lease_start TEXT, lease_end TEXT, occupants INTEGER DEFAULT 1,
    unit_id TEXT, previous_unit_id TEXT, previous_unit_name TEXT,
    status TEXT DEFAULT 'Active', paid_until TEXT, lease_signed INTEGER DEFAULT 0,
    lease_signature TEXT, lease_signed_date TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, unit_id TEXT NOT NULL,
    amount REAL NOT NULL, date TEXT NOT NULL, method TEXT NOT NULL,
    type TEXT NOT NULL, rent_portion REAL DEFAULT 0, deposit_portion REAL DEFAULT 0,
    status TEXT DEFAULT 'Completed', notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY, property_id TEXT, category TEXT NOT NULL,
    amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id TEXT PRIMARY KEY, property_id TEXT NOT NULL, unit_id TEXT, tenant_id TEXT,
    title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
    priority TEXT NOT NULL, status TEXT DEFAULT 'Open', estimated_cost REAL DEFAULT 0,
    actual_cost REAL, reported_date TEXT NOT NULL, scheduled_date TEXT,
    completed_date TEXT, contractor_name TEXT, contractor_phone TEXT,
    converted_to_expense INTEGER DEFAULT 0
  )`);

  await run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, target_type TEXT NOT NULL, target_id TEXT NOT NULL,
    content TEXT NOT NULL, author TEXT NOT NULL, created_at TEXT NOT NULL
  )`);

  console.log('Database tables initialized successfully.');
}

// ---------------- API ROUTES ----------------

// Properties
app.get('/api/properties', async (req, res) => {
  const rows = await all('SELECT * FROM properties');
  res.json(rows);
});

app.post('/api/properties', async (req, res) => {
  const p = req.body;
  const id = p.id || `p_${Date.now()}`;
  await run('INSERT INTO properties (id, name, address, image) VALUES (?, ?, ?, ?)', 
    [id, p.name, p.address, p.image]);
  res.status(201).json({ ...p, id });
});

app.put('/api/properties/:id', async (req, res) => {
  const p = req.body;
  await run('UPDATE properties SET name=?, address=?, image=? WHERE id=?', 
    [p.name, p.address, p.image, req.params.id]);
  res.json(p);
});

app.delete('/api/properties/:id', async (req, res) => {
  await run('DELETE FROM properties WHERE id=?', [req.params.id]);
  await run('DELETE FROM units WHERE property_id=?', [req.params.id]);
  res.json({ success: true });
});

// Units
app.get('/api/units', async (req, res) => {
  const units = await all('SELECT * FROM units');
  res.json(units.map(u => ({
    ...u,
    propertyId: u.property_id,
    rentAmount: u.rent_amount,
    depositAmount: u.deposit_amount,
    unitType: u.unit_type,
    unitTypeNote: u.unit_type_note,
    utilityNote: u.utility_note,
    waterMeterNumber: u.water_meter_number,
    initialWaterReading: u.initial_water_reading,
    initialWaterReadingDate: u.initial_water_reading_date,
    currentWaterReading: u.current_water_reading,
    currentWaterReadingDate: u.current_water_reading_date,
    finalWaterReading: u.final_water_reading,
    finalWaterReadingDate: u.final_water_reading_date,
    tenantId: u.tenant_id
  })));
});

app.post('/api/units', async (req, res) => {
  const u = req.body;
  const id = u.id || `u_${Date.now()}`;
  await run(`INSERT INTO units (
    id, property_id, name, floor, unit_type, unit_type_note, utility_note,
    rent_amount, deposit_amount, status, tenant_id, water_meter_number,
    initial_water_reading, initial_water_reading_date, current_water_reading,
    current_water_reading_date, final_water_reading, final_water_reading_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id, u.propertyId, u.name, u.floor || 'Ground Floor', u.unitType || '1 Bedroom',
    u.unitTypeNote || null, u.utilityNote || null, u.rentAmount || 0,
    u.depositAmount || 0, u.status || 'Vacant', u.tenantId || null,
    u.waterMeterNumber || null, u.initialWaterReading || 0,
    u.initialWaterReadingDate || null, u.currentWaterReading || 0,
    u.currentWaterReadingDate || null, u.finalWaterReading || null,
    u.finalWaterReadingDate || null
  ]);
  res.status(201).json({ ...u, id });
});

app.put('/api/units/:id', async (req, res) => {
  const u = req.body;
  await run(`UPDATE units SET
    name=?, floor=?, unit_type=?, unit_type_note=?, utility_note=?,
    rent_amount=?, deposit_amount=?, status=?, tenant_id=?, water_meter_number=?,
    initial_water_reading=?, initial_water_reading_date=?, current_water_reading=?,
    current_water_reading_date=?, final_water_reading=?, final_water_reading_date=?
    WHERE id=?`, [
    u.name, u.floor, u.unitType, u.unitTypeNote, u.utilityNote,
    u.rentAmount, u.depositAmount, u.status, u.tenantId, u.waterMeterNumber,
    u.initialWaterReading, u.initialWaterReadingDate, u.currentWaterReading,
    u.currentWaterReadingDate, u.finalWaterReading, u.finalWaterReadingDate,
    req.params.id
  ]);
  res.json(u);
});

// Quick Meter Reading PATCH
app.patch('/api/units/:id/meter', async (req, res) => {
  const { currentWaterReading, currentWaterReadingDate, finalWaterReading, finalWaterReadingDate } = req.body;
  await run(`UPDATE units SET 
    current_water_reading = ?, current_water_reading_date = ?,
    final_water_reading = COALESCE(?, final_water_reading),
    final_water_reading_date = COALESCE(?, final_water_reading_date)
    WHERE id = ?`, [currentWaterReading, currentWaterReadingDate, finalWaterReading, finalWaterReadingDate, req.params.id]);
  res.json({ success: true });
});

// Tenants
app.get('/api/tenants', async (req, res) => {
  const rows = await all('SELECT * FROM tenants');
  res.json(rows.map(t => ({
    ...t,
    fullName: t.full_name,
    idNumber: t.id_number,
    leaseStart: t.lease_start,
    leaseEnd: t.lease_end,
    unitId: t.unit_id,
    previousUnitId: t.previous_unit_id,
    previousUnitName: t.previous_unit_name,
    paidUntil: t.paid_until,
    leaseSigned: Boolean(t.lease_signed),
    leaseSignature: t.lease_signature,
    leaseSignedDate: t.lease_signed_date
  })));
});

// Payments & Rent PaidUntil Calculation
app.post('/api/payments', async (req, res) => {
  const p = req.body;
  const id = p.id || `pay_${Date.now()}`;
  await run(`INSERT INTO payments (
    id, tenant_id, unit_id, amount, date, method, type, rent_portion, deposit_portion, status, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    id, p.tenantId, p.unitId, p.amount, p.date, p.method, p.type,
    p.rentPortion || 0, p.depositPortion || 0, p.status || 'Completed', p.notes || null
  ]);

  // Update paidUntil if applicable
  if ((p.type === 'Rent' || p.type === 'Rent + Deposit') && p.status === 'Completed') {
    const unit = await get('SELECT rent_amount, deposit_amount FROM units WHERE id = ?', [p.unitId]);
    const tenant = await get('SELECT paid_until, lease_start FROM tenants WHERE id = ?', [p.tenantId]);
    if (unit && tenant && unit.rent_amount > 0) {
      let startDate = new Date(tenant.paid_until || tenant.lease_start || p.date);
      let rentPaid = p.type === 'Rent + Deposit' ? (p.rentPortion || unit.rent_amount) : p.amount;
      let months = Math.floor(rentPaid / unit.rent_amount);
      startDate.setMonth(startDate.getMonth() + months);
      const newPaidUntil = startDate.toISOString().split('T')[0];
      await run('UPDATE tenants SET paid_until = ? WHERE id = ?', [newPaidUntil, p.tenantId]);
    }
  }

  res.status(201).json({ ...p, id });
});

// Serve Frontend Production Build if present
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`PropMinds Server listening on http://localhost:${PORT}`);
});
```

---

## 7. Frontend API Adapter & Production Build

### 7.1 Production Build Instructions
To build the application for maximum performance and minimal memory footprint on a Windows laptop:

```cmd
npm run build
```
This generates the optimized production bundle inside the `/dist` directory.

To test the production build locally:
```cmd
npm run preview
```

---

### 7.2 Switching from LocalStorage to REST API
Inside `context/AppContext.tsx`, data operations currently read and write to browser `localStorage` for complete offline independence. To connect to the REST backend, define an API service wrapper (`services/api.ts`):

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  getProperties: () => fetch(`${API_BASE}/properties`).then(res => res.json()),
  saveProperty: (p: any) => fetch(`${API_BASE}/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p)
  }).then(res => res.json()),
  getUnits: () => fetch(`${API_BASE}/units`).then(res => res.json()),
  updateUnitMeter: (unitId: string, data: any) => fetch(`${API_BASE}/units/${unitId}/meter`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  recordPayment: (payment: any) => fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment)
  }).then(res => res.json())
};
```

---

## 8. Automated Backup, Data Security & Troubleshooting

### 8.1 Automated Daily Data Backup on Windows
Protect your business records against laptop loss or drive failure. Create a script named `backup-propminds.bat`:

```bat
@echo off
set BACKUP_DIR=C:\PropMindsBackups\%date:~10,4%-%date:~4,2%-%date:~7,2%
mkdir "%BACKUP_DIR%" 2>nul
echo Backing up PropMinds database...
copy "%~dp0propminds.db" "%BACKUP_DIR%\propminds.db" /y
echo Backup saved to %BACKUP_DIR%
```

To schedule this automatically every day at 6:00 PM (Run in Administrator Command Prompt once):
```cmd
schtasks /create /tn "PropMindsDailyBackup" /tr "C:\PropMinds\backup-propminds.bat" /sc daily /st 18:00
```

---

### 8.2 Windows Troubleshooting FAQ

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **`Port 3000 is already in use`** | Another application or previous node process is holding port 3000. | Open CMD and run: `npx kill-port 3000` or find PID via `netstat -ano \| findstr :3000` and run `taskkill /PID <PID> /F`. |
| **`Scripts cannot be run (ExecutionPolicy)`** | Windows PowerShell blocks unsigned scripts by default. | Run PowerShell as Admin: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. |
| **`'node' is not recognized`** | Node.js was installed but environment PATH is not refreshed. | Close and restart your terminal or laptop. |
| **Cannot connect from phone on WiFi** | Windows Defender Firewall is blocking incoming connections to port 3000. | Run in Admin PowerShell: `New-NetFirewallRule -DisplayName "PropMinds" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow`. |
| **Data disappears on browser cache clear** | Standalone mode uses browser `localStorage`. | Switch to the SQLite backend (`node server.js`) so data is written to the physical hard drive `propminds.db`. |

---
*PropMinds Property Management System • Comprehensive Windows Operational & Backend Architecture Manual*
