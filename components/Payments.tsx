
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Payment } from '../types';
import { format, addMonths, addDays } from 'date-fns';
import { Plus, DollarSign, Search, Tag, ArrowUpDown, ArrowUp, ArrowDown, Calculator, CalendarCheck, Printer, Check, X, Eye, FileText, CreditCard, Download, FileDown, Layers } from 'lucide-react';

const Payments: React.FC = () => {
  const { payments, tenants, units, recordPayment } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState<Payment | null>(null); // Stores the payment just recorded
  const [viewPayment, setViewPayment] = useState<Payment | null>(null); // Stores payment for detailed view
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });

  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    tenantId: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    method: 'Bank Transfer',
    type: 'Rent',
    status: 'Completed',
    notes: ''
  });

  // Custom fields for "Other" option
  const [customMethod, setCustomMethod] = useState('');
  const [customType, setCustomType] = useState('');
  const [formError, setFormError] = useState('');

  // Calculator State
  const [calculation, setCalculation] = useState<{months: number, newDate: string, depositNote?: string} | null>(null);

  useEffect(() => {
    if ((newPayment.type === 'Rent' || newPayment.type === 'Rent + Deposit') && newPayment.tenantId && newPayment.amount && newPayment.amount > 0) {
      const tenant = tenants.find(t => t.id === newPayment.tenantId);
      const unit = units.find(u => u.id === tenant?.unitId);
      
      if (tenant && unit && unit.rentAmount > 0) {
        let rentAmountCalculated = newPayment.amount;
        let depositNote: string | undefined = undefined;

        if (newPayment.type === 'Rent + Deposit') {
          const depositReq = unit.depositAmount || unit.rentAmount;
          depositNote = `Includes Security Deposit (Ksh ${depositReq.toLocaleString()})`;
          const remainder = newPayment.amount - depositReq;
          rentAmountCalculated = remainder > 0 ? remainder : (newPayment.amount >= unit.rentAmount ? unit.rentAmount : newPayment.amount);
        }

        // Calculate Months
        const months = rentAmountCalculated / unit.rentAmount;
        
        // Calculate New Date
        let startDate = new Date(newPayment.date || new Date());
        if (tenant.paidUntil) startDate = new Date(tenant.paidUntil);
        else if (tenant.leaseStart) startDate = new Date(tenant.leaseStart);

        const fullMonths = Math.floor(months);
        const partialDays = Math.round((months - fullMonths) * 30);
        
        let newDate = addMonths(startDate, fullMonths);
        newDate = addDays(newDate, partialDays);

        setCalculation({
          months: Number(months.toFixed(1)),
          newDate: format(newDate, 'MMM d, yyyy'),
          depositNote
        });
        return;
      }
    }
    setCalculation(null);
  }, [newPayment.amount, newPayment.tenantId, newPayment.type, newPayment.date, tenants, units]);

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    // Find unit from tenant
    const tenant = tenants.find(t => t.id === newPayment.tenantId);
    if (!tenant || !tenant.unitId) return; // simple validation

    const unit = units.find(u => u.id === tenant.unitId);

    // Resolve Method and Type
    const finalMethod = newPayment.method === 'Other' ? customMethod : newPayment.method;
    const finalType = newPayment.type === 'Other' ? customType : newPayment.type;

    if (!finalMethod || !finalType) {
        setFormError("Please specify the payment method and type.");
        return;
    }
    setFormError('');

    let rentPortion: number | undefined = undefined;
    let depositPortion: number | undefined = undefined;

    if (finalType === 'Rent + Deposit' && unit) {
      const depositReq = unit.depositAmount || unit.rentAmount;
      depositPortion = depositReq;
      rentPortion = Math.max(0, (newPayment.amount || 0) - depositReq);
      if (rentPortion === 0 && (newPayment.amount || 0) >= unit.rentAmount) {
        rentPortion = unit.rentAmount;
      }
    }

    const paymentData: Payment = {
      ...newPayment as Payment,
      id: `pay${Date.now()}`,
      unitId: tenant.unitId,
      method: finalMethod,
      type: finalType,
      rentPortion,
      depositPortion
    };

    recordPayment(paymentData);
    setShowModal(false);
    // Show success modal with print & download options
    setShowSuccess(paymentData);
    
    // Reset form
    setNewPayment({ tenantId: '', amount: 0, date: format(new Date(), 'yyyy-MM-dd'), method: 'Bank Transfer', type: 'Rent', status: 'Completed', notes: '' });
    setCustomMethod('');
    setCustomType('');
    setFormError('');
  };

  // Helper to get names
  const getTenantName = (id: string) => tenants.find(t => t.id === id)?.fullName || 'Unknown Tenant';
  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || 'Unknown Unit';

  const generateReceiptHtml = (payment: Payment) => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const tenantName = tenant?.fullName || 'Unknown Tenant';
    const tenantPhone = tenant?.phone || 'N/A';
    const unit = units.find(u => u.id === payment.unitId);
    const unitName = unit ? `${unit.name} • ${unit.floor || 'Ground Floor'}${unit.unitType ? ` (${unit.unitType})` : ''}` : 'Unknown Unit';
    const dateStr = format(new Date(payment.date), 'MMMM d, yyyy');

    let breakdownHtml = '';
    if (payment.type === 'Rent + Deposit') {
      const dep = payment.depositPortion ?? (unit?.depositAmount || (unit?.rentAmount || 0));
      const rent = payment.rentPortion ?? Math.max(0, payment.amount - dep);
      breakdownHtml = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
          <div style="font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Payment Breakdown</div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #334155; padding: 4px 0;">
            <span>1. Security Deposit</span>
            <span style="font-weight: 600;">Ksh ${dep.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #334155; padding: 4px 0;">
            <span>2. Advance Rent</span>
            <span style="font-weight: 600;">Ksh ${rent.toLocaleString()}</span>
          </div>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt #${payment.id} - ${tenantName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f1f5f9; margin: 0; color: #0f172a; }
            .receipt-container { max-width: 640px; margin: 0 auto; background: white; padding: 45px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
            .no-print { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 25px; }
            .print-btn { background: #0284c7; color: white; border: none; padding: 9px 18px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
            .print-btn:hover { background: #0369a1; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; }
            .company-name { font-size: 30px; font-weight: 800; color: #0c4a6e; letter-spacing: -0.5px; }
            .sub-header { color: #64748b; font-size: 14px; margin-top: 4px; }
            .receipt-title { text-align: center; font-size: 17px; font-weight: 700; text-transform: uppercase; color: #1e293b; margin-bottom: 25px; letter-spacing: 1.5px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; }
            
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .detail-item { display: flex; flex-direction: column; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; }
            .value { font-size: 15px; color: #0f172a; font-weight: 600; }
            
            .amount-box { background: #f0f9ff; border: 2px dashed #0284c7; padding: 22px; text-align: center; border-radius: 10px; margin: 25px 0; }
            .amount-label { color: #0369a1; font-size: 13px; font-weight: 700; letter-spacing: 1px; margin-bottom: 5px; }
            .amount-value { color: #0c4a6e; font-size: 34px; font-weight: 800; }

            .notes-box { background: #fafafa; border-left: 3px solid #cbd5e1; padding: 12px 16px; margin: 15px 0; font-size: 13px; color: #475569; }
            
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; }
            .sign-line { border-top: 1px solid #94a3b8; margin-top: 45px; text-align: center; font-size: 12px; color: #64748b; padding-top: 5px; }
            
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
            
            @media print {
              body { background: white; padding: 0; }
              .receipt-container { box-shadow: none; border: 1px solid #cbd5e1; padding: 30px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="no-print">
              <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
            </div>
            
            <div class="header">
              <div class="company-name">PropMinds</div>
              <div class="sub-header">Official Property Management Solution</div>
            </div>
            
            <div class="receipt-title">
              Official Payment Receipt
              <div style="margin-top: 6px;"><span class="badge">STATUS: ${payment.status.toUpperCase()}</span></div>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Receipt Number</span>
                <span class="value">#${payment.id}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Date</span>
                <span class="value">${dateStr}</span>
              </div>
              <div class="detail-item">
                <span class="label">Received From</span>
                <span class="value">${tenantName}</span>
                <span style="font-size: 12px; color: #64748b;">${tenantPhone}</span>
              </div>
              <div class="detail-item">
                <span class="label">Property / Unit</span>
                <span class="value">${unitName}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Method</span>
                <span class="value">${payment.method}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Type</span>
                <span class="value">${payment.type}</span>
              </div>
            </div>

            ${breakdownHtml}
            
            <div class="amount-box">
              <div class="amount-label">TOTAL AMOUNT RECEIVED</div>
              <div class="amount-value">Ksh ${payment.amount.toLocaleString()}</div>
            </div>

            ${payment.notes ? `
              <div class="notes-box">
                <strong>Notes / Reference:</strong> ${payment.notes}
              </div>
            ` : ''}

            <div class="signatures">
              <div>
                <div class="sign-line">Received By (Authorized Landlord/Agent)</div>
              </div>
              <div>
                <div class="sign-line">Tenant Acknowledgment</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your prompt payment.</p>
              <p>Document generated by PropMinds Real Estate System on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printReceipt = (payment: Payment) => {
    const htmlContent = generateReceiptHtml(payment);
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

  const downloadReceipt = (payment: Payment) => {
    const htmlContent = generateReceiptHtml(payment);
    const tenantName = getTenantName(payment.tenantId).replace(/[^a-zA-Z0-9]/g, '_');
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${payment.id}_${tenantName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> 
      : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />;
  };

  const filteredPayments = [...payments]
    .filter(p => getTenantName(p.tenantId).toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'tenant':
          aValue = getTenantName(a.tenantId).toLowerCase();
          bValue = getTenantName(b.tenantId).toLowerCase();
          break;
        case 'unit':
          aValue = getUnitName(a.unitId).toLowerCase();
          bValue = getUnitName(b.unitId).toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        default:
          // @ts-ignore
          aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
          // @ts-ignore
          bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payments & Rent</h1>
        <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Record Payment
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search payments by tenant..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th onClick={() => handleSort('date')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center gap-2">Date {getSortIcon('date')}</div>
                </th>
                <th onClick={() => handleSort('tenant')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center gap-2">Tenant {getSortIcon('tenant')}</div>
                </th>
                <th onClick={() => handleSort('unit')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center gap-2">Unit {getSortIcon('unit')}</div>
                </th>
                <th onClick={() => handleSort('type')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center gap-2">Type {getSortIcon('type')}</div>
                </th>
                <th onClick={() => handleSort('method')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center gap-2">Method {getSortIcon('method')}</div>
                </th>
                <th onClick={() => handleSort('status')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center gap-2">Status {getSortIcon('status')}</div>
                </th>
                <th onClick={() => handleSort('amount')} className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                  <div className="flex items-center justify-end gap-2">Amount (Ksh) {getSortIcon('amount')}</div>
                </th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 group">
                  <td className="p-4 text-gray-700 dark:text-gray-300">{format(new Date(payment.date), 'MMM d, yyyy')}</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{getTenantName(payment.tenantId)}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{getUnitName(payment.unitId)}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-sm ${payment.type === 'Deposit' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {payment.type === 'Deposit' && <Tag size={12} />}
                      {payment.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{payment.method}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-gray-800 dark:text-white">{payment.amount.toLocaleString()}</td>
                  <td className="p-4 text-center flex justify-center gap-1.5">
                     <button 
                       onClick={() => setViewPayment(payment)}
                       className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                       title="View Details"
                     >
                       <Eye size={17} />
                     </button>
                     <button 
                       onClick={() => printReceipt(payment)}
                       className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                       title="Print Receipt"
                     >
                       <Printer size={17} />
                     </button>
                     <button 
                       onClick={() => downloadReceipt(payment)}
                       className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
                       title="Download Receipt (HTML)"
                     >
                       <Download size={17} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Record Payment</h2>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-lg">
                {formError}
              </div>
            )}
            <form onSubmit={handleRecord} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Tenant</label>
                <select required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={newPayment.tenantId} 
                  onChange={e => {
                    const tId = e.target.value;
                    const tenant = tenants.find(t => t.id === tId);
                    const unit = units.find(u => u.id === tenant?.unitId);
                    let autoAmount = newPayment.amount;
                    if (unit && (!autoAmount || autoAmount === 0)) {
                      if (newPayment.type === 'Rent + Deposit') {
                        autoAmount = unit.rentAmount + (unit.depositAmount || unit.rentAmount);
                      } else {
                        autoAmount = unit.rentAmount;
                      }
                    }
                    setNewPayment({...newPayment, tenantId: tId, amount: autoAmount});
                  }}>
                  <option value="">Select Tenant</option>
                  {tenants.filter(t => t.status === 'Active').map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} (Unit: {getUnitName(t.unitId || '')})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Amount (Ksh)</label>
                  <input 
                    required 
                    type="text" 
                    inputMode="numeric"
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newPayment.amount === 0 ? '' : newPayment.amount?.toLocaleString()} 
                    onChange={e => {
                        const value = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(value))) {
                            setNewPayment({...newPayment, amount: Number(value)});
                        }
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Date</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    value={newPayment.date} 
                    onChange={e => setNewPayment({...newPayment, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Payment Method</label>
                  <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newPayment.method} 
                    onChange={e => {
                        setNewPayment({...newPayment, method: e.target.value as any});
                        if (e.target.value !== 'Other') setCustomMethod('');
                    }}
                  >
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>Mobile Money</option>
                    <option>Card</option>
                    <option value="Other">Other</option>
                  </select>
                  {newPayment.method === 'Other' && (
                      <input 
                        type="text" 
                        placeholder="Specify method..."
                        className="w-full p-2 mt-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                        value={customMethod}
                        onChange={e => setCustomMethod(e.target.value)}
                        required
                      />
                  )}
                </div>
                <div>
                   <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Payment Type</label>
                   <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newPayment.type} 
                    onChange={e => {
                        const newType = e.target.value;
                        let autoAmount = newPayment.amount;
                        const tenant = tenants.find(t => t.id === newPayment.tenantId);
                        const unit = units.find(u => u.id === tenant?.unitId);
                        if (unit) {
                          if (newType === 'Rent + Deposit') {
                            autoAmount = unit.rentAmount + (unit.depositAmount || unit.rentAmount);
                          } else if (newType === 'Rent') {
                            autoAmount = unit.rentAmount;
                          } else if (newType === 'Deposit') {
                            autoAmount = unit.depositAmount || unit.rentAmount;
                          } else if (newType === 'Water Utility') {
                            const prev = unit.previousWaterReading ?? 0;
                            const curr = unit.currentWaterReading ?? 0;
                            const cons = Math.max(0, curr - prev);
                            autoAmount = Math.round(cons * (unit.waterRatePerUnit || 150));
                          }
                        }
                        setNewPayment({...newPayment, type: newType as any, amount: autoAmount});
                        if (newType !== 'Other') setCustomType('');
                    }}
                   >
                    <option value="Rent">Rent</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Rent + Deposit">Rent + Deposit</option>
                    <option value="Water Utility">Water Utility (Meter Bill)</option>
                    <option value="Other">Other</option>
                   </select>
                   {newPayment.type === 'Other' && (
                      <input 
                        type="text" 
                        placeholder="Specify type (e.g. Late Fee)..."
                        className="w-full p-2 mt-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                        value={customType}
                        onChange={e => setCustomType(e.target.value)}
                        required
                      />
                  )}
                  {newPayment.type === 'Rent + Deposit' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
                      <Layers size={13} /> Combines Advance Rent & Security Deposit into one receipt.
                    </p>
                  )}
                </div>
              </div>

              <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                  <textarea 
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Add any additional details here..."
                    value={newPayment.notes || ''} 
                    onChange={e => setNewPayment({...newPayment, notes: e.target.value})} 
                  />
              </div>

              {/* Auto Calculation Preview */}
              {calculation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Calculator className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {newPayment.type === 'Rent + Deposit' ? 'Rent + Deposit Breakdown' : 'Rent Coverage Calculator'}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Covers <strong>{calculation.months} month(s)</strong> of rent.
                        {calculation.depositNote && ` • ${calculation.depositNote}`}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-blue-800 dark:text-blue-200">
                        <CalendarCheck size={14} />
                        <span>Rent Paid Until: {calculation.newDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" /> Payment Details
                    </h2>
                    <button onClick={() => setViewPayment(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">Ksh {viewPayment.amount.toLocaleString()}</p>
                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {viewPayment.status}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</p>
                                <p className="text-gray-800 dark:text-white font-medium flex items-center gap-2">
                                    <CalendarCheck size={16} className="text-blue-500"/>
                                    {format(new Date(viewPayment.date), 'MMMM d, yyyy')}
                                </p>
                           </div>
                           <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment ID</p>
                                <p className="text-gray-800 dark:text-white text-sm font-mono">{viewPayment.id}</p>
                           </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                           <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Payment Info</p>
                           <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Tenant</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{getTenantName(viewPayment.tenantId)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Unit</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{getUnitName(viewPayment.unitId)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Method</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{viewPayment.method}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{viewPayment.type}</span>
                                </div>
                           </div>
                        </div>

                        {viewPayment.notes && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FileText className="text-gray-400 mt-0.5 shrink-0" size={16} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Notes</p>
                                        <p className="text-sm text-gray-800 dark:text-white mt-1">{viewPayment.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-end items-center bg-gray-50 dark:bg-gray-900/50 gap-2.5">
                     <button 
                        onClick={() => downloadReceipt(viewPayment)}
                        className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 text-sm font-medium transition-colors shadow-xs"
                     >
                        <Download size={16} /> Download Receipt
                     </button>
                     <button 
                        onClick={() => {
                            printReceipt(viewPayment);
                        }}
                        className="px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm font-medium transition-colors shadow-xs"
                     >
                        <Printer size={16} /> Print Receipt
                     </button>
                     <button 
                        onClick={() => setViewPayment(null)} 
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success / Print Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm text-center shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Recorded!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              The payment of <strong>Ksh {showSuccess.amount.toLocaleString()}</strong> ({showSuccess.type}) has been successfully added to the system.
            </p>
            <div className="grid gap-2.5">
              <button 
                onClick={() => printReceipt(showSuccess)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all text-sm"
              >
                <Printer size={18} /> Print Receipt
              </button>
              <button 
                onClick={() => downloadReceipt(showSuccess)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all text-sm"
              >
                <Download size={18} /> Download Receipt (HTML)
              </button>
              <button 
                onClick={() => setShowSuccess(null)}
                className="w-full py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
