import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MaintenanceTicket } from '../types';
import { format } from 'date-fns';
import { 
  Wrench, Plus, Search, Filter, AlertTriangle, Clock, CheckCircle2, 
  XCircle, Phone, User, Home, DollarSign, Calendar, ArrowRight, Eye, Edit, Trash2, X, Send
} from 'lucide-react';

const Maintenance: React.FC = () => {
  const { 
    maintenanceTickets, properties, units, tenants, 
    addMaintenanceTicket, updateMaintenanceTicket, deleteMaintenanceTicket, convertTicketToExpense 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTicket, setEditTicket] = useState<MaintenanceTicket | null>(null);
  const [viewTicket, setViewTicket] = useState<MaintenanceTicket | null>(null);
  const [convertModalTicket, setConvertModalTicket] = useState<MaintenanceTicket | null>(null);
  const [convertCostInput, setConvertCostInput] = useState<string>('');

  // Form State for Add Ticket
  const [formData, setFormData] = useState<{
    propertyId: string;
    unitId: string;
    tenantId: string;
    title: string;
    description: string;
    category: MaintenanceTicket['category'];
    priority: MaintenanceTicket['priority'];
    status: MaintenanceTicket['status'];
    estimatedCost: string;
    scheduledDate: string;
    contractorName: string;
    contractorPhone: string;
  }>({
    propertyId: properties[0]?.id || '',
    unitId: '',
    tenantId: '',
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'Medium',
    status: 'Open',
    estimatedCost: '',
    scheduledDate: '',
    contractorName: '',
    contractorPhone: ''
  });

  // Helpers
  const getPropertyName = (pid: string) => properties.find(p => p.id === pid)?.name || 'Unknown Property';
  const getUnitName = (uid?: string) => uid ? units.find(u => u.id === uid)?.name || 'Unknown Unit' : 'General Building';
  const getTenantName = (tid?: string) => tid ? tenants.find(t => t.id === tid)?.fullName || 'Unknown' : 'Unassigned';

  const getPriorityBadge = (p: MaintenanceTicket['priority']) => {
    switch (p) {
      case 'Emergency':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusBadge = (s: MaintenanceTicket['status']) => {
    switch (s) {
      case 'Open':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Pending Approval':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'Cancelled':
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Metrics
  const totalTickets = maintenanceTickets.length;
  const openTickets = maintenanceTickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = maintenanceTickets.filter(t => t.status === 'In Progress').length;
  const completedTickets = maintenanceTickets.filter(t => t.status === 'Completed').length;
  const totalCost = maintenanceTickets.reduce((sum, t) => sum + (t.actualCost || 0), 0);

  // Filtered List
  const filteredTickets = maintenanceTickets.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.contractorName && t.contractorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getPropertyName(t.propertyId).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProp = filterProperty === 'All' || t.propertyId === filterProperty;
    const matchesCat = filterCategory === 'All' || t.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    return matchesSearch && matchesProp && matchesCat && matchesStatus && matchesPriority;
  });

  // Handle Create
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: MaintenanceTicket = {
      id: `m_${Date.now()}`,
      propertyId: formData.propertyId,
      unitId: formData.unitId || undefined,
      tenantId: formData.tenantId || undefined,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost.replace(/,/g, '')) : undefined,
      actualCost: 0,
      reportedDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledDate: formData.scheduledDate || undefined,
      contractorName: formData.contractorName || undefined,
      contractorPhone: formData.contractorPhone || undefined,
      convertedToExpense: false,
      notes: []
    };

    addMaintenanceTicket(newTicket);
    setShowAddModal(false);
    setFormData({
      propertyId: properties[0]?.id || '',
      unitId: '',
      tenantId: '',
      title: '',
      description: '',
      category: 'Plumbing',
      priority: 'Medium',
      status: 'Open',
      estimatedCost: '',
      scheduledDate: '',
      contractorName: '',
      contractorPhone: ''
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTicket) return;
    updateMaintenanceTicket(editTicket);
    setEditTicket(null);
  };

  // Convert to Expense
  const handleConvertConfirm = () => {
    if (!convertModalTicket) return;
    const cost = parseFloat(convertCostInput.replace(/,/g, '')) || 0;
    convertTicketToExpense(convertModalTicket.id, cost);
    setConvertModalTicket(null);
    setConvertCostInput('');
  };

  const availableUnitsForForm = units.filter(u => u.propertyId === formData.propertyId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Wrench className="text-blue-600 dark:text-blue-400" /> Maintenance & Work Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dispatch repairs, track contractor work, and bridge costs directly to your expenses ledger.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm font-medium transition-all"
        >
          <Plus size={18} /> New Work Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalTickets}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-semibold">Action Needed (Open)</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{openTickets}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressTickets}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedTickets}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm col-span-2 md:col-span-1">
          <p className="text-xs text-purple-600 dark:text-purple-400 uppercase font-semibold">Completed Spend</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">Ksh {totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by issue title, description, contractor, or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm outline-none"
            >
              <option value="All">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Structural">Structural</option>
              <option value="HVAC">HVAC</option>
              <option value="Appliance">Appliance</option>
              <option value="Pest Control">Pest Control</option>
              <option value="General">General</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Wrench className="mx-auto text-gray-400 mb-3" size={36} />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No maintenance tickets found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or create a new repair ticket.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{ticket.title}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 flex items-center gap-1">
                    <Home size={13} /> {getPropertyName(ticket.propertyId)} • {getUnitName(ticket.unitId)}
                  </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {ticket.description}
                </p>

                <div className="pt-2 border-t dark:border-gray-700/60 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reported:</span>
                    <span>{format(new Date(ticket.reportedDate), 'MMM d, yyyy')}</span>
                  </div>
                  {ticket.contractorName && (
                    <div className="flex justify-between">
                      <span>Contractor:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.contractorName}</span>
                    </div>
                  )}
                  {ticket.estimatedCost ? (
                    <div className="flex justify-between">
                      <span>Est. Cost:</span>
                      <span className="font-medium text-gray-900 dark:text-white">Ksh {ticket.estimatedCost.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {ticket.actualCost ? (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Actual Cost:</span>
                      <span>Ksh {ticket.actualCost.toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700/60 rounded-b-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewTicket(ticket)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View Ticket"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    onClick={() => setEditTicket(ticket)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit Ticket"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this maintenance ticket?")) {
                        deleteMaintenanceTicket(ticket.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                {/* Expense Converter Button */}
                {!ticket.convertedToExpense ? (
                  <button
                    onClick={() => {
                      setConvertModalTicket(ticket);
                      setConvertCostInput(ticket.actualCost ? ticket.actualCost.toString() : (ticket.estimatedCost ? ticket.estimatedCost.toString() : ''));
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors shadow-sm"
                  >
                    <DollarSign size={13} /> Log Expense
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={14} /> Expensed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="text-blue-600" /> New Maintenance Work Order
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Water heater leaking, Main gate intercom broken"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property *</label>
                  <select
                    required
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unitId: '' })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit (Optional)</label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => {
                      const uId = e.target.value;
                      const assignedTenant = tenants.find(t => t.unitId === uId && t.status === 'Active');
                      setFormData({ 
                        ...formData, 
                        unitId: uId,
                        tenantId: assignedTenant ? assignedTenant.id : ''
                      });
                    }}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="">General Building / Common Area</option>
                    {availableUnitsForForm.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Structural">Structural</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide precise details about the defect, location, and symptoms..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost (Ksh)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5,000"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Repair Date</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor / Handyman Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Samuel M. (Plumber)"
                    value={formData.contractorName}
                    onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +254 712 345678"
                    value={formData.contractorPhone}
                    onChange={(e) => setFormData({ ...formData, contractorPhone: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-md"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORK ORDER MODAL */}
      {editTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit className="text-blue-600" /> Update Work Order #{editTicket.id}
              </h2>
              <button onClick={() => setEditTicket(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={editTicket.title}
                  onChange={(e) => setEditTicket({ ...editTicket, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editTicket.status}
                    onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={editTicket.priority}
                    onChange={(e) => setEditTicket({ ...editTicket, priority: e.target.value as any })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editTicket.description}
                  onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost (Ksh)</label>
                  <input
                    type="number"
                    value={editTicket.estimatedCost || ''}
                    onChange={(e) => setEditTicket({ ...editTicket, estimatedCost: parseFloat(e.target.value) || undefined })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actual Cost (Ksh)</label>
                  <input
                    type="number"
                    value={editTicket.actualCost || ''}
                    onChange={(e) => setEditTicket({ ...editTicket, actualCost: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor Name</label>
                  <input
                    type="text"
                    value={editTicket.contractorName || ''}
                    onChange={(e) => setEditTicket({ ...editTicket, contractorName: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor Phone</label>
                  <input
                    type="text"
                    value={editTicket.contractorPhone || ''}
                    onChange={(e) => setEditTicket({ ...editTicket, contractorPhone: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditTicket(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAILS MODAL */}
      {viewTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 flex justify-between items-start">
              <div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${getPriorityBadge(viewTicket.priority)}`}>
                  {viewTicket.priority} Priority
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{viewTicket.title}</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {getPropertyName(viewTicket.propertyId)} • {getUnitName(viewTicket.unitId)}
                </p>
              </div>
              <button onClick={() => setViewTicket(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-2">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Issue Details</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{viewTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{viewTicket.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusBadge(viewTicket.status)}`}>
                    {viewTicket.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reported Date</p>
                  <p className="font-medium text-gray-800 dark:text-white">{format(new Date(viewTicket.reportedDate), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled Date</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {viewTicket.scheduledDate ? format(new Date(viewTicket.scheduledDate), 'MMMM d, yyyy') : 'Unscheduled'}
                  </p>
                </div>
              </div>

              {/* Financials & Contractor */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-3">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Contractor & Costs</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Contractor:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{viewTicket.contractorName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Contact:</span>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {viewTicket.contractorPhone ? (
                        <a href={`tel:${viewTicket.contractorPhone}`} className="hover:underline flex items-center gap-1">
                          <Phone size={13} /> {viewTicket.contractorPhone}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Est. Cost:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {viewTicket.estimatedCost ? `Ksh ${viewTicket.estimatedCost.toLocaleString()}` : 'None set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Actual Cost:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {viewTicket.actualCost ? `Ksh ${viewTicket.actualCost.toLocaleString()}` : 'Ksh 0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this maintenance ticket?")) {
                    deleteMaintenanceTicket(viewTicket.id);
                    setViewTicket(null);
                  }
                }}
                className="px-3.5 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={16} /> Delete Ticket
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditTicket(viewTicket);
                    setViewTicket(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Edit size={15} /> Edit Ticket
                </button>
                <button
                  onClick={() => setViewTicket(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT TO EXPENSE CONFIRMATION MODAL */}
      {convertModalTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log to Expense Ledger</h3>
                <p className="text-xs text-gray-500">Convert this work order into an official financial expense.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Work order <strong>"{convertModalTicket.title}"</strong> will be marked as Completed and recorded under the <strong>Maintenance</strong> category for {getPropertyName(convertModalTicket.propertyId)}.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Final Actual Cost (Ksh) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="e.g. 4,500"
                value={convertCostInput}
                onChange={(e) => setConvertCostInput(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setConvertModalTicket(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md"
              >
                Confirm & Record Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
