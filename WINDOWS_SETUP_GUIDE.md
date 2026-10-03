# 🪟 PropMinds - Windows Laptop End-to-End Setup & Deployment Guide

This guide walks you through running **PropMinds Property Management System** on a Windows laptop (Windows 10 or 11), turning it into a 1-click desktop tool, and upgrading it into a fully functional, enterprise end-to-end system with local network access, automated startup, and persistent databases.

---

## 📋 Table of Contents
1. [Prerequisites Installation (Node.js & Git)](#1-prerequisites-installation)
2. [Step-by-Step: Running for the First Time](#2-running-for-the-first-time)
3. [Create a 1-Click Desktop Launcher (`.bat`)](#3-create-a-1-click-desktop-launcher)
4. [Turn PropMinds into an Installable Desktop App (PWA)](#4-turn-propminds-into-an-installable-desktop-app)
5. [Accessing PropMinds from Other Devices on Local WiFi (LAN)](#5-accessing-from-other-phones-or-laptops-on-wifi)
6. [Making it a Permanent Windows Background Service (Auto-Start on Boot)](#6-auto-start-on-windows-boot-as-a-service)
7. [Upgrading to a Fully Functional End-to-End Backend System](#7-upgrading-to-a-production-end-to-end-backend)
8. [Automated Daily Data Backups on Windows](#8-automated-daily-data-backups)
9. [Windows Troubleshooting FAQ](#9-windows-troubleshooting-faq)

---

## 1. Prerequisites Installation

You only need to install **Node.js** (LTS) on your Windows laptop once.

### Option A: Using Windows Terminal / PowerShell (Fastest)
Open **PowerShell** as Administrator (press `Win + X` and select **Terminal** or **PowerShell**):
```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```
*Restart PowerShell after the installation finishes.*

### Option B: Using the Official Web Installers
1. **Node.js**: Download and install the LTS version from [https://nodejs.org/](https://nodejs.org/) (click the button labeled "LTS - Recommended for most users"). Check the box to automatically install necessary tools if prompted.
2. **Git** (Optional but recommended): Download from [https://git-scm.com/download/win](https://git-scm.com/download/win).

### Verify Installation
In your Windows Command Prompt (`cmd.exe`) or PowerShell:
```cmd
node -v
npm -v
```
You should see version numbers like `v20.x.x` or `v22.x.x`.

---

## 2. Running for the First Time

1. **Extract or Open the Folder**:
   Place the `ApartmentSystem` project folder on your laptop, for example:
   `C:\Users\YourName\Documents\ApartmentSystem` or `C:\PropMinds`.

2. **Open the Terminal in this Folder**:
   - Open Windows File Explorer to the folder.
   - Click the address bar at the top, type `cmd` and press **Enter**.
   - A command prompt will open directly in your project folder!

3. **Install Dependencies**:
   ```cmd
   npm install
   ```

4. **Launch the Development Server**:
   ```cmd
   npm run dev
   ```

5. **Open PropMinds**:
   Open **Google Chrome**, **Microsoft Edge**, or **Firefox** and visit:
   ```
   http://localhost:3000
   ```

### Default Login
- **Username:** `admin`
- **Password:** `password`
*(You can change your username and password anytime in the **Settings** tab).*

---

## 3. Create a 1-Click Desktop Launcher

You do not need to open a black terminal window every time. You can create a desktop double-click launcher!

### Step 1: Create `start-propminds.bat`
In the root folder of your project, create a text file named `start-propminds.bat` with the following contents:

```bat
@echo off
title PropMinds Property Management System
cd /d "%~dp0"
echo ========================================================
echo Starting PropMinds Property Management System...
echo ========================================================
echo.
start "" "http://localhost:3000"
npm run dev
pause
```

### Step 2: Put a Shortcut on your Windows Desktop
1. Right-click `start-propminds.bat`.
2. Click **Show more options** > **Send to** > **Desktop (create shortcut)**.
3. On your desktop, right-click the shortcut > **Properties**:
   - Click **Change Icon** and pick an icon of your choice.
   - Rename the shortcut to **PropMinds Property Management**.
4. Double-clicking this shortcut will automatically open the server and your browser!

---

## 4. Turn PropMinds into an Installable Desktop App

You can run PropMinds without browser tabs or address bars as a native window:

1. Open `http://localhost:3000` in **Microsoft Edge** or **Google Chrome**.
2. Look at the top right of the URL address bar:
   - In **Edge**: Click the icon with 3 squares and a plus sign ("App available. Install PropMinds").
   - In **Chrome**: Click the download icon in the URL bar ("Install PropMinds") or click the 3-dots menu > **Save and share** > **Install page as app**.
3. Click **Install**.
4. PropMinds will now launch in its own standalone window and will appear in your Windows Start Menu, Taskbar, and Desktop just like Microsoft Word or Excel!

---

## 5. Accessing from Other Phones or Laptops on WiFi

You can use your Windows laptop as the central property management server and access it from your phone, iPad, or staff laptops on the same WiFi network.

### Step 1: Find your Laptop's Local IP Address
In Command Prompt:
```cmd
ipconfig
```
Look for **IPv4 Address** under your WiFi adapter (e.g., `192.168.1.45` or `192.168.100.12`).

### Step 2: Allow Port 3000 in Windows Defender Firewall
Run this single command in **PowerShell as Administrator**:
```powershell
New-NetFirewallRule -DisplayName "PropMinds Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Step 3: Connect from Any Phone or Device
On your smartphone connected to the same WiFi:
Open the browser and enter:
```
http://192.168.1.45:3000
```
*(Replace `192.168.1.45` with your laptop's actual IP).*
You can now record rent payments on your phone while walking through the apartments!

---

## 6. Auto-Start on Windows Boot as a Service

If you want the PropMinds server to run continuously in the background whenever Windows starts up (even before logging in):

### Method A: Windows Startup Folder (Easiest)
1. Press `Win + R`, type `shell:startup` and press **Enter**.
2. Create a shortcut to your `start-propminds.bat` in this folder.
3. PropMinds will now automatically boot every time you turn on your laptop.

### Method B: Professional Background Service using PM2
```cmd
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
pm2 start "npm run dev" --name "propminds"
pm2 save
```
PropMinds will now run quietly in the background without any command prompt window showing.

---

## 7. Upgrading to a Production End-to-End Backend

PropMinds currently stores records directly in your browser's persistent storage (`localStorage`). To make it an enterprise system with multi-user concurrency and relational SQL databases:

### Option 1: Standalone Windows Production Build
To make the application blazing fast and consume less battery on your laptop:
```cmd
npm run build
npm run preview
```
This builds an optimized production bundle in the `/dist` directory.

### Option 2: Connecting an Express + PostgreSQL / SQLite Backend
For a full multi-user database backend running locally on Windows:
1. Refer to [BACKEND_GUIDE.md](BACKEND_GUIDE.md) in the project.
2. Install **PostgreSQL for Windows** from [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) or use **SQLite** (a single-file zero-config database that requires no external database server).
3. The schema and REST API endpoints are fully documented in `BACKEND_GUIDE.md`.

---

## 8. Automated Daily Data Backups

### 1. Manual In-App Backup
You can export all payments to CSV anytime in the **Reports** section using the **Export CSV** button.

### 2. Browser Storage Backup Script
If you want to backup your database state automatically, you can export your records from Settings or copy your browser profile data. When connected to PostgreSQL or SQLite, a simple Windows batch script can run via Windows Task Scheduler:
```cmd
pg_dump -U postgres propminds > C:\PropMinds_Backups\backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.sql
```

---

## 9. Windows Troubleshooting FAQ

### Q1: `node: command not found` or `'npm' is not recognized`
- **Solution:** You installed Node.js but haven't restarted your Command Prompt. Close all command windows and reopen them. If still not working, restart your laptop so Windows reloads the `PATH` environment variable.

### Q2: Port 3000 is already in use (`EADDRINUSE: address already in use 0.0.0.0:3000`)
- **Solution:** Another program or an old instance of PropMinds is running on port 3000. In Command Prompt:
  ```cmd
  netstat -ano | findstr :3000
  ```
  Look for the PID number at the right (e.g. `14280`), and terminate it:
  ```cmd
  taskkill /PID 14280 /F
  ```
  Then run `npm run dev` again.

### Q3: When I print receipts, it prints page headers and footers (like URL and date)
- **Solution:** In the print preview window:
  1. Click **More settings**.
  2. Uncheck **Headers and footers**.
  3. Set **Margins** to **None** or **Default**.
  The receipt or tenant statement will print cleanly on your printer or save as a PDF.
