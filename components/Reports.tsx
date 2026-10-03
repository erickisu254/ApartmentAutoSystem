import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tenant } from '../types';
import { 
  FileDown, Printer, Wallet, TrendingDown, TrendingUp, 
  PieChart as PieIcon, Users, Calendar, Building2, Filter, DollarSign, CheckCircle2,
  Search, UserCheck, AlertCircle, Eye, Download, Phone, Mail, Home, ShieldCheck, X, Clock, FileText, ArrowRight, User
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subMonths, isSameMonth, differenceInDays, parseISO, isAfter, startOfYear } from 'date-fns';

const Reports: React.FC = () => {
  const { payments, expenses, units, tenants, properties } = useApp();

  const [selectedProperty, setSelectedProperty] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | 'YTD' | 'ALL'>('6M');

  // Tenant Balance & Dossier Filtering State
  const [tenantBalanceFilter, setTenantBalanceFilter] = useState<'all' | 'up-to-date' | 'with-balances'>('all');
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [selectedTenantForReport, setSelectedTenantForReport] = useState<Tenant | null>(null);

  // Filter Units by Property
  const filteredUnits = useMemo(() => {
    if (selectedProperty === 'All') return units;
    return units.filter(u => u.propertyId === selectedProperty);
  }, [units, selectedProperty]);

  const filteredUnitIds = useMemo(() => new Set(filteredUnits.map(u => u.id)), [filteredUnits]);

  // Filter Tenants by Property (handling active and previous assignments)
  const filteredTenants = useMemo(() => {
    if (selectedProperty === 'All') return tenants;
    return tenants.filter(t => 
      (t.unitId && filteredUnitIds.has(t.unitId)) ||
      (t.previousUnitId && filteredUnitIds.has(t.previousUnitId))
    );
  }, [tenants, selectedProperty, filteredUnitIds]);

  // Filter Payments by Property & Period
  const filteredPayments = useMemo(() => {
    const now = new Date();
    return payments.filter(p => {
      // Property filter
      if (selectedProperty !== 'All' && !filteredUnitIds.has(p.unitId)) return false;
      
      // Period filter
      const pDate = new Date(p.date);
      if (selectedPeriod === '1M') return isSameMonth(pDate, now);
      if (selectedPeriod === '3M') return isAfter(pDate, subMonths(now, 3));
      if (selectedPeriod === '6M') return isAfter(pDate, subMonths(now, 6));
      if (selectedPeriod === 'YTD') return isAfter(pDate, startOfYear(now));
      return true;
    });
  }, [payments, selectedProperty, selectedPeriod, filteredUnitIds]);

  // Filter Expenses by Property & Period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      // Property filter
      if (selectedProperty !== 'All' && e.propertyId !== selectedProperty && e.propertyId !== 'general') return false;
      
      // Period filter
      const eDate = new Date(e.date);
      if (selectedPeriod === '1M') return isSameMonth(eDate, now);
      if (selectedPeriod === '3M') return isAfter(eDate, subMonths(now, 3));
      if (selectedPeriod === '6M') return isAfter(eDate, subMonths(now, 6));
      if (selectedPeriod === 'YTD') return isAfter(eDate, startOfYear(now));
      return true;
    });
  }, [expenses, selectedProperty, selectedPeriod]);

  // --- Financial Summaries ---
  const rentPayments = filteredPayments.filter(p => p.type === 'Rent' && p.status === 'Completed');
  const depositPayments = filteredPayments.filter(p => p.type === 'Deposit' && p.status === 'Completed');

  const totalRentCollected = rentPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDepositsCollected = depositPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingIncome = totalRentCollected - totalOperatingExpenses;
  const expenseRatio = totalRentCollected > 0 ? Math.round((totalOperatingExpenses / totalRentCollected) * 100) : 0;

  // Outstanding Balance
  const outstandingBalance = filteredTenants.reduce((acc, tenant) => {
    if (tenant.status !== 'Active' || !tenant.unitId) return acc;
    const unit = units.find(u => u.id === tenant.unitId);
    if (!unit) return acc;

    if (!tenant.paidUntil) return acc + unit.rentAmount;
    const paidUntilDate = new Date(tenant.paidUntil);
    const today = new Date();
    if (paidUntilDate < today) {
       const diffDays = Math.max(0, differenceInDays(today, paidUntilDate));
       const monthsOverdue = Math.ceil(diffDays / 30);
       return acc + (unit.rentAmount * monthsOverdue);
    }
    return acc;
  }, 0);

  // Chart Data: Income vs Expense (Trailing 6 months)
  const currentMonth = new Date();
  const financialTrendData = useMemo(() => {
    const data = [];
    const monthsCount = selectedPeriod === '3M' ? 3 : 6;
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = subMonths(currentMonth, i);
      const monthKey = format(d, 'MMM yyyy');
      
      const income = rentPayments
        .filter(p => isSameMonth(new Date(p.date), d))
        .reduce((acc, curr) => acc + curr.amount, 0);
        
      const expense = filteredExpenses
        .filter(e => isSameMonth(new Date(e.date), d))
        .reduce((acc, curr) => acc + curr.amount, 0);

      data.push({ name: monthKey, Income: income, Expenses: expense });
    }
    return data;
  }, [rentPayments, filteredExpenses, selectedPeriod]);

  // --- Occupancy Analysis ---
  const occupiedCount = filteredUnits.filter(u => u.status === 'Occupied').length;
  const vacantCount = filteredUnits.filter(u => u.status === 'Vacant').length;
  const maintenanceCount = filteredUnits.filter(u => u.status === 'Maintenance').length;
  const totalUnits = filteredUnits.length;
  const occupancyRate = totalUnits > 0 ? ((occupiedCount / totalUnits) * 100).toFixed(1) : '0';
  const vacancyRate = totalUnits > 0 ? ((vacantCount / totalUnits) * 100).toFixed(1) : '0';

  const occupancyData = [
    { name: 'Occupied', value: occupiedCount, color: '#22c55e' },
    { name: 'Vacant', value: vacantCount, color: '#94a3b8' },
    { name: 'Maintenance', value: maintenanceCount, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Average Stay Duration
  const averageStayDays = useMemo(() => {
    const activeTenants = filteredTenants.filter(t => t.status === 'Active' && t.leaseStart);
    if (activeTenants.length === 0) return 0;
    
    const totalDays = activeTenants.reduce((sum, t) => {
      const start = parseISO(t.leaseStart!);
      const end = new Date();
      return sum + differenceInDays(end, start);
    }, 0);
    
    return Math.round(totalDays / activeTenants.length);
  }, [filteredTenants]);

  // Helpers
  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || id;
  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || id;

  // Individual Tenant Financial Calculation & Up-To-Date Audit
  const getTenantFinancialSummary = (tenant: Tenant) => {
    const unit = units.find(u => u.id === tenant.unitId || u.id === tenant.previousUnitId);
    const prop = properties.find(p => p.id === unit?.propertyId);
    const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
    const completedPayments = tenantPayments
      .filter(p => p.status === 'Completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const depositPaid = completedPayments
      .filter(p => p.type === 'Deposit' || p.type === 'Rent + Deposit')
      .reduce((sum, p) => sum + (p.depositPortion ?? (p.type === 'Deposit' ? p.amount : 0)), 0);

    const rentPaid = completedPayments
      .filter(p => p.type === 'Rent' || p.type === 'Rent + Deposit')
      .reduce((sum, p) => sum + (p.rentPortion ?? (p.type === 'Rent' ? p.amount : 0)), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let isUpToDate = false;
    let daysOverdue = 0;
    let monthsOverdue = 0;
    let currentBalance = 0;

    if (tenant.paidUntil) {
      const paidUntilDate = new Date(tenant.paidUntil);
      paidUntilDate.setHours(0, 0, 0, 0);
      if (paidUntilDate >= today) {
        isUpToDate = true;
        currentBalance = 0;
      } else {
        isUpToDate = false;
        daysOverdue = Math.max(0, differenceInDays(today, paidUntilDate));
        monthsOverdue = Math.max(1, Math.ceil(daysOverdue / 30));
        currentBalance = (unit?.rentAmount || 0) * monthsOverdue;
      }
    } else {
      if (tenant.status === 'Active') {
        isUpToDate = false;
        currentBalance = unit?.rentAmount || 0;
        if (tenant.leaseStart) {
          const startDate = new Date(tenant.leaseStart);
          startDate.setHours(0, 0, 0, 0);
          if (startDate < today) {
            daysOverdue = Math.max(0, differenceInDays(today, startDate));
            monthsOverdue = Math.max(1, Math.ceil(daysOverdue / 30));
            currentBalance = (unit?.rentAmount || 0) * monthsOverdue;
          }
        }
      } else {
        isUpToDate = true;
      }
    }

    return {
      unit,
      prop,
      tenantPayments,
      completedPayments,
      totalPaid,
      depositPaid,
      rentPaid,
      isUpToDate,
      daysOverdue,
      monthsOverdue,
      currentBalance
    };
  };

  // Full Tenant Ledger Data
  const allTenantsFinancials = useMemo(() => {
    return filteredTenants.map(t => ({
      tenant: t,
      ...getTenantFinancialSummary(t)
    }));
  }, [filteredTenants, units, properties, payments]);

  const upToDateTenantsCount = useMemo(() => {
    return allTenantsFinancials.filter(item => item.isUpToDate).length;
  }, [allTenantsFinancials]);

  const overdueTenantsCount = useMemo(() => {
    return allTenantsFinancials.filter(item => !item.isUpToDate).length;
  }, [allTenantsFinancials]);

  const totalArrearsAmount = useMemo(() => {
    return allTenantsFinancials.reduce((sum, item) => sum + (item.isUpToDate ? 0 : item.currentBalance), 0);
  }, [allTenantsFinancials]);

  // Filtered Ledger based on tabs and search
  const filteredTenantLedger = useMemo(() => {
    return allTenantsFinancials.filter(item => {
      // 1. Balance filter
      if (tenantBalanceFilter === 'up-to-date' && !item.isUpToDate) return false;
      if (tenantBalanceFilter === 'with-balances' && item.isUpToDate) return false;

      // 2. Search filter
      if (tenantSearchTerm.trim()) {
        const q = tenantSearchTerm.toLowerCase();
        const matchName = item.tenant.fullName.toLowerCase().includes(q);
        const matchPhone = item.tenant.phone.toLowerCase().includes(q);
        const matchEmail = (item.tenant.email || '').toLowerCase().includes(q);
        const matchId = (item.tenant.idNumber || '').toLowerCase().includes(q);
        const matchUnit = (item.unit?.name || '').toLowerCase().includes(q);
        const matchProp = (item.prop?.name || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail || matchId || matchUnit || matchProp;
      }

      return true;
    });
  }, [allTenantsFinancials, tenantBalanceFilter, tenantSearchTerm]);

  // Generate Individual Tenant Dossier / Statement HTML
  const generateTenantDossierHtml = (tenant: Tenant) => {
    const summary = getTenantFinancialSummary(tenant);
    const nowStr = format(new Date(), 'MMMM d, yyyy');
    const entryDate = tenant.leaseStart ? format(new Date(tenant.leaseStart), 'MMMM d, yyyy') : 'Not Recorded';
    const leaseEndStr = tenant.leaseEnd ? format(new Date(tenant.leaseEnd), 'MMMM d, yyyy') : 'Month-to-Month';
    const paidUntilStr = tenant.paidUntil ? format(new Date(tenant.paidUntil), 'MMMM d, yyyy') : 'No Record';
    const unitName = summary.unit?.name || 'Unassigned';
    const propName = summary.prop?.name || 'PropMinds Portfolio';
    const rentAmt = summary.unit?.rentAmount || 0;
    const depReq = summary.unit?.depositAmount || rentAmt;

    const paymentRowsHtml = summary.completedPayments.map(p => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${format(new Date(p.date), 'MMM d, yyyy')}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600;">#${p.id}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${p.type}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${p.method}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">Ksh ${p.amount.toLocaleString()}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">
          <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700;">${p.status}</span>
        </td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tenant Statement - ${tenant.fullName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f8fafc; color: #0f172a; margin: 0; }
    .container { max-width: 820px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .no-print { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 25px; }
    .btn { background: #0284c7; color: white; border: none; padding: 9px 18px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .btn:hover { background: #0369a1; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 18px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 26px; font-weight: 800; color: #0c4a6e; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
    .badge-clear { background: #dcfce7; color: #166534; }
    .badge-arrears { background: #fee2e2; color: #991b1b; }
    .info-card { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px; }
    .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 24px 0; }
    .card { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; }
    .card-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
    .card-value { font-size: 18px; font-weight: 800; color: #0f172a; }
    .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; color: #334155; margin: 30px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f8fafc; padding: 10px 14px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 45px; padding-top: 25px; border-top: 1px solid #e2e8f0; }
    .sign-line { border-top: 1px solid #94a3b8; margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; padding-top: 5px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; padding: 10px; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print">
      <button class="btn" onclick="window.print()">🖨️ Print Statement</button>
    </div>
    
    <div class="header">
      <div>
        <div class="title">PropMinds Property Management</div>
        <div class="subtitle">Individual Tenant Dossier & Statement of Account</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #64748b;">Report Date: <strong>${nowStr}</strong></div>
        <div style="margin-top: 6px;">
          <span class="badge ${summary.isUpToDate ? 'badge-clear' : 'badge-arrears'}">
            ${summary.isUpToDate ? '✓ BALANCES UP TO DATE' : `⚠ ARREARS: Ksh ${summary.currentBalance.toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>

    <div class="info-card">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0369a1;">Tenant Profile</div>
        <div style="font-size: 20px; font-weight: 800; color: #0c4a6e; margin-top: 4px;">${tenant.fullName}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 4px;"><strong>Phone:</strong> ${tenant.phone}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 2px;"><strong>Email:</strong> ${tenant.email || 'None on record'}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 2px;"><strong>ID / Passport:</strong> ${tenant.idNumber || 'None'}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 2px;"><strong>Occupants:</strong> ${tenant.occupants} Person(s)</div>
      </div>
      <div>
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0369a1;">Lease & Unit Details</div>
        <div style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin-top: 4px;">
          ${propName} • Unit: ${unitName} (${summary.unit?.floor || 'Ground Floor'}${summary.unit?.unitType ? ` - ${summary.unit.unitType}` : ''})
        </div>
        <div style="font-size: 13px; color: #334155; margin-top: 4px;"><strong>Time Entered (Move-In):</strong> ${entryDate}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 2px;"><strong>Lease Agreement End:</strong> ${leaseEndStr}</div>
        ${summary.unit?.waterMeterNumber ? `
        <div style="font-size: 13px; color: #0369a1; margin-top: 2px;">
          <strong>Water Utility Meter:</strong> #${summary.unit.waterMeterNumber} | Initial: ${summary.unit.initialWaterReading ?? 0} m³ | Current: ${summary.unit.currentWaterReading ?? 0} m³${summary.unit.currentWaterReadingDate ? ` (Read: ${summary.unit.currentWaterReadingDate})` : ''}
        </div>` : ''}
        ${summary.unit?.utilityNote ? `
        <div style="font-size: 13px; color: #b45309; margin-top: 2px;">
          <strong>Additional Note:</strong> ${summary.unit.utilityNote}
        </div>` : ''}
        <div style="font-size: 13px; color: #334155; margin-top: 2px;"><strong>Agreement Status:</strong> ${tenant.leaseSigned ? 'Digitally Signed & Verified ✓' : 'Pending Signature'}</div>
        <div style="font-size: 13px; color: #334155; margin-top: 2px;"><strong>Tenant Status:</strong> ${tenant.status === 'Active' ? 'Active Resident' : 'Previous Resident (Moved Out)'}</div>
      </div>
    </div>

    <div class="card-grid">
      <div class="card">
        <div class="card-label">Monthly Rent Rate</div>
        <div class="card-value">Ksh ${rentAmt.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">Rent Paid Until</div>
        <div class="card-value" style="font-size: 15px; color: ${summary.isUpToDate ? '#166534' : '#dc2626'};">${paidUntilStr}</div>
      </div>
      <div class="card">
        <div class="card-label">Total Amount Paid</div>
        <div class="card-value" style="color: #16a34a;">Ksh ${summary.totalPaid.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">Current Balance / Arrears</div>
        <div class="card-value" style="color: ${summary.currentBalance > 0 ? '#dc2626' : '#16a34a'};">
          Ksh ${summary.currentBalance.toLocaleString()}
        </div>
      </div>
    </div>

    <div class="section-title">Itemized Payment & Receipt Transaction Ledger</div>
    <table>
      <thead>
        <tr>
          <th>Payment Date</th>
          <th>Receipt #</th>
          <th>Type</th>
          <th>Method</th>
          <th style="text-align: right;">Amount Received</th>
          <th style="text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${paymentRowsHtml || '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #94a3b8;">No payment records found for this resident.</td></tr>'}
      </tbody>
    </table>

    <div class="signatures">
      <div>
        <div class="sign-line">Authorized Landlord / Property Manager</div>
      </div>
      <div>
        <div class="sign-line">Tenant Acknowledgment & Signature</div>
      </div>
    </div>

    <div class="footer">
      <p>This statement is an official certified accounting dossier generated by PropMinds Property Management System.</p>
    </div>
  </div>
</body>
</html>`;
  };

  const printTenantDossier = (tenant: Tenant) => {
    const htmlContent = generateTenantDossierHtml(tenant);
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    } catch {
      window.print();
    }
  };

  const downloadTenantDossier = (tenant: Tenant) => {
    const htmlContent = generateTenantDossierHtml(tenant);
    const cleanName = tenant.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tenant_Report_${cleanName}_${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Actions
  const downloadCSV = () => {
    const headers = ["Payment ID", "Date", "Tenant Name", "Unit", "Type", "Method", "Amount (Ksh)", "Status"];
    const rows = filteredPayments.map(p => [
      p.id,
      p.date, 
      `"${getTenantName(p.tenantId)}"`, 
      `"${getUnitName(p.unitId)}"`, 
      p.type, 
      p.method, 
      p.amount, 
      p.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `propminds_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Financial Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Portfolio P&L performance, occupancy insights, and custom exports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Property Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm shadow-xs">
            <Building2 size={16} className="text-gray-400" />
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="bg-transparent text-gray-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="All">All Properties ({properties.length})</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm shadow-xs">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-transparent text-gray-800 dark:text-white outline-none cursor-pointer"
            >
              <option value="1M">This Month</option>
              <option value="3M">Trailing 3 Months</option>
              <option value="6M">Trailing 6 Months</option>
              <option value="YTD">Year to Date</option>
              <option value="ALL">All Time</option>
            </select>
          </div>

          <button 
            onClick={downloadCSV} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
          >
            <FileDown size={16} /> Export CSV
          </button>
          <button 
            onClick={printReport} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Printable Header (Only visible when printing) */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">PropMinds Executive Property Report</h1>
        <p className="text-gray-600 mt-1">
          Scope: {selectedProperty === 'All' ? 'Consolidated Portfolio' : properties.find(p => p.id === selectedProperty)?.name} • Period: {selectedPeriod} • Generated {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:border-gray-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Rent Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Ksh {totalRentCollected.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            + Ksh {totalDepositsCollected.toLocaleString()} deposits held
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:border-gray-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Operating Costs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Ksh {totalOperatingExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            Expense Ratio: {expenseRatio}% of income
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:border-gray-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Operating Income (NOI)</p>
              <h3 className={`text-2xl font-bold mt-1 ${netOperatingIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                Ksh {netOperatingIncome.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Gross Rent minus Expenses</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:border-gray-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding Arrears</p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">Ksh {outstandingBalance.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Uncollected overdue balances</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:break-inside-avoid">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cash Inflow vs Operating Expenses</h3>
            <span className="text-xs text-gray-400 font-medium">Monthly Trend</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(val) => `${val/1000}k`} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  formatter={(val: any) => [`Ksh ${Number(val).toLocaleString()}`, '']}
                />
                <Legend verticalAlign="top" height={36}/>
                <Area type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Occupancy Dynamics</h3>
          
          <div className="flex justify-center mb-4 h-56">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} Units`, name]} />
                  <Legend verticalAlign="bottom" height={32}/>
                </PieChart>
             </ResponsiveContainer>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
               <div className="flex items-center gap-2.5">
                 <PieIcon size={16} className="text-gray-400" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Occupancy Rate</span>
               </div>
               <span className="font-bold text-gray-900 dark:text-white text-sm">{occupancyRate}%</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
               <div className="flex items-center gap-2.5">
                 <Calendar size={16} className="text-gray-400" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Avg. Tenant Stay</span>
               </div>
               <span className="font-bold text-gray-900 dark:text-white text-sm">{averageStayDays} days</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
               <div className="flex items-center gap-2.5">
                 <Users size={16} className="text-gray-400" />
                 <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Active Residents</span>
               </div>
               <span className="font-bold text-gray-900 dark:text-white text-sm">{filteredTenants.filter(t => t.status === 'Active').length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Profit & Loss Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:break-inside-avoid">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Operating Expense Breakdown</h3>
            <p className="text-xs text-gray-500">Itemized operational costs attributed to the active scope.</p>
          </div>
          <span className="text-xs font-semibold text-gray-500">{filteredExpenses.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-medium text-gray-500">Date</th>
                <th className="p-4 font-medium text-gray-500">Category</th>
                <th className="p-4 font-medium text-gray-500">Description</th>
                <th className="p-4 font-medium text-gray-500">Property Allocation</th>
                <th className="p-4 font-medium text-gray-500 text-right">Amount (Ksh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredExpenses.slice(0, 10).map(e => {
                const prop = properties.find(p => p.id === e.propertyId);
                return (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="p-4 text-gray-700 dark:text-gray-300">{format(new Date(e.date), 'MMM d, yyyy')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{e.description}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{prop ? prop.name : 'General Overhead'}</td>
                    <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{e.amount.toLocaleString()}</td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">No expenses recorded for this selection.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TENANT BALANCES, ARREARS AUDIT & INDIVIDUAL STATEMENT REPORTS SECTION    */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:break-inside-avoid space-y-4">
        {/* Section Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="text-blue-600 dark:text-blue-400" size={22} />
              Tenant Balance Audit & Account Statements
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Filter residents with balances up to date or in arrears, search any resident, and generate comprehensive statements.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold border border-green-200 dark:border-green-800">
              ✓ {upToDateTenantsCount} Up to Date
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold border border-red-200 dark:border-red-800">
              ⚠ {overdueTenantsCount} Overdue ({totalArrearsAmount > 0 ? `Ksh ${totalArrearsAmount.toLocaleString()}` : '0'})
            </span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="px-6 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          {/* Balance Status Tabs */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg self-start">
            <button
              onClick={() => setTenantBalanceFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                tenantBalanceFilter === 'all'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              All Residents ({allTenantsFinancials.length})
            </button>
            <button
              onClick={() => setTenantBalanceFilter('up-to-date')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tenantBalanceFilter === 'up-to-date'
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Paid Up to Date ({upToDateTenantsCount})
            </button>
            <button
              onClick={() => setTenantBalanceFilter('with-balances')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tenantBalanceFilter === 'with-balances'
                  ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              With Arrears / Balances ({overdueTenantsCount})
            </button>
          </div>

          {/* Search by Tenant */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tenant, phone, unit..."
              value={tenantSearchTerm}
              onChange={(e) => setTenantSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            {tenantSearchTerm && (
              <button
                onClick={() => setTenantSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tenant Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase">Resident</th>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase">Unit & Property</th>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase">Time Entered</th>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase">Rent Status</th>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase text-right">Total Paid</th>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase text-right">Balance / Arrears</th>
                <th className="p-4 font-medium text-gray-500 text-xs uppercase text-center">Statement Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTenantLedger.map(({ tenant, unit, prop, totalPaid, isUpToDate, daysOverdue, currentBalance }) => {
                const moveInDateStr = tenant.leaseStart ? format(new Date(tenant.leaseStart), 'MMM d, yyyy') : 'Not recorded';
                const stayDays = tenant.leaseStart ? differenceInDays(new Date(), new Date(tenant.leaseStart)) : 0;

                return (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {tenant.fullName}
                          {tenant.status === 'Previous' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              Moved Out
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {tenant.phone} {tenant.idNumber ? `• ID: ${tenant.idNumber}` : ''}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5 flex-wrap">
                        <span>{unit ? unit.name : 'Unassigned'}</span>
                        {unit?.floor && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {unit.floor}
                          </span>
                        )}
                        {unit?.unitType && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            {unit.unitType}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {prop ? prop.name : 'PropMinds'} • Ksh {unit?.rentAmount.toLocaleString()}/mo
                        {unit?.waterMeterNumber && (
                          <span className="ml-1.5 text-cyan-600 dark:text-cyan-400 font-medium">💧 Meter #{unit.waterMeterNumber}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-xs">
                      <div className="font-medium text-gray-700 dark:text-gray-300">{moveInDateStr}</div>
                      {stayDays > 0 && (
                        <div className="text-gray-400 mt-0.5">{Math.floor(stayDays / 30)} mo ({stayDays} days)</div>
                      )}
                    </td>

                    <td className="p-4">
                      {isUpToDate ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle2 size={13} />
                          {tenant.paidUntil ? `Paid until ${format(new Date(tenant.paidUntil), 'MMM d, yyyy')}` : 'Up to Date'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          <AlertCircle size={13} />
                          {tenant.paidUntil
                            ? `Overdue (${daysOverdue} days)`
                            : 'No payment on record'}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right font-bold text-gray-900 dark:text-white">
                      Ksh {totalPaid.toLocaleString()}
                    </td>

                    <td className="p-4 text-right">
                      {currentBalance > 0 ? (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          Ksh {currentBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-semibold text-green-600 dark:text-green-400 text-xs">
                          Clear (Ksh 0)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedTenantForReport(tenant)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                        title="Produce Full Report & Statement"
                      >
                        <FileText size={14} /> Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTenantLedger.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    <User className="mx-auto mb-2 text-gray-300 dark:text-gray-600" size={32} />
                    <p className="font-medium text-gray-600 dark:text-gray-400">No tenants matched your criteria</p>
                    <p className="text-xs text-gray-400 mt-1">Try changing the balance status filter or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INDIVIDUAL TENANT REPORT DOSSIER MODAL                                    */}
      {/* ========================================================================= */}
      {selectedTenantForReport && (() => {
        const tenant = selectedTenantForReport;
        const summary = getTenantFinancialSummary(tenant);
        const entryDate = tenant.leaseStart ? format(new Date(tenant.leaseStart), 'MMMM d, yyyy') : 'Not Recorded';
        const leaseEndStr = tenant.leaseEnd ? format(new Date(tenant.leaseEnd), 'MMMM d, yyyy') : 'Month-to-Month';
        const paidUntilStr = tenant.paidUntil ? format(new Date(tenant.paidUntil), 'MMMM d, yyyy') : 'No record';
        const unitName = summary.unit?.name || 'Unassigned';
        const propName = summary.prop?.name || 'PropMinds Portfolio';
        const rentAmt = summary.unit?.rentAmount || 0;
        const depReq = summary.unit?.depositAmount || rentAmt;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 border-b dark:border-gray-700 bg-blue-50/70 dark:bg-blue-900/20 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      summary.isUpToDate
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {summary.isUpToDate ? '✓ BALANCES UP TO DATE' : `⚠ OVERDUE: Ksh ${summary.currentBalance.toLocaleString()}`}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                      {tenant.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 flex items-center gap-2">
                    {tenant.fullName}
                  </h2>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <Home size={13} /> {propName} • Unit: {unitName}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTenantForReport(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* 2-Column Resident Dossier Facts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Tenant Contacts */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-gray-700/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Resident Profile
                    </p>
                    <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{tenant.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{tenant.email || 'None on record'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID / Passport:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{tenant.idNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Occupants:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{tenant.occupants} Person(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tenancy Timeline */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-gray-700/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Tenancy Timeline
                    </p>
                    <div className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time Entered (Move-in):</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{entryDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lease Agreement End:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{leaseEndStr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tenancy Agreement:</span>
                        <span className={`font-semibold ${tenant.leaseSigned ? 'text-green-600 dark:text-green-400' : 'text-amber-600'}`}>
                          {tenant.leaseSigned ? 'Digitally Signed ✓' : 'Pending Signature'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rent Paid Until:</span>
                        <span className={`font-semibold ${summary.isUpToDate ? 'text-green-600' : 'text-red-600'}`}>
                          {paidUntilStr}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Financial Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      Monthly Rent
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white mt-1 block">
                      Ksh {rentAmt.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-purple-50/50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                      Security Deposit
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white mt-1 block">
                      Ksh {summary.depositPaid.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400">of Ksh {depReq.toLocaleString()}</span>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Total Paid
                    </span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                      Ksh {summary.totalPaid.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400">{summary.completedPayments.length} Payments</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    summary.currentBalance > 0
                      ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40'
                      : 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40'
                  }`}>
                    <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                      summary.currentBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      Current Balance
                    </span>
                    <span className={`text-lg font-bold mt-1 block ${
                      summary.currentBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      Ksh {summary.currentBalance.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {summary.isUpToDate ? 'Clear balance' : `${summary.daysOverdue} days overdue`}
                    </span>
                  </div>
                </div>

                {/* Itemized Payment History */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={16} className="text-blue-600" /> Payment & Transaction Ledger
                    </h4>
                    <span className="text-xs text-gray-400">{summary.completedPayments.length} Total Records</span>
                  </div>

                  <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-700/60 sticky top-0">
                        <tr>
                          <th className="p-3 font-semibold text-gray-500">Date</th>
                          <th className="p-3 font-semibold text-gray-500">Receipt ID</th>
                          <th className="p-3 font-semibold text-gray-500">Type</th>
                          <th className="p-3 font-semibold text-gray-500">Method</th>
                          <th className="p-3 font-semibold text-gray-500 text-right">Amount (Ksh)</th>
                          <th className="p-3 font-semibold text-gray-500 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {summary.completedPayments.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                              {format(new Date(p.date), 'MMM d, yyyy')}
                            </td>
                            <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">#{p.id}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                                {p.type}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600 dark:text-gray-300">{p.method}</td>
                            <td className="p-3 text-right font-bold text-gray-900 dark:text-white">
                              {p.amount.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-bold text-[10px]">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {summary.completedPayments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-gray-400">
                              No payments recorded for this tenant.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Ready to print or export as official statement
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadTenantDossier(tenant)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Download size={14} /> Download HTML
                  </button>
                  <button
                    onClick={() => printTenantDossier(tenant)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Printer size={14} /> Print Statement
                  </button>
                  <button
                    onClick={() => setSelectedTenantForReport(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default Reports;
