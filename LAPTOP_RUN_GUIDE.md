# 💻 Running PropMinds on Any Laptop (Quickstart Guide)

This guide covers how to clone, set up, and run the **PropMinds Property Management System** on any laptop running **Windows**, **macOS**, or **Linux**.

---

## ⚡ 60-Second Quickstart

### 1. Requirements
Ensure you have **Node.js (version 18 or higher)** installed.
- Check if installed:
  ```bash
  node -v
  npm -v
  ```
- If not installed, download from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies
Open your terminal inside the project directory and run:
```bash
npm install
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

### Default Credentials
- **Username:** `admin`
- **Password:** `password`
*(Changeable at any time under `/settings`)*

---

## 💻 Operating System Specific Tips

### 🪟 Windows Laptops
- You can simply double-click `start-propminds.bat` in the root folder to start both the server and your default web browser automatically!
- For detailed instructions on running offline, setting up auto-boot, configuring Windows Defender Firewall, or packaging as a standalone `.exe`, see **[WINDOWS_SETUP_GUIDE.md](WINDOWS_SETUP_GUIDE.md)**.

### 🍎 macOS Laptops
- Open **Terminal**.
- Navigate to the folder: `cd /path/to/ApartmentSystem`
- Run `npm install` and `npm run dev`.
- To create a 1-click launcher on macOS, create a file `start.command`:
  ```bash
  #!/bin/bash
  cd "$(dirname "$0")"
  open "http://localhost:3000"
  npm run dev
  ```
  Make it executable: `chmod +x start.command`.

### 🐧 Linux (Ubuntu / Debian / Fedora)
- Run `npm install` and `npm run dev`.
- Works on native systemd services if you wish to host it on an in-office server.

---

## 📱 Mobile & Tablet Access on Local WiFi

Your laptop can act as the main server for your property:
1. Ensure your laptop and smartphone/tablet are on the same WiFi network.
2. Find your laptop's local IP address:
   - **Windows:** `ipconfig` (look for IPv4, e.g. `192.168.1.50`)
   - **macOS / Linux:** `ifconfig` or `ip a`
3. On your phone's browser, open `http://<your-laptop-ip>:3000` (e.g. `http://192.168.1.50:3000`).
4. You can now walk around the apartments collecting rent or inspecting units while updating records on your phone!

---

## 🛠️ Key Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Runs the development server at `http://0.0.0.0:3000` with hot-reloading |
| `npm run build` | Compiles TypeScript and creates optimized production assets in `/dist` |
| `npm run preview` | Runs the local production server to test the compiled build |
| `npm run lint` | Runs `tsc --noEmit` to verify type safety and catch errors |

---

## 📦 Data Storage & Offline Operation
- **Offline Capable:** PropMinds works completely offline without needing an active internet connection (Gemini AI features require internet if used).
- **Persistence:** All properties, units, tenants, lease documents, payments, and work orders are automatically saved to your browser's persistent storage. Data remains safely intact when restarting your computer or closing your browser.
