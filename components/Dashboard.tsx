import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Home, AlertCircle, Wallet, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isSameMonth, parseISO, differenceInDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const { units, tenants, payments, maintenanceTickets } = useApp();

  // Metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const activeTenantsCount = tenants.filter(t => t.status === 'Active').length;

  // Financials
  const currentMonth = new Date();
  const currentMonthPayments = payments.filter(p => isSameMonth(new Date(p.date), currentMonth));
  const totalCollected = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Expected Rent vs Collected
  const expectedRent = units
    .filter(u => u.status === 'Occupied')
    .reduce((acc, curr) => acc + curr.rentAmount, 0);
  
  // Outstanding Balance Logic
  // Iterate through active tenants. If 'paidUntil' is in the past, add their monthly rent.
  const outstandingBalance = tenants.reduce((acc, tenant) => {
    if (tenant.status !== 'Active' || !tenant.unitId) return acc;
    
    const unit = units.find(u => u.id === tenant.unitId);
    if (!unit) return acc;

    if (!tenant.paidUntil) {
       // If never paid, assume they owe current month
       return acc + unit.rentAmount;
    }

    const paidUntilDate = new Date(tenant.paidUntil);
    const today = new Date();
    
    // If paidUntil is in the past, they owe money.
    if (paidUntilDate < today) {
       // Calculate how many months overdue (roughly)
       const diffDays = Math.max(0, differenceInDays(today, paidUntilDate));
       const monthsOverdue = Math.ceil(diffDays / 30);
       return acc + (unit.rentAmount * monthsOverdue);
    }

    return acc;
  }, 0);

  // Chart Data (Last 6 months revenue)
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(d, 'MMM');
      const total = payments
        .filter(p => isSameMonth(new Date(p.date), d))
        .reduce((acc, curr) => acc + curr.amount, 0);
      data.push({ name: monthKey, revenue: total });
    }
    return data;
  }, [payments]);

  // Alerts (Lease expiry in next 30 days)
  const expiringLeases = tenants.filter(t => {
    if (t.status !== 'Active' || !t.leaseEnd) return false;
    const end = new Date(t.leaseEnd);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && end > now;
  });

  // Urgent Maintenance Tickets
  const urgentTickets = maintenanceTickets.filter(
    t => (t.priority === 'High' || t.priority === 'Emergency') && (t.status === 'Open' || t.status === 'In Progress')
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{occupancyRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300">
              <Home size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{occupiedUnits} / {totalUnits} Units Occupied</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue (Mo)</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">Ksh {totalCollected.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Expected: Ksh {expectedRent.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">Ksh {outstandingBalance.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-300">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Uncollected Rent</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Tenants</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeTenantsCount}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Current Residents</p>
        </div>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(value) => `Ksh ${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  cursor={{fill: 'transparent'}}
                  formatter={(value) => [`Ksh ${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0ea5e9' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Alerts</h3>
          <div className="space-y-4">
            {expiringLeases.length === 0 && outstandingBalance === 0 && urgentTickets.length === 0 && (
              <div className="text-center text-gray-500 py-8">No active alerts</div>
            )}

            {urgentTickets.map(ticket => (
              <Link
                to="/maintenance"
                key={ticket.id}
                className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-100/60 dark:hover:bg-red-900/40 transition-colors"
              >
                <Wrench className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200">{ticket.priority} Repair</p>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 truncate">
                    {ticket.title}
                  </p>
                </div>
              </Link>
            ))}
            
            {expiringLeases.map(t => (
              <div key={t.id} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Lease Expiring</p>
                  <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                    {t.fullName} • {t.leaseEnd ? format(new Date(t.leaseEnd), 'MMM d, yyyy') : 'Unknown Date'}
                  </p>
                </div>
              </div>
            ))}

            {outstandingBalance > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                <TrendingUp className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Rent Overdue</p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    Ksh {outstandingBalance.toLocaleString()} outstanding total.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;