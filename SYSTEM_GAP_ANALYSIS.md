# PropMinds: Comprehensive System Gap Analysis & End-to-End Roadmap

## Executive Summary

The **PropMinds** application provides a comprehensive property management operating system built in React, TypeScript, and Tailwind CSS. With the v2.0 update, key operational workflows—including **Maintenance & Work Order dispatch**, **digital lease agreements with HTML5 canvas e-signatures**, **browser LocalStorage persistence**, **multi-property P&L reporting**, and **direct WhatsApp/Email dispatch**—have been fully implemented.

This document details the original gap audit, highlights the modules successfully implemented, and outlines what remains for a distributed cloud SaaS deployment (e.g. multi-user hosted database, merchant payment gateways, and carrier SMS gateways).

---

## 1. Architectural & Infrastructure Status

| Component | Initial Prototype | Current Implementation (v2.0) | Target Multi-Tenant Cloud SaaS |
| :--- | :--- | :--- | :--- |
| **Data Retention** | Ephemeral (Lost on refresh) | **Full LocalStorage Persistence Engine** | Relational Cloud SQL PostgreSQL |
| **Work Orders & Repairs** | Missing | **Complete /maintenance Module + Expense Bridging** | Mobile Technician Work Order App |
| **Lease Contracts** | Date strings only | **Formal Tenancy Agreement + Digital E-Signature Pad** | PDF Cloud Storage (S3 / GCS) |
| **Tenant Dispatch** | Copy-paste text box | **1-Click WhatsApp, Native Email, and SMS Launch** | Background Automated SMS Cron Daemon |
| **Financial Reporting** | Fixed 6M view | **Property & Period Filtering + Net Operating Income** | QuickBooks / Xero API Sync |
| **Multi-Tenant SaaS** | Single landlord | **Local multi-property cataloging** | Row-Level Security Cloud Database |

---

## 2. Authentication, Authorization & Security Gaps

### Current Limitations:
1. **Mock Authentication**: Credentials (`admin` / `password`) are evaluated directly in React state and stored in cleartext inside browser `localStorage`.
2. **No Token-Based Security**: There are no JSON Web Tokens (JWT), session cookies, or refresh token rotation mechanisms. Any user can bypass login by modifying `localStorage.getItem('propMinds_auth')`.
3. **No Role-Based Access Control (RBAC)**: All logged-in sessions have full unrestricted root privileges across all features.
4. **No Password Hashing**: Passwords are not encrypted with standard cryptographic hashing algorithms (e.g., bcrypt, argon2).

### Required End-to-End Implementations:
- **Identity Provider / Auth Service**: Integrate Firebase Authentication, Auth0, or custom bcrypt-hashed credentials stored in PostgreSQL.
- **Role Hierarchy**:
  - **Super Administrator**: System management, billing, subscription tiers, platform metrics.
  - **Property Owner / Landlord**: Full ownership of assigned estates, financial statements, bank accounts.
  - **Property Manager / Caretaker**: Operational access (log payments, manage tenants, dispatch maintenance) with restricted financial withdrawal/report settings.
  - **Tenant**: Restricted self-service portal (view lease, pay rent, view payment receipts, report repairs).
  - **Maintenance Contractor**: View assigned maintenance tickets, update repair progress, submit material receipts.
- **Two-Factor Authentication (2FA)**: SMS OTP or TOTP Authenticator app support for financial and administrative actions.
- **Audit Logging**: Immutable event ledger tracking who accessed or modified tenant records, deleted units, or recorded payments.

---

## 3. Data Persistence & Database Schema Requirements

Currently, all relational bindings (e.g., Unit to Property, Tenant to Unit, Payment to Tenant) are maintained in plain JavaScript arrays with simulated joins.

### Required Database Tables & Relationships:
1. **`organizations` / `companies`**: Landlord or property management business entities.
2. **`users`**: Platform users with credentials, roles, email verification, and MFA status.
3. **`properties`**: Physical buildings/estates with addresses, coordinates, amenities, and media galleries.
4. **`units`**: Specific rooms/apartments with unit numbers, square footage, bedrooms/bathrooms, utility meters, rent rates, and deposit requirements.
5. **`tenants`**: Tenant personal data, emergency contacts, national identity documents, employment status.
6. **`leases`**: Formal contracts linking Tenant $\leftrightarrow$ Unit $\leftrightarrow$ Duration $\leftrightarrow$ Agreed Rent $\leftrightarrow$ Payment Due Day $\leftrightarrow$ Escalation clauses.
7. **`payments` / `transactions`**: Immutable ledger of payments, payment gateway reference IDs, receipt numbers, status, and breakdown (Rent, Water, Power, Deposit, Penalty).
8. **`expenses`**: Operating costs categorized by property, vendor, invoice number, and tax deductibility.
9. **`maintenance_tickets`**: Tenant maintenance tickets, severity, assigned contractor, work notes, and expense association.
10. **`documents`**: Metadata for uploaded leases, signed PDF receipts, inspection checklists, and eviction notices.

---

## 4. Payment Processing & Financial Automation Gaps

### Current Limitations:
- Payments are entered manually by the administrator.
- No direct connection to banking rails or payment networks.
- No automated rent invoices or overdue penalty fee calculations.
- If a tenant makes an offline payment, there is no real-time webhook confirmation.

### Required Payment Rails:
1. **M-Pesa Daraja API Integration (Kenya / East Africa Focus)**:
   - **STK Push (Lipa Na M-Pesa Online)**: Tenant receives an instant prompt on their phone to enter their M-Pesa PIN for rent.
   - **C2B (Customer to Business)**: Automated payment validation and confirmation webhooks mapped to Paybill / Till Number and unit reference code.
   - **B2C (Business to Customer)**: Automated landlord payouts and contractor disbursements.
2. **Card & Bank Payment Gateways**: Stripe, Flutterwave, or Paystack integration for debit/credit cards and direct bank transfers.
3. **Automated Reconciliation**: System matches bank reference numbers against expected tenant balances without human intervention.
4. **Security Deposit Escrow & Refund Logic**:
   - Tracking deposits separately from operating revenue.
   - Move-out checkout inspections with itemized repair deductions against deposit balances.
5. **Late Payment Fee Engine**: Configurable grace periods (e.g., 5 days) after which late fees (fixed or percentage-based) are automatically debited to the tenant ledger.

---

## 5. Tenant Self-Service Portal

Currently, tenants have no system interface. Everything must be mediated by the landlord or manager.

### Required Tenant Portal Features:
- **Mobile-First Responsive Dashboard**: PWA or native mobile application for tenants.
- **Real-Time Account Statement**: Current rent balance, next due date, past payment history.
- **One-Click Rent Payment**: Pay directly via mobile money or card without leaving the app.
- **Official Digital Receipts**: Instant PDF download for rent and security deposit receipts.
- **Maintenance Ticketing**:
  - Submit repair requests with photo/video upload from the phone camera.
  - Track ticket status (Submitted $\rightarrow$ Scheduled $\rightarrow$ In Progress $\rightarrow$ Resolved).
- **Lease Documentation**: Access digitally signed lease agreement, house rules, and move-in inspection checklists.
- **Direct Messaging**: In-app message thread with the property caretaker/landlord.

---

## 6. Maintenance & Work Order Management

### Current Limitations:
- The system only provides a static unit status (`Maintenance`) and an expense category (`Maintenance`).
- No workflow exists to track who reported an issue, what work is required, or who is assigned to fix it.

### Required Work Order Lifecycle:
1. **Ticket Creation**: Tenant or landlord registers an issue (Plumbing, Electrical, Structural, HVAC, Pest Control).
2. **Prioritization**: Triage urgency (Emergency, High, Normal, Low).
3. **Vendor Assignment**: Dispatch to verified external plumbers, electricians, or in-house caretakers.
4. **Cost Estimations & Approvals**: Contractor submits a quote; landlord approves before work commences.
5. **Expense Conversion**: Completed repairs automatically convert into expense entries under `Expenses` with attached contractor invoices.
6. **Move-in / Move-out Inspections**: Digital room-by-room condition checklists with time-stamped photos to protect both parties during deposit settlement.

---

## 7. Automated Communications & Notifications

### Current Limitations:
- The AI Assistant generates template email text in a modal, but requires the user to manually copy and paste the text into an external email app.
- No direct email dispatch, SMS dispatch, or WhatsApp messaging is integrated.

### Required Notification Infrastructure:
1. **Automated SMS Reminders**:
   - Integration with SMS gateways (e.g., Africa's Talking, Twilio).
   - Automated triggers: Rent due in 3 days, Rent overdue notice, Payment received confirmation SMS.
2. **Transactional Email Service**:
   - SendGrid, Amazon SES, or Postmark integration.
   - Branded HTML receipts sent immediately upon payment confirmation.
   - Monthly consolidated rent invoices sent on the 1st of each month.
3. **WhatsApp Business API**:
   - Direct payment links and rent reminders delivered via official WhatsApp messages.
4. **Push Notifications**:
   - Mobile and browser push notifications for urgent property announcements (e.g., water shutoff, maintenance schedule).

---

## 8. Document & Legal Lease Lifecycle

### Current Limitations:
- Leases are represented only by two date strings (`leaseStart`, `leaseEnd`).
- No physical or digital document storage.

### Required Document Capabilities:
- **Contract Generator**: Template engine that compiles tenant details, unit number, rent amount, and custom clauses into a legally binding PDF.
- **E-Signature Workflow**: In-app digital signature pad or integration with DocuSign/HelloSign.
- **Automated Lease Renewal**: Triggers 60 days and 30 days before expiration offering one-click renewal or notice to vacate.
- **Notice to Vacate / Eviction Workflows**: Automated generation of legal default and vacate notices adhering to local tenancy laws.

---

## 9. Accounting, Reporting & Compliance Gaps

### Current Limitations:
- Reports display charts based on the current in-memory dataset without date range filters, multi-property isolation, or export options beyond a simple payment CSV.
- No profit & loss statements, balance sheets, or tax reporting.

### Required Financial Tools:
- **Multi-Property Filtering**: Ability to view reports for a specific building or cross-portfolio.
- **Accrual vs. Cash Accounting**: Toggle between cash collected and rent accrued.
- **Tax / Withholding Tax Reports**: Automated calculations for Rental Income Tax (e.g., MRI in Kenya) and deductible operational costs.
- **Export Options**: Export financial reports directly to Excel (.xlsx), PDF with company letterhead, and integration with QuickBooks or Xero.

---

## 10. Phased Implementation Roadmap

```
Phase 1: Foundation (Weeks 1-4)
├── PostgreSQL Database Schema & Migrations (Prisma/Drizzle)
├── Express/Node.js REST API with JWT Authentication & RBAC
├── Full CRUD Endpoints for Properties, Units, Tenants, Payments, Expenses
└── Cloud Storage for Media & Documents

Phase 2: Payment Gateway & Automation (Weeks 5-8)
├── M-Pesa Daraja API (STK Push & C2B Webhook Confirmation)
├── Stripe / Card Integration
├── Automated Rent Ledger & Invoicing Engine
└── Background Cron Jobs for Automated Rent Reminders

Phase 3: Communication & Document Rails (Weeks 9-12)
├── Africa's Talking / Twilio SMS Dispatch
├── SendGrid Transactional Email Pipeline
├── PDF Lease & Invoice Generation Service
└── In-App Digital Signature Pad

Phase 4: Tenant & Contractor Portals (Weeks 13-16)
├── Tenant Self-Service Mobile Web Portal
├── Maintenance Work Order Ticketing System
├── Vendor & Contractor Management Module
└── Inspection Checklist with Camera Photo Uploads

Phase 5: Enterprise Analytics & Hardening (Weeks 17-20)
├── QuickBooks / Xero Accounting Export
├── Tax / P&L Reporting Engine
├── Multi-Landlord / Multi-Branch SaaS Tenancy
└── Security Penetration Testing & SLA Monitoring
```
