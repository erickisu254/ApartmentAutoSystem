# Backend Implementation Guide

This guide outlines how to migrate **PropMinds** from a mock-data React app to a full stack application using **Node.js, Express, and PostgreSQL**.

## 1. Prerequisites

- Node.js & npm installed.
- PostgreSQL installed and running.
- A tool like DBeaver or pgAdmin to manage your database.

## 2. Project Initialization

Create a new folder alongside your frontend (e.g., `/server`).

```bash
mkdir server
cd server
npm init -y
npm install express pg cors dotenv jsonwebtoken bcryptjs helmet
npm install --save-dev nodemon @types/express @types/pg @types/cors @types/jsonwebtoken
```

## 3. Database Schema (SQL)

Run the following SQL script to create the necessary tables in your PostgreSQL database.

```sql
CREATE DATABASE propminds_db;

-- Users (Admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties (Buildings/Plots)
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    image_url TEXT
);

-- Units (Apartments/Rooms)
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Vacant', -- 'Occupied', 'Vacant', 'Maintenance'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    lease_start DATE,
    lease_end DATE,
    occupants INTEGER DEFAULT 1,
    unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Previous'
    paid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
    unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(50), -- 'Bank', 'Cash', 'Mobile'
    type VARCHAR(50),   -- 'Rent', 'Deposit'
    status VARCHAR(20) DEFAULT 'Completed',
    notes TEXT
);

-- Expenses
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL, -- NULL implies 'General/Overhead'
    category VARCHAR(50) NOT NULL, -- 'Maintenance', 'Utilities', 'Tax', etc.
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(50) DEFAULT 'Admin',
    related_to_id INTEGER NOT NULL,
    related_to_type VARCHAR(20) NOT NULL, -- 'tenant' or 'unit'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. Backend Server Setup (`server/index.js`)

Create a basic Express server with a database connection.

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Middleware for verifying JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ROUTES ---

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // In production: Fetch user from DB and compare bcrypt hash
  // For demo: Mock check
  if(username === 'admin' && password === 'password') {
      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
  } else {
      res.status(401).send('Invalid credentials');
  }
});

// Get All Data (Dashboard Loading)
app.get('/api/dashboard-data', authenticateToken, async (req, res) => {
  try {
    const properties = await pool.query('SELECT * FROM properties');
    const units = await pool.query('SELECT * FROM units');
    const tenants = await pool.query('SELECT * FROM tenants');
    const payments = await pool.query('SELECT * FROM payments');
    const expenses = await pool.query('SELECT * FROM expenses');
    
    res.json({
      properties: properties.rows,
      units: units.rows,
      tenants: tenants.rows,
      payments: payments.rows,
      expenses: expenses.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Create Tenant Example
app.post('/api/tenants', authenticateToken, async (req, res) => {
  const { fullName, phone, idNumber, unitId, leaseStart, leaseEnd, occupants } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tenants (full_name, phone, id_number, unit_id, lease_start, lease_end, occupants) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [fullName, phone, idNumber, unitId, leaseStart, leaseEnd, occupants]
    );
    
    // If unitId exists, update Unit status to Occupied
    if (unitId) {
        await pool.query("UPDATE units SET status = 'Occupied' WHERE id = $1", [unitId]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 5. Connecting Frontend to Backend

To connect your React App to this new backend, you need to modify `context/AppContext.tsx`.

**Steps:**

1.  **Remove Mock Data:** Remove imports from `constants.ts`.
2.  **Add Fetch Logic:**

```typescript
// context/AppContext.tsx (Refactor)

// ... existing imports

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Fetch data on load if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
        fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
      try {
          const res = await fetch('http://localhost:5000/api/dashboard-data', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          // Map API response to State
          setProperties(data.properties);
          setUnits(data.units);
          setTenants(data.tenants);
          setPayments(data.payments);
          setExpenses(data.expenses);
      } catch (error) {
          console.error("Failed to fetch data", error);
      }
  };

  const login = async (u: string, p: string) => {
      const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
      });
      
      if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setIsAuthenticated(true);
          return true;
      }
      return false;
  };

  // Example: Replace addTenant with API call
  const addTenant = async (t: Tenant) => {
      const res = await fetch('http://localhost:5000/api/tenants', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(t)
      });
      const newTenant = await res.json();
      setTenants([...tenants, newTenant]);
  };

  // ... Implement similar API calls for other actions (addExpense, recordPayment, etc.)
};
```

## 6. Deployment

1.  **Frontend:** Deploy the React app to Vercel, Netlify, or AWS Amplify.
2.  **Backend:** Deploy the Node.js app to Heroku, Railway, or DigitalOcean.
3.  **Database:** Use a managed PostgreSQL instance (e.g., Supabase, AWS RDS, or Neon).