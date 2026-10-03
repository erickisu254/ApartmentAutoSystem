const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "propminds_secret_key_fallback_2026";

// Middleware - configured safely for AI Studio preview iframe
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------------- DATABASE SETUP & IN-MEMORY FALLBACK ----------------
// When PostgreSQL is not connected, provide an in-memory SQL query adapter
// so that all database operations in server.js work seamlessly.
const inMemoryData = {
  users: [
    {
      id: "u_admin",
      username: "admin",
      password_hash: bcrypt.hashSync("password", 10),
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  properties: [
    {
      id: "p1",
      name: "Sunset Apartments",
      address: "124 Sunset Blvd, CA",
      image: "https://picsum.photos/400/300?random=1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p2",
      name: "Highland Heights",
      address: "89 Highland Ave, NY",
      image: "https://picsum.photos/400/300?random=2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  units: [
    {
      id: "u1",
      property_id: "p1",
      name: "Apt 101",
      floor: "Ground Floor",
      unit_type: "2 Bedroom",
      unit_type_note: "Big Master Bedroom with Balcony",
      utility_note: "Water deposit is Ksh 1,000 paid upon entry",
      rent_amount: 15000,
      deposit_amount: 15000,
      status: "Occupied",
      tenant_id: "t1",
      water_meter_number: "WM-101-G",
      initial_water_reading: 124.5,
      initial_water_reading_date: "2023-01-01",
      current_water_reading: 138.2,
      current_water_reading_date: "2023-11-25",
      final_water_reading: null,
      final_water_reading_date: null,
      previous_water_reading: 124.5,
      water_reading_date: "2023-11-25",
      water_rate_per_unit: 150.0,
      features: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "u2",
      property_id: "p1",
      name: "Apt 102",
      floor: "Ground Floor",
      unit_type: "Single Room",
      unit_type_note: "Big room with kitchenette",
      utility_note: "Water deposit is 1000",
      rent_amount: 8500,
      deposit_amount: 8500,
      status: "Vacant",
      tenant_id: null,
      water_meter_number: "WM-102-G",
      initial_water_reading: 89.0,
      initial_water_reading_date: "2023-10-01",
      current_water_reading: 89.0,
      current_water_reading_date: "2023-11-20",
      final_water_reading: null,
      final_water_reading_date: null,
      previous_water_reading: 89.0,
      water_reading_date: "2023-11-20",
      water_rate_per_unit: 150.0,
      features: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "u3",
      property_id: "p1",
      name: "Apt 201",
      floor: "1st Floor",
      unit_type: "3 Bedroom",
      unit_type_note: "Spacious family unit",
      utility_note: "Water deposit is 1500",
      rent_amount: 18000,
      deposit_amount: 18000,
      status: "Maintenance",
      tenant_id: null,
      water_meter_number: "WM-201-F1",
      initial_water_reading: 210.0,
      initial_water_reading_date: "2023-05-10",
      current_water_reading: 215.3,
      current_water_reading_date: "2023-11-18",
      final_water_reading: 215.3,
      final_water_reading_date: "2023-11-18",
      previous_water_reading: 210.0,
      water_reading_date: "2023-11-18",
      water_rate_per_unit: 150.0,
      features: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "u4",
      property_id: "p2",
      name: "Unit A",
      floor: "1st Floor",
      unit_type: "2 Bedroom",
      unit_type_note: "Master Ensuite with large wardrobes",
      utility_note: "Water deposit is 1000",
      rent_amount: 25000,
      deposit_amount: 30000,
      status: "Occupied",
      tenant_id: "t2",
      water_meter_number: "WM-H1-A",
      initial_water_reading: 340.2,
      initial_water_reading_date: "2023-02-15",
      current_water_reading: 356.8,
      current_water_reading_date: "2023-11-28",
      final_water_reading: null,
      final_water_reading_date: null,
      previous_water_reading: 340.2,
      water_reading_date: "2023-11-28",
      water_rate_per_unit: 150.0,
      features: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "u5",
      property_id: "p2",
      name: "Unit B",
      floor: "2nd Floor",
      unit_type: "Penthouse",
      unit_type_note: "Rooftop terrace view",
      utility_note: "Water deposit is 2000",
      rent_amount: 28000,
      deposit_amount: 28000,
      status: "Vacant",
      tenant_id: null,
      water_meter_number: "WM-H2-B",
      initial_water_reading: 180.0,
      initial_water_reading_date: "2023-04-01",
      current_water_reading: 180.0,
      current_water_reading_date: "2023-11-15",
      final_water_reading: null,
      final_water_reading_date: null,
      previous_water_reading: 180.0,
      water_reading_date: "2023-11-15",
      water_rate_per_unit: 150.0,
      features: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  tenants: [
    {
      id: "t1",
      full_name: "John Doe",
      email: "john.doe@example.com",
      phone: "+254 700 000101",
      id_number: "ID987654321",
      lease_start: "2023-01-01",
      lease_end: "2024-01-01",
      occupants: 2,
      unit_id: "u1",
      previous_unit_id: null,
      previous_unit_name: null,
      status: "Active",
      paid_until: "2023-11-30",
      lease_signed: false,
      lease_signature: null,
      lease_signed_date: null,
      documents: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "t2",
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+254 700 000202",
      id_number: "ID123456789",
      lease_start: "2023-06-01",
      lease_end: "2024-06-01",
      occupants: 1,
      unit_id: "u4",
      previous_unit_id: null,
      previous_unit_name: null,
      status: "Active",
      paid_until: "2023-10-31",
      lease_signed: false,
      lease_signature: null,
      lease_signed_date: null,
      documents: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  payments: [
    {
      id: "pay1",
      tenant_id: "t1",
      unit_id: "u1",
      amount: "15000.00",
      date: "2023-10-01",
      method: "Bank Transfer",
      type: "Rent",
      rent_portion: "15000.00",
      deposit_portion: "0.00",
      status: "Completed",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "pay2",
      tenant_id: "t1",
      unit_id: "u1",
      amount: "15000.00",
      date: "2023-11-01",
      method: "Bank Transfer",
      type: "Rent",
      rent_portion: "15000.00",
      deposit_portion: "0.00",
      status: "Completed",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "pay3",
      tenant_id: "t2",
      unit_id: "u4",
      amount: "25000.00",
      date: "2023-10-05",
      method: "Card",
      type: "Deposit",
      rent_portion: "0.00",
      deposit_portion: "25000.00",
      status: "Completed",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  expenses: [
    {
      id: "e1",
      property_id: "p1",
      category: "Maintenance",
      amount: "5000.00",
      date: "2023-10-10",
      description: "Plumbing repair Apt 101",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "e2",
      property_id: "p1",
      category: "Utilities",
      amount: "2500.00",
      date: "2023-10-28",
      description: "Common area electricity",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "e3",
      property_id: "p2",
      category: "Maintenance",
      amount: "12000.00",
      date: "2023-11-05",
      description: "Roof leak repair",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "e4",
      property_id: "p2",
      category: "Tax",
      amount: "8000.00",
      date: "2023-11-15",
      description: "Property Tax Installment",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "e5",
      property_id: "p1",
      category: "Other",
      amount: "1500.00",
      date: "2023-11-20",
      description: "Cleaning supplies",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  maintenance_tickets: [
    {
      id: "m1",
      property_id: "p1",
      unit_id: "u3",
      tenant_id: null,
      title: "Water pipe leak in kitchen",
      description: "Under-sink copper pipe joint leaking during high pressure. Requires replacement washer and pipe seal.",
      category: "Plumbing",
      priority: "High",
      status: "In Progress",
      estimated_cost: "4500.00",
      actual_cost: null,
      reported_date: "2023-11-18",
      scheduled_date: "2023-11-20",
      completed_date: null,
      contractor_name: "Apex Plumbing Services",
      contractor_phone: "+254 722 110022",
      converted_to_expense: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "m2",
      property_id: "p1",
      unit_id: "u1",
      tenant_id: "t1",
      title: "Faulty bathroom exhaust fan",
      description: "Exhaust fan making loud screeching motor noise. Tenant requested replacement.",
      category: "Electrical",
      priority: "Medium",
      status: "Open",
      estimated_cost: "3000.00",
      actual_cost: null,
      reported_date: "2023-11-22",
      scheduled_date: null,
      completed_date: null,
      contractor_name: null,
      contractor_phone: null,
      converted_to_expense: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "m3",
      property_id: "p2",
      unit_id: "u4",
      tenant_id: "t2",
      title: "Window latch latch repair",
      description: "Master bedroom window latch stuck and unable to lock securely.",
      category: "Structural",
      priority: "Low",
      status: "Completed",
      estimated_cost: "1500.00",
      actual_cost: "1200.00",
      reported_date: "2023-10-12",
      scheduled_date: "2023-10-14",
      completed_date: "2023-10-15",
      contractor_name: "QuickFix Handyman",
      contractor_phone: "+254 711 334455",
      converted_to_expense: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  notes: [
    {
      id: "n1",
      target_type: "tenant",
      target_id: "t1",
      content: "Tenant requested heater repair.",
      author: "Admin",
      created_at: "2023-11-15T10:00:00Z",
    },
  ],
};

function executeInMemoryQuery(text, params = []) {
  const q = text.trim();
  const lower = q.toLowerCase();

  // DDL / Control queries
  if (
    lower.startsWith("create ") ||
    lower.startsWith("alter ") ||
    lower.startsWith("do $$") ||
    lower.startsWith("begin") ||
    lower.startsWith("commit") ||
    lower.startsWith("rollback")
  ) {
    return { rows: [], rowCount: 0 };
  }

  // USERS
  if (lower.startsWith("select id from users where username = $1")) {
    const found = inMemoryData.users.find((u) => u.username === params[0]);
    return { rows: found ? [{ id: found.id }] : [], rowCount: found ? 1 : 0 };
  }
  if (lower.startsWith("select * from users where username = $1")) {
    const found = inMemoryData.users.find((u) => u.username === params[0]);
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (lower.startsWith("select * from users where id = $1")) {
    const found = inMemoryData.users.find((u) => u.id === params[0]);
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (lower.startsWith("insert into users")) {
    const user = {
      id: `u_${Date.now()}`,
      username: params[0],
      password_hash: params[1],
      role: params[2] || "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.users.push(user);
    return { rows: [user], rowCount: 1 };
  }
  if (lower.startsWith("update users set username = $1, password_hash = $2")) {
    const user = inMemoryData.users.find((u) => u.id === params[2]);
    if (user) {
      user.username = params[0];
      user.password_hash = params[1];
      user.updated_at = new Date().toISOString();
      return { rows: [user], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // PROPERTIES
  if (lower.startsWith("select * from properties")) {
    return { rows: [...inMemoryData.properties], rowCount: inMemoryData.properties.length };
  }
  if (lower.startsWith("insert into properties")) {
    const prop = {
      id: params[0],
      name: params[1],
      address: params[2],
      image: params[3] || "https://picsum.photos/400/300?random=1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.properties.unshift(prop);
    return { rows: [prop], rowCount: 1 };
  }
  if (lower.startsWith("update properties set name = $1, address = $2, image = $3")) {
    const prop = inMemoryData.properties.find((p) => p.id === params[3]);
    if (prop) {
      prop.name = params[0];
      prop.address = params[1];
      prop.image = params[2];
      prop.updated_at = new Date().toISOString();
      return { rows: [prop], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("delete from properties where id = $1")) {
    const idx = inMemoryData.properties.findIndex((p) => p.id === params[0]);
    if (idx !== -1) {
      const deleted = inMemoryData.properties.splice(idx, 1)[0];
      return { rows: [{ id: deleted.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // UNITS
  if (lower.startsWith("select * from units")) {
    return { rows: [...inMemoryData.units], rowCount: inMemoryData.units.length };
  }
  if (lower.startsWith("select name from units where id = $1")) {
    const unit = inMemoryData.units.find((u) => u.id === params[0]);
    return { rows: unit ? [{ name: unit.name }] : [], rowCount: unit ? 1 : 0 };
  }
  if (lower.startsWith("select rent_amount from units where id = $1")) {
    const unit = inMemoryData.units.find((u) => u.id === params[0]);
    return { rows: unit ? [{ rent_amount: unit.rent_amount }] : [], rowCount: unit ? 1 : 0 };
  }
  if (lower.startsWith("insert into units")) {
    const unit = {
      id: params[0],
      property_id: params[1],
      name: params[2],
      floor: params[3] || "Ground Floor",
      unit_type: params[4] || "1 Bedroom",
      unit_type_note: params[5] || null,
      utility_note: params[6] || null,
      rent_amount: Number(params[7]) || 0,
      deposit_amount: Number(params[8]) || 0,
      status: params[9] || "Vacant",
      water_meter_number: params[10] || null,
      initial_water_reading: Number(params[11]) || 0,
      initial_water_reading_date: params[12] || null,
      current_water_reading: Number(params[13]) || 0,
      current_water_reading_date: params[14] || null,
      final_water_reading: params[15] ? Number(params[15]) : null,
      final_water_reading_date: params[16] || null,
      tenant_id: null,
      features: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.units.push(unit);
    return { rows: [unit], rowCount: 1 };
  }
  if (lower.startsWith("update units set name = $1") || lower.includes("where id = $17")) {
    const id = params[16];
    const unit = inMemoryData.units.find((u) => u.id === id);
    if (unit) {
      unit.name = params[0];
      unit.floor = params[1];
      unit.unit_type = params[2];
      unit.unit_type_note = params[3];
      unit.utility_note = params[4];
      unit.rent_amount = Number(params[5]);
      unit.deposit_amount = Number(params[6]);
      unit.status = params[7];
      unit.tenant_id = params[8];
      unit.water_meter_number = params[9];
      unit.initial_water_reading = Number(params[10]);
      unit.initial_water_reading_date = params[11];
      unit.current_water_reading = Number(params[12]);
      unit.current_water_reading_date = params[13];
      unit.final_water_reading = params[14] ? Number(params[14]) : null;
      unit.final_water_reading_date = params[15];
      unit.updated_at = new Date().toISOString();
      return { rows: [unit], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("update units set current_water_reading = $1")) {
    const id = params[4];
    const unit = inMemoryData.units.find((u) => u.id === id);
    if (unit) {
      unit.current_water_reading = Number(params[0]);
      unit.current_water_reading_date = params[1];
      if (params[2] !== undefined && params[2] !== null) unit.final_water_reading = Number(params[2]);
      if (params[3] !== undefined && params[3] !== null) unit.final_water_reading_date = params[3];
      unit.updated_at = new Date().toISOString();
      return { rows: [unit], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("update units set status = 'occupied', tenant_id = $1 where id = $2")) {
    const unit = inMemoryData.units.find((u) => u.id === params[1]);
    if (unit) {
      unit.status = "Occupied";
      unit.tenant_id = params[0];
      return { rows: [unit], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("update units set status = 'vacant', tenant_id = null where id = $1")) {
    const unit = inMemoryData.units.find((u) => u.id === params[0]);
    if (unit) {
      unit.status = "Vacant";
      unit.tenant_id = null;
      return { rows: [unit], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // TENANTS
  if (lower.startsWith("select * from tenants")) {
    return { rows: [...inMemoryData.tenants], rowCount: inMemoryData.tenants.length };
  }
  if (lower.startsWith("select status, unit_id from tenants where id = $1")) {
    const tenant = inMemoryData.tenants.find((t) => t.id === params[0]);
    return { rows: tenant ? [{ status: tenant.status, unit_id: tenant.unit_id }] : [], rowCount: tenant ? 1 : 0 };
  }
  if (lower.startsWith("select paid_until, lease_start from tenants where id = $1")) {
    const tenant = inMemoryData.tenants.find((t) => t.id === params[0]);
    return {
      rows: tenant ? [{ paid_until: tenant.paid_until, lease_start: tenant.lease_start }] : [],
      rowCount: tenant ? 1 : 0,
    };
  }
  if (lower.startsWith("insert into tenants")) {
    const tenant = {
      id: params[0],
      full_name: params[1],
      email: params[2] || null,
      phone: params[3],
      id_number: params[4] || null,
      lease_start: params[5] || null,
      lease_end: params[6] || null,
      occupants: Number(params[7]) || 1,
      unit_id: params[8] || null,
      status: params[9] || "Active",
      paid_until: null,
      lease_signed: false,
      lease_signature: null,
      lease_signed_date: null,
      documents: "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.tenants.unshift(tenant);
    return { rows: [tenant], rowCount: 1 };
  }
  if (lower.startsWith("update tenants set paid_until = $1 where id = $2")) {
    const tenant = inMemoryData.tenants.find((t) => t.id === params[1]);
    if (tenant) {
      tenant.paid_until = params[0];
      return { rows: [tenant], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("update tenants set status = 'previous'")) {
    const tenant = inMemoryData.tenants.find((t) => t.id === params[1]);
    if (tenant) {
      tenant.status = "Previous";
      tenant.previous_unit_name = params[0];
      tenant.previous_unit_id = tenant.unit_id;
      tenant.unit_id = null;
      return { rows: [tenant], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("update tenants set status = 'active' where id = $1")) {
    const tenant = inMemoryData.tenants.find((t) => t.id === params[0]);
    if (tenant) {
      tenant.status = "Active";
      return { rows: [tenant], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("update tenants set lease_signed = true")) {
    const tenant = inMemoryData.tenants.find((t) => t.id === params[2]);
    if (tenant) {
      tenant.lease_signed = true;
      tenant.lease_signature = params[0];
      tenant.lease_signed_date = params[1];
      return { rows: [tenant], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (lower.startsWith("delete from tenants where id = $1")) {
    const idx = inMemoryData.tenants.findIndex((t) => t.id === params[0]);
    if (idx !== -1) {
      inMemoryData.tenants.splice(idx, 1);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // PAYMENTS
  if (lower.startsWith("select * from payments")) {
    return { rows: [...inMemoryData.payments], rowCount: inMemoryData.payments.length };
  }
  if (lower.startsWith("insert into payments")) {
    const payment = {
      id: params[0],
      tenant_id: params[1],
      unit_id: params[2],
      amount: String(params[3]),
      date: params[4],
      method: params[5],
      type: params[6],
      rent_portion: String(params[7] || "0.00"),
      deposit_portion: String(params[8] || "0.00"),
      status: params[9] || "Completed",
      notes: params[10] || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.payments.unshift(payment);
    return { rows: [payment], rowCount: 1 };
  }

  // EXPENSES
  if (lower.startsWith("select * from expenses")) {
    return { rows: [...inMemoryData.expenses], rowCount: inMemoryData.expenses.length };
  }
  if (lower.startsWith("insert into expenses")) {
    const expense = {
      id: params[0],
      property_id: params[1] || null,
      category: params[2],
      amount: String(params[3]),
      date: params[4],
      description: params[5],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.expenses.unshift(expense);
    return { rows: [expense], rowCount: 1 };
  }

  // MAINTENANCE
  if (lower.startsWith("select * from maintenance_tickets")) {
    return { rows: [...inMemoryData.maintenance_tickets], rowCount: inMemoryData.maintenance_tickets.length };
  }
  if (lower.startsWith("select * from maintenance_tickets where id = $1")) {
    const t = inMemoryData.maintenance_tickets.find((m) => m.id === params[0]);
    return { rows: t ? [t] : [], rowCount: t ? 1 : 0 };
  }
  if (lower.startsWith("insert into maintenance_tickets")) {
    const ticket = {
      id: params[0],
      property_id: params[1],
      unit_id: params[2] || null,
      tenant_id: params[3] || null,
      title: params[4],
      description: params[5],
      category: params[6] || "General",
      priority: params[7] || "Medium",
      status: params[8] || "Open",
      estimated_cost: String(params[9] || "0.00"),
      actual_cost: null,
      reported_date: params[10],
      scheduled_date: null,
      completed_date: null,
      contractor_name: params[11] || null,
      contractor_phone: params[12] || null,
      converted_to_expense: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryData.maintenance_tickets.unshift(ticket);
    return { rows: [ticket], rowCount: 1 };
  }
  if (lower.startsWith("update maintenance_tickets set actual_cost = $1")) {
    const id = params[2];
    const ticket = inMemoryData.maintenance_tickets.find((m) => m.id === id);
    if (ticket) {
      ticket.actual_cost = String(params[0]);
      ticket.status = "Completed";
      ticket.converted_to_expense = true;
      ticket.completed_date = params[1];
      return { rows: [ticket], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // NOTES
  if (lower.startsWith("insert into notes")) {
    const note = {
      id: params[0],
      target_type: params[1],
      target_id: params[2],
      content: params[3],
      author: params[4] || "Landlord",
      created_at: params[5] || new Date().toISOString(),
    };
    inMemoryData.notes.push(note);
    return { rows: [note], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

// Resilient pool wrapper
let realPool = null;
if (process.env.DB_HOST) {
  try {
    realPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      connectionTimeoutMillis: 3000,
    });
  } catch (err) {
    console.warn("Could not create PG pool, will use in-memory store:", err.message);
  }
}

const pool = {
  async connect() {
    if (realPool) {
      try {
        return await realPool.connect();
      } catch (err) {
        console.warn("PostgreSQL connection failed, switching to in-memory fallback:", err.message);
        realPool = null;
      }
    }
    return {
      async query(sql, params) {
        return executeInMemoryQuery(sql, params);
      },
      release() {},
    };
  },
  async query(sql, params) {
    if (realPool) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        console.warn("PostgreSQL query failed, switching to in-memory fallback:", err.message);
        realPool = null;
      }
    }
    return executeInMemoryQuery(sql, params);
  },
};

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ error: "Access denied. The void demands a token." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// Production Schema Initialization
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log("Forging database tables...");
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS properties (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          address VARCHAR(255) NOT NULL,
          image TEXT DEFAULT 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS units (
          id VARCHAR(50) PRIMARY KEY,
          property_id VARCHAR(50) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          floor VARCHAR(50) DEFAULT 'Ground Floor',
          unit_type VARCHAR(100) DEFAULT '1 Bedroom',
          unit_type_note TEXT,
          utility_note TEXT,
          rent_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
          status VARCHAR(30) NOT NULL DEFAULT 'Vacant',
          tenant_id VARCHAR(50),
          water_meter_number VARCHAR(100),
          initial_water_reading NUMERIC(10, 2) DEFAULT 0.00,
          initial_water_reading_date DATE,
          current_water_reading NUMERIC(10, 2) DEFAULT 0.00,
          current_water_reading_date DATE,
          final_water_reading NUMERIC(10, 2),
          final_water_reading_date DATE,
          previous_water_reading NUMERIC(10, 2) DEFAULT 0.00,
          water_reading_date DATE,
          water_rate_per_unit NUMERIC(10, 2) DEFAULT 150.00,
          features JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenants (
          id VARCHAR(50) PRIMARY KEY,
          full_name VARCHAR(150) NOT NULL,
          email VARCHAR(150),
          phone VARCHAR(50) NOT NULL,
          id_number VARCHAR(100),
          lease_start DATE,
          lease_end DATE,
          occupants INTEGER DEFAULT 1,
          unit_id VARCHAR(50) REFERENCES units(id) ON DELETE SET NULL,
          previous_unit_id VARCHAR(50),
          previous_unit_name VARCHAR(100),
          status VARCHAR(20) NOT NULL DEFAULT 'Active',
          paid_until DATE,
          lease_signed BOOLEAN DEFAULT FALSE,
          lease_signature TEXT,
          lease_signed_date TIMESTAMP WITH TIME ZONE,
          documents JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_units_tenant') THEN
              ALTER TABLE units ADD CONSTRAINT fk_units_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
          END IF;
      END
      $$;

      CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(50) PRIMARY KEY,
          tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          unit_id VARCHAR(50) NOT NULL REFERENCES units(id) ON DELETE CASCADE,
          amount NUMERIC(12, 2) NOT NULL,
          date DATE NOT NULL,
          method VARCHAR(50) NOT NULL DEFAULT 'Mobile Money',
          type VARCHAR(50) NOT NULL DEFAULT 'Rent',
          rent_portion NUMERIC(12, 2) DEFAULT 0.00,
          deposit_portion NUMERIC(12, 2) DEFAULT 0.00,
          status VARCHAR(30) NOT NULL DEFAULT 'Completed',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS expenses (
          id VARCHAR(50) PRIMARY KEY,
          property_id VARCHAR(50) REFERENCES properties(id) ON DELETE SET NULL,
          category VARCHAR(50) NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          date DATE NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS maintenance_tickets (
          id VARCHAR(50) PRIMARY KEY,
          property_id VARCHAR(50) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
          unit_id VARCHAR(50) REFERENCES units(id) ON DELETE SET NULL,
          tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE SET NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(50) NOT NULL DEFAULT 'General',
          priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
          status VARCHAR(30) NOT NULL DEFAULT 'Open',
          estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
          actual_cost NUMERIC(12, 2),
          reported_date DATE NOT NULL,
          scheduled_date DATE,
          completed_date DATE,
          contractor_name VARCHAR(150),
          contractor_phone VARCHAR(50),
          converted_to_expense BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
          id VARCHAR(50) PRIMARY KEY,
          target_type VARCHAR(30) NOT NULL,
          target_id VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          author VARCHAR(100) NOT NULL DEFAULT 'Landlord',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
      CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
      CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
      CREATE INDEX IF NOT EXISTS idx_tenants_unit ON tenants(unit_id);
      CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_payments_unit ON payments(unit_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
      CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tickets(status);
    `);
    console.log("Database tables verified and ready.");
  } catch (err) {
    console.error("Failed to initialize database schema:", err.message);
  } finally {
    client.release();
  }
};

// Seed Default Admin User
const seedAdminUser = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id FROM users WHERE username = $1", [
      "admin",
    ]);
    if (res.rowCount === 0) {
      console.log("No admin found. Seeding default overlord...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("password", salt);
      await client.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
        ["admin", hash, "admin"]
      );
      console.log(
        "Default admin seeded (admin / password). Change this before going live."
      );
    }
  } catch (err) {
    console.error("Failed to seed admin:", err.message);
  } finally {
    client.release();
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "Cuchy is watching", database: realPool ? "postgres" : "in-memory" });
});

// ---------------- API ROUTES ----------------

// Authentication: Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rowCount === 0) {
      return res
        .status(401)
        .json({ error: "Invalid credentials. You do not exist here." });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res
        .status(401)
        .json({ error: "Invalid credentials. You do not exist here." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server failure." });
  }
});

// Authentication: Update Credentials
app.put("/api/auth/credentials", authenticateToken, async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  if (!currentPassword || !newUsername || !newPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid current password." });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await client.query(
      "UPDATE users SET username = $1, password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [newUsername, newHash, req.user.id]
    );

    res.json({
      message: "Credentials updated successfully. The vault is secure.",
    });
  } catch (err) {
    console.error("Credential update error:", err);
    res.status(500).json({ error: "Internal server failure." });
  } finally {
    client.release();
  }
});

// A protected test route
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  res.json({ message: "You are authenticated.", user: req.user });
});

// ---------------- PROPERTY ROUTES ----------------

app.get("/api/properties", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/properties", authenticateToken, async (req, res) => {
  const { name, address, image } = req.body;
  const id = `p_${Date.now()}`;
  try {
    const result = await pool.query(
      "INSERT INTO properties (id, name, address, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, name, address, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/properties/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, address, image } = req.body;
  try {
    const result = await pool.query(
      "UPDATE properties SET name = $1, address = $2, image = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [name, address, image, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Property not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/properties/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `
      UPDATE tenants
      SET status = 'Previous', previous_unit_id = unit_id, unit_id = NULL
      WHERE unit_id IN (SELECT id FROM units WHERE property_id = $1)
    `,
      [id]
    );

    const result = await client.query(
      "DELETE FROM properties WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) throw new Error("Property not found");

    await client.query("COMMIT");
    res.json({ success: true, deletedId: id });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------- UNIT ROUTES ----------------

const mapUnitRowToCamelCase = (u) => ({
  id: u.id,
  propertyId: u.property_id,
  name: u.name,
  floor: u.floor,
  unitType: u.unit_type,
  unitTypeNote: u.unit_type_note,
  utilityNote: u.utility_note,
  rentAmount: Number(u.rent_amount),
  depositAmount: Number(u.deposit_amount),
  status: u.status,
  tenantId: u.tenant_id,
  waterMeterNumber: u.water_meter_number,
  initialWaterReading: Number(u.initial_water_reading),
  initialWaterReadingDate: u.initial_water_reading_date,
  currentWaterReading: Number(u.current_water_reading),
  currentWaterReadingDate: u.current_water_reading_date,
  finalWaterReading: u.final_water_reading
    ? Number(u.final_water_reading)
    : null,
  finalWaterReadingDate: u.final_water_reading_date,
});

app.get("/api/units", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM units ORDER BY name ASC");
    res.json(result.rows.map(mapUnitRowToCamelCase));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/units", authenticateToken, async (req, res) => {
  const u = req.body;
  const id = u.id || `u_${Date.now()}`;
  try {
    const result = await pool.query(
      `
      INSERT INTO units (
        id, property_id, name, floor, unit_type, unit_type_note, utility_note,
        rent_amount, deposit_amount, status, water_meter_number,
        initial_water_reading, initial_water_reading_date, current_water_reading,
        current_water_reading_date, final_water_reading, final_water_reading_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        id,
        u.propertyId,
        u.name,
        u.floor || "Ground Floor",
        u.unitType || "1 Bedroom",
        u.unitTypeNote || null,
        u.utilityNote || null,
        u.rentAmount || 0,
        u.depositAmount || 0,
        u.status || "Vacant",
        u.waterMeterNumber || null,
        u.initialWaterReading || 0,
        u.initialWaterReadingDate || null,
        u.currentWaterReading || 0,
        u.currentWaterReadingDate || null,
        u.finalWaterReading || null,
        u.finalWaterReadingDate || null,
      ]
    );
    res.status(201).json(mapUnitRowToCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/units/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const u = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE units SET
        name = $1, floor = $2, unit_type = $3, unit_type_note = $4, utility_note = $5,
        rent_amount = $6, deposit_amount = $7, status = $8, tenant_id = $9,
        water_meter_number = $10, initial_water_reading = $11, initial_water_reading_date = $12,
        current_water_reading = $13, current_water_reading_date = $14,
        final_water_reading = $15, final_water_reading_date = $16, updated_at = CURRENT_TIMESTAMP
      WHERE id = $17 RETURNING *`,
      [
        u.name,
        u.floor,
        u.unitType,
        u.unitTypeNote,
        u.utilityNote,
        u.rentAmount,
        u.depositAmount,
        u.status,
        u.tenantId,
        u.waterMeterNumber,
        u.initialWaterReading,
        u.initialWaterReadingDate,
        u.currentWaterReading,
        u.currentWaterReadingDate,
        u.finalWaterReading,
        u.finalWaterReadingDate,
        id,
      ]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Unit not found" });
    res.json(mapUnitRowToCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick Meter Reading PATCH
app.patch("/api/units/:id/meter", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const {
    currentWaterReading,
    currentWaterReadingDate,
    finalWaterReading,
    finalWaterReadingDate,
  } = req.body;
  try {
    const result = await pool.query(
      `
      UPDATE units SET
        current_water_reading = $1, current_water_reading_date = $2,
        final_water_reading = COALESCE($3, final_water_reading),
        final_water_reading_date = COALESCE($4, final_water_reading_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *`,
      [
        currentWaterReading,
        currentWaterReadingDate,
        finalWaterReading,
        finalWaterReadingDate,
        id,
      ]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Unit not found" });
    res.json(mapUnitRowToCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- TENANT ROUTES ----------------

const mapTenantRowToCamelCase = (t) => ({
  id: t.id,
  fullName: t.full_name,
  email: t.email,
  phone: t.phone,
  idNumber: t.id_number,
  leaseStart: t.lease_start,
  leaseEnd: t.lease_end,
  occupants: t.occupants,
  unitId: t.unit_id,
  previousUnitId: t.previous_unit_id,
  previousUnitName: t.previous_unit_name,
  status: t.status,
  paidUntil: t.paid_until,
  leaseSigned: t.lease_signed,
  leaseSignature: t.lease_signature,
  leaseSignedDate: t.lease_signed_date,
  documents: t.documents,
});

app.get("/api/tenants", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tenants ORDER BY created_at DESC"
    );
    res.json(result.rows.map(mapTenantRowToCamelCase));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tenants", authenticateToken, async (req, res) => {
  const t = req.body;
  const id = t.id || `t_${Date.now()}`;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO tenants (
        id, full_name, email, phone, id_number, lease_start, lease_end,
        occupants, unit_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id,
        t.fullName,
        t.email || null,
        t.phone,
        t.idNumber || null,
        t.leaseStart || null,
        t.leaseEnd || null,
        t.occupants || 1,
        t.unitId || null,
        t.status || "Active",
      ]
    );

    // Bidirectional sync: mark unit as occupied
    if (t.unitId) {
      await client.query(
        "UPDATE units SET status = 'Occupied', tenant_id = $1 WHERE id = $2",
        [id, t.unitId]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(mapTenantRowToCamelCase(result.rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete("/api/tenants/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tenantRes = await client.query(
      "SELECT status, unit_id FROM tenants WHERE id = $1",
      [id]
    );
    if (tenantRes.rowCount === 0) throw new Error("Tenant not found");

    const tenant = tenantRes.rows[0];

    if (tenant.status === "Previous") {
      await client.query("DELETE FROM tenants WHERE id = $1", [id]);
    } else {
      let previousUnitName = null;
      if (tenant.unit_id) {
        const unitRes = await client.query(
          "SELECT name FROM units WHERE id = $1",
          [tenant.unit_id]
        );
        if (unitRes.rowCount > 0) previousUnitName = unitRes.rows[0].name;

        await client.query(
          "UPDATE units SET status = 'Vacant', tenant_id = null WHERE id = $1",
          [tenant.unit_id]
        );
      }

      await client.query(
        `
        UPDATE tenants
        SET status = 'Previous', previous_unit_id = unit_id, previous_unit_name = $1, unit_id = null
        WHERE id = $2
      `,
        [previousUnitName, id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, deletedId: id });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------- PAYMENT ROUTES ----------------

app.get("/api/payments", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM payments ORDER BY date DESC, created_at DESC"
    );
    res.json(
      result.rows.map((p) => ({
        id: p.id,
        tenantId: p.tenant_id,
        unitId: p.unit_id,
        amount: Number(p.amount),
        date: p.date,
        method: p.method,
        type: p.type,
        rentPortion: Number(p.rent_portion),
        depositPortion: Number(p.deposit_portion),
        status: p.status,
        notes: p.notes,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/payments", authenticateToken, async (req, res) => {
  const p = req.body;
  const id = p.id || `pay_${Date.now()}`;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payResult = await client.query(
      `
      INSERT INTO payments (
        id, tenant_id, unit_id, amount, date, method, type,
        rent_portion, deposit_portion, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        id,
        p.tenantId,
        p.unitId,
        p.amount,
        p.date,
        p.method,
        p.type,
        p.rentPortion || 0,
        p.depositPortion || 0,
        p.status || "Completed",
        p.notes || null,
      ]
    );

    // Rent Calculation Engine (Advance paidUntil date)
    if (
      (p.type === "Rent" || p.type === "Rent + Deposit") &&
      (p.status === "Completed" || !p.status)
    ) {
      const unitRes = await client.query(
        "SELECT rent_amount FROM units WHERE id = $1",
        [p.unitId]
      );
      const tenantRes = await client.query(
        "SELECT paid_until, lease_start FROM tenants WHERE id = $1",
        [p.tenantId]
      );

      if (unitRes.rowCount > 0 && tenantRes.rowCount > 0) {
        const unit = unitRes.rows[0];
        const tenant = tenantRes.rows[0];
        const monthlyRent = Number(unit.rent_amount);

        if (monthlyRent > 0) {
          let startDate = new Date(
            tenant.paid_until || tenant.lease_start || p.date
          );

          let rentPaid = Number(p.amount);
          if (p.type === "Rent + Deposit" && p.rentPortion > 0) {
            rentPaid = Number(p.rentPortion);
          }

          const monthsPaid = rentPaid / monthlyRent;
          const fullMonths = Math.floor(monthsPaid);
          const partialMonthRatio = monthsPaid - fullMonths;

          startDate.setMonth(startDate.getMonth() + fullMonths);
          if (partialMonthRatio > 0) {
            startDate.setDate(
              startDate.getDate() + Math.round(partialMonthRatio * 30)
            );
          }

          const newPaidUntil = startDate.toISOString().split("T")[0];
          await client.query(
            "UPDATE tenants SET paid_until = $1 WHERE id = $2",
            [newPaidUntil, p.tenantId]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ ...p, id });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ---------------- EXPENSE ROUTES ----------------

app.get("/api/expenses", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses ORDER BY date DESC"
    );
    res.json(
      result.rows.map((e) => ({
        id: e.id,
        propertyId: e.property_id,
        category: e.category,
        amount: Number(e.amount),
        date: e.date,
        description: e.description,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/expenses", authenticateToken, async (req, res) => {
  const e = req.body;
  const id = e.id || `exp_${Date.now()}`;
  try {
    const result = await pool.query(
      `
      INSERT INTO expenses (id, property_id, category, amount, date, description)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, e.propertyId || null, e.category, e.amount, e.date, e.description]
    );
    res.status(201).json({ ...e, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- MAINTENANCE ROUTES ----------------

app.get("/api/maintenance", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM maintenance_tickets ORDER BY reported_date DESC"
    );
    res.json(
      result.rows.map((m) => ({
        id: m.id,
        propertyId: m.property_id,
        unitId: m.unit_id,
        tenantId: m.tenant_id,
        title: m.title,
        description: m.description,
        category: m.category,
        priority: m.priority,
        status: m.status,
        estimatedCost: Number(m.estimated_cost),
        actualCost: m.actual_cost ? Number(m.actual_cost) : null,
        reportedDate: m.reported_date,
        scheduledDate: m.scheduled_date,
        completedDate: m.completed_date,
        contractorName: m.contractor_name,
        contractorPhone: m.contractor_phone,
        convertedToExpense: m.converted_to_expense,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/maintenance", authenticateToken, async (req, res) => {
  const m = req.body;
  const id = m.id || `maint_${Date.now()}`;
  try {
    await pool.query(
      `
      INSERT INTO maintenance_tickets (
        id, property_id, unit_id, tenant_id, title, description, category,
        priority, status, estimated_cost, reported_date, contractor_name, contractor_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        m.propertyId,
        m.unitId || null,
        m.tenantId || null,
        m.title,
        m.description,
        m.category || "General",
        m.priority || "Medium",
        m.status || "Open",
        m.estimatedCost || 0,
        m.reportedDate,
        m.contractorName || null,
        m.contractorPhone || null,
      ]
    );
    res.status(201).json({ ...m, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/maintenance/:id/convert-to-expense",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { actualCost } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const ticketRes = await client.query(
        "SELECT * FROM maintenance_tickets WHERE id = $1",
        [id]
      );
      if (ticketRes.rowCount === 0) throw new Error("Ticket not found");
      const ticket = ticketRes.rows[0];

      let desc = `Work Order: ${ticket.title}`;
      if (ticket.contractor_name)
        desc += ` - Contractor: ${ticket.contractor_name}`;

      const expId = `exp_${Date.now()}`;
      const today = new Date().toISOString().split("T")[0];

      await client.query(
        `
      INSERT INTO expenses (id, property_id, category, amount, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)`,
        [expId, ticket.property_id, "Maintenance", actualCost, today, desc]
      );

      await client.query(
        `
      UPDATE maintenance_tickets
      SET actual_cost = $1, status = 'Completed', converted_to_expense = true, completed_date = $2
      WHERE id = $3`,
        [actualCost, today, id]
      );

      await client.query("COMMIT");
      res.json({ success: true, expenseId: expId });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

// ---------------- ADDITIONAL ROUTES (NOTES & LEASE) ----------------

app.post("/api/notes", authenticateToken, async (req, res) => {
  const { targetId, targetType, id, content, author, createdAt } = req.body;
  const noteId = id || `note_${Date.now()}`;
  try {
    await pool.query(
      "INSERT INTO notes (id, target_type, target_id, content, author, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        noteId,
        targetType,
        targetId,
        content,
        author || "System",
        createdAt || new Date().toISOString(),
      ]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tenants/:id/sign-lease", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { signatureDataUrl } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const now = new Date().toISOString();

    await client.query(
      "UPDATE tenants SET lease_signed = true, lease_signature = $1, lease_signed_date = $2 WHERE id = $3",
      [signatureDataUrl, now, id]
    );

    await client.query(
      "INSERT INTO notes (id, target_type, target_id, content, author, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        `note_${Date.now()}`,
        "tenant",
        id,
        `Residential Tenancy Agreement digitally signed and countersigned on ${now}.`,
        "System",
        now,
      ]
    );

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post("/api/tenants/:id/restore", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE tenants SET status = 'Active' WHERE id = $1", [
      id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- AI ASSISTANT PROXY ----------------
const { GoogleGenAI } = require("@google/genai");

app.post("/api/ai/draft-communication", authenticateToken, async (req, res) => {
  const { tenantName, type, details } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return res.json({
      draft: `Dear ${tenantName},\n\nThis is an automated communication regarding ${type.replace(/_/g, ' ')}.\n\nDetails: ${details}\n\nBest regards,\nProperty Management`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Act as a professional property manager. Write a polite but firm email to a tenant named "${tenantName}".
      The purpose of the email is: "${type}".
      Additional Context details: "${details}".
      Keep it concise, professional, and clear. Return only the email body text, no conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ draft: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.json({
      draft: `Dear ${tenantName},\n\nThis is a notification regarding ${type.replace(/_/g, ' ')}.\n\nDetails: ${details}\n\nBest regards,\nProperty Management Team`,
    });
  }
});

// ---------------- PRODUCTION / DEVELOPMENT FRONTEND SERVING ----------------
// Placed AFTER all API routes so /api/* is never intercepted by frontend routing.
const distPath = path.join(__dirname, "../dist");

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
        appType: "spa",
        root: path.join(__dirname, ".."),
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite dev middleware not loaded, using dist:", err.message);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`PropMinds Backend running on http://0.0.0.0:${PORT}`);
    try {
      await initializeDatabase();
      await seedAdminUser();
    } catch (e) {
      console.warn("Database initialization:", e.message);
    }
  });
}

startServer();
