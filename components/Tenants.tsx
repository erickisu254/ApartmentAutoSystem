
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tenant, Note, UnitStatus } from '../types';
import { Search, Plus, FileText, MoreHorizontal, Mail, Trash2, Edit2, History, UserCheck, Eye, X, User, CreditCard, DollarSign, Home, Calendar, Phone, Clock, FileCheck, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import AiAssistant from './AiAssistant';
import LeaseModal from './LeaseModal';

const Tenants: React.FC = () => {
  const { tenants, units, properties, payments, addTenant, updateTenant, addNote, deleteTenant, restoreTenant, signLease } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'previous'>('active');
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [leaseModalTenant, setLeaseModalTenant] = useState<Tenant | null>(null);
  
  // AI State
  const [aiTarget, setAiTarget] = useState<{name: string, context: string, phone?: string, email?: string} | null>(null);

  // Form State (Shared for Add and Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Tenant>>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    leaseStart: '',
    leaseEnd: '',
    occupants: 1,
    unitId: ''
  });

  const filteredTenants = tenants.filter(t => 
    t.status === (viewMode === 'active' ? 'Active' : 'Previous') &&
    (t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.unitId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getUnitName = (id?: string | null) => {
    if (!id) return 'Unassigned';
    const u = units.find(unit => unit.id === id);
    return u ? `${u.name}${u.floor ? ` (${u.floor})` : ''}` : 'Unknown';
  };

  const getUnitInfo = (id?: string | null) => {
    if (!id) return null;
    return units.find(unit => unit.id === id);
  };

  const getTenantPayments = (tenantId: string) => {
    return payments.filter(p => p.tenantId === tenantId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getPaidUntilStatus = (dateStr?: string) => {
    if (!dateStr) return { text: 'Not Recorded', color: 'text-gray-500' };
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return { text: `Overdue (${format(date, 'MMM d')})`, color: 'text-red-600 font-medium' };
    return { text: `Paid until ${format(date, 'MMM d, yyyy')}`, color: 'text-green-600 font-medium' };
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      idNumber: '',
      leaseStart: '',
      leaseEnd: '',
      occupants: 1,
      unitId: ''
    });
    setShowModal(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setIsEditing(true);
    setFormData({
      id: tenant.id,
      fullName: tenant.fullName,
      email: tenant.email || '',
      phone: tenant.phone,
      idNumber: tenant.idNumber,
      leaseStart: tenant.leaseStart || '',
      leaseEnd: tenant.leaseEnd || '',
      occupants: tenant.occupants,
      unitId: tenant.unitId || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
      // Update Existing
      const updatedTenant = tenants.find(t => t.id === formData.id);
      if (updatedTenant) {
        updateTenant({
          ...updatedTenant,
          ...formData as Tenant
        });
      }
    } else {
      // Add New
      const id = `t${Date.now()}`;
      addTenant({
        ...formData as Tenant,
        id,
        notes: []
      });
    }
    
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (viewMode === 'active') {
       if (confirm("Are you sure you want to remove this tenant? They will be moved to 'Previous Tenants'.")) {
          deleteTenant(id);
       }
    } else {
       if (confirm("Are you sure you want to permanently delete this tenant history?")) {
          deleteTenant(id);
       }
    }
  };

  const availableUnits = units.filter(u => u.status === UnitStatus.VACANT || u.status === UnitStatus.MAINTENANCE);
  // Also include current unit if editing
  const formUnits = isEditing && formData.unitId 
    ? [...availableUnits, units.find(u => u.id === formData.unitId)].filter(Boolean) as typeof units
    : availableUnits;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tenants</h1>
        <div className="flex gap-2">
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={18} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
           <button 
             onClick={() => setViewMode('active')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'active' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
           >
             <UserCheck size={16} /> Active Tenants
           </button>
           <button 
             onClick={() => setViewMode('previous')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'previous' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
           >
             <History size={16} /> Previous Tenants
           </button>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Tenant List */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No {viewMode} tenants found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTenants.map(tenant => (
            <div key={tenant.id} className={`bg-white dark:bg-gray-800 rounded-xl border ${viewMode === 'previous' ? 'border-gray-200 dark:border-gray-700 opacity-75' : 'border-gray-100 dark:border-gray-700'} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{tenant.fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.email || 'No email provided'}</p>
                  </div>
                  {viewMode === 'active' && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${tenant.unitId ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600'}`}>
                      {getUnitName(tenant.unitId)}
                    </span>
                  )}
                  {viewMode === 'previous' && (
                     <div className="flex flex-col items-end gap-1">
                       <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                         Moved Out
                       </span>
                       <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                         Prev: {tenant.previousUnitName || getUnitName(tenant.previousUnitId || tenant.unitId)}
                       </span>
                     </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">{tenant.phone}</span>
                  </div>
                  {tenant.idNumber ? (
                    <div className="flex justify-between">
                      <span>ID Number:</span>
                      <span className="font-medium">{tenant.idNumber}</span>
                    </div>
                  ) : null}
                  {viewMode === 'active' && (
                    <div className="flex justify-between">
                      <span>Rent Status:</span>
                      <span className={`text-xs ${getPaidUntilStatus(tenant.paidUntil).color}`}>
                        {getPaidUntilStatus(tenant.paidUntil).text}
                      </span>
                    </div>
                  )}
                  {tenant.leaseEnd && (
                    <div className="flex justify-between">
                      <span>Lease End:</span>
                      <span className={`font-medium ${viewMode === 'active' && new Date(tenant.leaseEnd) < new Date() ? 'text-red-500' : ''}`}>
                        {format(new Date(tenant.leaseEnd), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Occupants:</span>
                    <span className="font-medium">{tenant.occupants}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                       onClick={() => handleDelete(tenant.id)}
                       className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                       title={viewMode === 'active' ? "Move to Previous Tenants (All data preserved)" : "Permanently Delete"}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={() => setViewTenant(tenant)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 rounded-full transition-colors"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                     {viewMode === 'previous' && (
                        <button
                          onClick={() => {
                            if (confirm(`Restore ${tenant.fullName} to Active Tenants? You can reassign a unit in the edit modal.`)) {
                              restoreTenant(tenant.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg flex items-center gap-1.5 transition-colors"
                          title="Restore to Active Tenants"
                        >
                          <UserCheck size={14} /> Restore
                        </button>
                     )}
                     {viewMode === 'active' && (
                        <>
                          <button 
                            onClick={() => setLeaseModalTenant(tenant)}
                            className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            title="View / Sign Lease Agreement"
                          >
                            <FileCheck size={18} />
                          </button>
                          <button 
                            onClick={() => openEditModal(tenant)}
                            className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            title="Edit Tenant"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => setAiTarget({ 
                              name: tenant.fullName, 
                              context: `Unit: ${getUnitName(tenant.unitId)}, Lease Ends: ${tenant.leaseEnd || 'N/A'}, Paid Until: ${tenant.paidUntil || 'Unknown'}`,
                              phone: tenant.phone,
                              email: tenant.email
                            })}
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            title="AI Draft & Dispatch Notice"
                          >
                            <Mail size={18} />
                          </button>
                        </>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Tenant Details Modal */}
      {viewTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <User size={24} className="text-blue-600" /> {viewTenant.fullName}
                    </h2>
                    <button onClick={() => setViewTenant(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Status Badge */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            viewTenant.status === 'Active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                            {viewTenant.status} Tenant
                        </span>
                        {viewTenant.leaseSigned && (
                           <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                             <ShieldCheck size={14} />
                             Lease Signed
                           </span>
                        )}
                        {viewTenant.paidUntil && (
                           <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                             new Date(viewTenant.paidUntil) < new Date() 
                               ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                               : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                           }`}>
                             <Clock size={14} />
                             Paid until: {format(new Date(viewTenant.paidUntil), 'MMM d, yyyy')}
                           </span>
                        )}
                    </div>

                    {/* Personal & Lease Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Details</h3>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Mail size={16} className="text-blue-500" />
                                <span>{viewTenant.email || 'N/A'}</span>
                            </div>
                             <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Phone size={16} className="text-blue-500" />
                                <span>{viewTenant.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <CreditCard size={16} className="text-blue-500" />
                                <span>ID: {viewTenant.idNumber || 'Not provided'}</span>
                            </div>
                        </div>

                        {/* Lease Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lease & Unit Information</h3>
                            {(() => {
                              const assignedUnit = viewTenant.unitId ? units.find(u => u.id === viewTenant.unitId) : null;
                              return (
                                <>
                                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                      <Home size={16} className="text-blue-500" />
                                      <span className="flex items-center gap-1.5 flex-wrap">
                                        Unit: <strong className="text-gray-900 dark:text-white">
                                          {viewTenant.status === 'Previous' 
                                            ? `${viewTenant.previousUnitName || getUnitName(viewTenant.previousUnitId) || 'Unassigned'} (Moved Out)` 
                                            : (assignedUnit ? `${assignedUnit.name} • ${assignedUnit.floor || 'Ground Floor'}` : 'Unassigned')}
                                        </strong>
                                        {assignedUnit?.unitType && (
                                          <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium">
                                            {assignedUnit.unitType}{assignedUnit.unitTypeNote ? ` • ${assignedUnit.unitTypeNote}` : ''}
                                          </span>
                                        )}
                                      </span>
                                  </div>
                                  {assignedUnit?.utilityNote && (
                                    <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800/40">
                                      <span>📌 <strong>Additional Note:</strong> {assignedUnit.utilityNote}</span>
                                    </div>
                                  )}
                                  {assignedUnit?.waterMeterNumber && (
                                    <div className="flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 p-2 rounded-lg border border-cyan-100 dark:border-cyan-800">
                                      <span>💧 <strong>Meter #{assignedUnit.waterMeterNumber}:</strong> Initial: {assignedUnit.initialWaterReading ?? 0} m³ • Current: {assignedUnit.currentWaterReading ?? 0} m³{assignedUnit.currentWaterReadingDate ? ` (Read: ${format(new Date(assignedUnit.currentWaterReadingDate), 'MMM d, yyyy')})` : ''}</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <User size={16} className="text-blue-500" />
                                <span>Occupants: {viewTenant.occupants}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Calendar size={16} className="text-blue-500" />
                                <span>
                                    <span className="font-medium">Move-In Date / Lease Start:</span><br/>
                                    {viewTenant.leaseStart ? format(new Date(viewTenant.leaseStart), 'MMM d, yyyy') : 'Not set'} 
                                </span>
                            </div>
                             <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Calendar size={16} className="text-blue-500" />
                                <span>
                                    <span className="font-medium">Lease End:</span><br/>
                                    {viewTenant.leaseEnd ? format(new Date(viewTenant.leaseEnd), 'MMM d, yyyy') : 'No fixed end date'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <DollarSign size={20} /> Payment History
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                             {getTenantPayments(viewTenant.id).length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-3 font-medium text-gray-600 dark:text-gray-300">Date</th>
                                            <th className="p-3 font-medium text-gray-600 dark:text-gray-300">Type</th>
                                            <th className="p-3 font-medium text-gray-600 dark:text-gray-300 text-right">Amount (Ksh)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {getTenantPayments(viewTenant.id).map(p => (
                                            <tr key={p.id}>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">{format(new Date(p.date), 'MMM d, yyyy')}</td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">{p.type}</td>
                                                <td className="p-3 text-right font-medium text-gray-800 dark:text-white">{p.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             ) : (
                                 <p className="p-4 text-gray-500 text-center">No payment history recorded.</p>
                             )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FileText size={20} /> Notes
                        </h3>
                        <div className="space-y-3">
                            {viewTenant.notes && viewTenant.notes.length > 0 ? (
                                viewTenant.notes.map(note => (
                                    <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                                        <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex justify-between">
                                            <span>{format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                            <span>by {note.author}</span>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No notes available.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap justify-between items-center gap-3">
                     <button 
                        onClick={() => {
                          const t = viewTenant;
                          setViewTenant(null);
                          setLeaseModalTenant(t);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                     >
                        <FileCheck size={16} /> View / Sign Lease Agreement
                     </button>
                     <button 
                        onClick={() => setViewTenant(null)} 
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}

      {/* Add/Edit Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {isEditing ? 'Edit Tenant' : 'Add New Tenant'}
            </h2>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                <input type="email" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input required type="tel" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID / Passport Number (Optional)</label>
                <input type="text" placeholder="e.g. 12345678 (optional)" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={formData.idNumber || ''} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Move-In Date / Lease Start</label>
                <input type="date" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                  value={formData.leaseStart} onChange={e => setFormData({...formData, leaseStart: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lease End (Optional)</label>
                <input type="date" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                  value={formData.leaseEnd} onChange={e => setFormData({...formData, leaseEnd: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupants</label>
                <input required type="number" min="1" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={formData.occupants} onChange={e => setFormData({...formData, occupants: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Unit</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={formData.unitId || ''}
                  onChange={e => setFormData({...formData, unitId: e.target.value})}
                >
                  <option value="">Select Unit (Optional)</option>
                  {formUnits.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} • {u.floor || 'Ground Floor'}{u.unitType ? ` • ${u.unitType}` : ''} (Ksh {u.rentAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  {isEditing ? 'Save Changes' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {aiTarget && (
        <AiAssistant 
          tenantName={aiTarget.name}
          contextDetails={aiTarget.context}
          tenantPhone={aiTarget.phone}
          tenantEmail={aiTarget.email}
          onClose={() => setAiTarget(null)}
        />
      )}

      {leaseModalTenant && (
        <LeaseModal
          tenant={leaseModalTenant}
          unit={units.find(u => u.id === leaseModalTenant.unitId)}
          property={properties.find(p => p.id === units.find(u => u.id === leaseModalTenant.unitId)?.propertyId)}
          onClose={() => setLeaseModalTenant(null)}
          onSaveSignature={(sigUrl) => {
            signLease(leaseModalTenant.id, sigUrl);
          }}
        />
      )}
    </div>
  );
};

export default Tenants;
