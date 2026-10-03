
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Home, MapPin, Trash2, Eye, X, User, Phone, Mail, Calendar, Edit, 
  CheckCircle, AlertCircle, FileText, Search, ChevronDown, Clock, Image as ImageIcon,
  Droplets, Layers, Building, RefreshCw, Send, Check, DollarSign, ArrowUpRight
} from 'lucide-react';
import { UnitStatus, Unit, Tenant, Property } from '../types';
import { format } from 'date-fns';

const PRESET_FLOORS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  'Basement'
];

const PRESET_UNIT_TYPES = [
  'Single Room',
  'Bedsitter',
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4 Bedroom',
  'Penthouse',
  'Shop / Commercial'
];

const Properties: React.FC = () => {
  const { properties, units, tenants, payments, addProperty, updateProperty, deleteProperty, addUnit, updateUnit, deleteUnit, addNote, updateTenant } = useApp();
  const [showAddProp, setShowAddProp] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [showAddUnit, setShowAddUnit] = useState<string | null>(null); // Property ID for adding unit
  
  const [viewUnit, setViewUnit] = useState<Unit | null>(null); // Unit for viewing details
  const [editUnit, setEditUnit] = useState<Unit | null>(null); // Unit for editing

  // Floor grouping and filter state per property
  const [selectedFloorByProperty, setSelectedFloorByProperty] = useState<{ [propId: string]: string }>({});
  const [groupByFloorByProperty, setGroupByFloorByProperty] = useState<{ [propId: string]: boolean }>({});

  // Quick Meter Reading Update Modal
  const [meterModalUnit, setMeterModalUnit] = useState<Unit | null>(null);
  const [newReadingVal, setNewReadingVal] = useState('');
  const [newReadingDate, setNewReadingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFinalReadingUpdate, setIsFinalReadingUpdate] = useState(false);
  const [finalReadingVal, setFinalReadingVal] = useState('');
  const [finalReadingDate, setFinalReadingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showMeterUpdateModal, setShowMeterUpdateModal] = useState(false);

  // Form States
  const [newProperty, setNewProperty] = useState({ name: '', address: '', image: '' });
  const [newUnit, setNewUnit] = useState({ 
    name: '', 
    rentAmount: 0, 
    depositAmount: 0,
    floor: 'Ground Floor',
    unitType: '1 Bedroom',
    unitTypeNote: '',
    utilityNote: '',
    waterMeterNumber: '',
    initialWaterReading: 0,
    initialWaterReadingDate: format(new Date(), 'yyyy-MM-dd'),
    currentWaterReading: 0,
    currentWaterReadingDate: format(new Date(), 'yyyy-MM-dd'),
    finalWaterReading: '' as string | number,
    finalWaterReadingDate: ''
  });
  
  // Edit Unit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    rentAmount: 0,
    depositAmount: 0,
    floor: 'Ground Floor',
    unitType: '1 Bedroom',
    unitTypeNote: '',
    utilityNote: '',
    waterMeterNumber: '',
    initialWaterReading: 0,
    initialWaterReadingDate: '',
    currentWaterReading: 0,
    currentWaterReadingDate: '',
    finalWaterReading: '' as string | number,
    finalWaterReadingDate: '',
    status: UnitStatus.VACANT,
    tenantId: '' as string | null,
    leaseStart: '' as string, // Added leaseStart/Move-In Date
    note: ''
  });

  // Tenant Search State for Edit Form
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsTenantDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackImage = `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80`;
    addProperty({
      id: `p${Date.now()}`,
      name: newProperty.name,
      address: newProperty.address,
      image: newProperty.image.trim() || fallbackImage
    });
    setShowAddProp(false);
    setNewProperty({ name: '', address: '', image: '' });
  };

  const handleUpdateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProperty) return;
    updateProperty({
      ...editProperty,
      name: editProperty.name.trim(),
      address: editProperty.address.trim(),
      image: editProperty.image?.trim() || `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80`
    });
    setEditProperty(null);
  };

  const handleDeleteProperty = (property: Property) => {
    const propUnits = units.filter(u => u.propertyId === property.id);
    const msg = propUnits.length > 0
      ? `Are you sure you want to delete property "${property.name}"? This will also remove its ${propUnits.length} unit(s) and move active tenants to Previous Tenants.`
      : `Are you sure you want to delete property "${property.name}"?`;
    
    if (confirm(msg)) {
      deleteProperty(property.id);
    }
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddUnit) return;
    const initialReading = Number(newUnit.initialWaterReading) || 0;
    const currentReading = Number(newUnit.currentWaterReading) || initialReading;
    const finalReading = newUnit.finalWaterReading !== '' ? Number(newUnit.finalWaterReading) : undefined;

    addUnit({
      id: `u${Date.now()}`,
      propertyId: showAddUnit,
      name: newUnit.name,
      rentAmount: Number(newUnit.rentAmount),
      depositAmount: Number(newUnit.depositAmount),
      floor: newUnit.floor || 'Ground Floor',
      unitType: newUnit.unitType || '1 Bedroom',
      unitTypeNote: newUnit.unitTypeNote.trim() || undefined,
      utilityNote: newUnit.utilityNote.trim() || undefined,
      waterMeterNumber: newUnit.waterMeterNumber.trim() || undefined,
      initialWaterReading: initialReading,
      initialWaterReadingDate: newUnit.initialWaterReadingDate || format(new Date(), 'yyyy-MM-dd'),
      currentWaterReading: currentReading,
      currentWaterReadingDate: newUnit.currentWaterReadingDate || format(new Date(), 'yyyy-MM-dd'),
      finalWaterReading: finalReading,
      finalWaterReadingDate: finalReading !== undefined ? (newUnit.finalWaterReadingDate || format(new Date(), 'yyyy-MM-dd')) : undefined,
      waterReadingDate: newUnit.currentWaterReadingDate || format(new Date(), 'yyyy-MM-dd'),
      status: UnitStatus.VACANT,
      tenantId: null,
      notes: []
    });
    setShowAddUnit(null);
    setNewUnit({ 
      name: '', 
      rentAmount: 0, 
      depositAmount: 0,
      floor: 'Ground Floor',
      unitType: '1 Bedroom',
      unitTypeNote: '',
      utilityNote: '',
      waterMeterNumber: '',
      initialWaterReading: 0,
      initialWaterReadingDate: format(new Date(), 'yyyy-MM-dd'),
      currentWaterReading: 0,
      currentWaterReadingDate: format(new Date(), 'yyyy-MM-dd'),
      finalWaterReading: '',
      finalWaterReadingDate: ''
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      deleteUnit(unitId);
      if (viewUnit?.id === unitId) setViewUnit(null);
    }
  };

  const openEditModal = (unit: Unit) => {
    setEditUnit(unit);
    const currentTenant = tenants.find(t => t.id === unit.tenantId);
    setTenantSearchTerm(currentTenant ? currentTenant.fullName : '');
    setEditForm({
      name: unit.name,
      rentAmount: unit.rentAmount,
      depositAmount: unit.depositAmount || unit.rentAmount,
      floor: unit.floor || 'Ground Floor',
      unitType: unit.unitType || '1 Bedroom',
      unitTypeNote: unit.unitTypeNote || '',
      utilityNote: unit.utilityNote || '',
      waterMeterNumber: unit.waterMeterNumber || '',
      initialWaterReading: unit.initialWaterReading ?? (unit.previousWaterReading ?? 0),
      initialWaterReadingDate: unit.initialWaterReadingDate || currentTenant?.leaseStart || '',
      currentWaterReading: unit.currentWaterReading ?? (unit.initialWaterReading ?? 0),
      currentWaterReadingDate: unit.currentWaterReadingDate || unit.waterReadingDate || format(new Date(), 'yyyy-MM-dd'),
      finalWaterReading: unit.finalWaterReading !== undefined ? unit.finalWaterReading : '',
      finalWaterReadingDate: unit.finalWaterReadingDate || '',
      status: unit.status,
      tenantId: unit.tenantId || '',
      leaseStart: currentTenant?.leaseStart || '', // Load existing date
      note: ''
    });
  };

  const handleUpdateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUnit) return;

    const initialReading = Number(editForm.initialWaterReading) || 0;
    const currentReading = Number(editForm.currentWaterReading) || initialReading;
    const finalReading = editForm.finalWaterReading !== '' ? Number(editForm.finalWaterReading) : undefined;

    // 1. Update the Unit
    const updated: Unit = {
      ...editUnit,
      name: editForm.name,
      rentAmount: editForm.rentAmount,
      depositAmount: editForm.depositAmount,
      floor: editForm.floor || 'Ground Floor',
      unitType: editForm.unitType || '1 Bedroom',
      unitTypeNote: editForm.unitTypeNote.trim() || undefined,
      utilityNote: editForm.utilityNote.trim() || undefined,
      waterMeterNumber: editForm.waterMeterNumber.trim() || undefined,
      initialWaterReading: initialReading,
      initialWaterReadingDate: editForm.initialWaterReadingDate || undefined,
      currentWaterReading: currentReading,
      currentWaterReadingDate: editForm.currentWaterReadingDate || format(new Date(), 'yyyy-MM-dd'),
      finalWaterReading: finalReading,
      finalWaterReadingDate: finalReading !== undefined ? (editForm.finalWaterReadingDate || format(new Date(), 'yyyy-MM-dd')) : undefined,
      waterReadingDate: editForm.currentWaterReadingDate || format(new Date(), 'yyyy-MM-dd'),
      status: editForm.status,
      tenantId: editForm.tenantId || null,
    };

    updateUnit(updated);
    if (viewUnit?.id === updated.id) {
      setViewUnit(updated);
    }

    // 2. If a tenant is assigned, update their leaseStart (Move-In Date)
    if (editForm.tenantId) {
      const tenantToUpdate = tenants.find(t => t.id === editForm.tenantId);
      if (tenantToUpdate) {
        updateTenant({
          ...tenantToUpdate,
          leaseStart: editForm.leaseStart // Update the date on the tenant object
        });
      }
    }

    // 3. Add note if provided
    if (editForm.note.trim()) {
      addNote(editUnit.id, {
        id: `n${Date.now()}`,
        content: editForm.note,
        createdAt: new Date().toISOString(),
        author: 'Landlord'
      }, 'unit');
    }

    setEditUnit(null);
  };

  const openMeterModal = (unit: Unit) => {
    setMeterModalUnit(unit);
    setNewReadingVal(unit.currentWaterReading !== undefined ? unit.currentWaterReading.toString() : '');
    setNewReadingDate(unit.currentWaterReadingDate || unit.waterReadingDate || format(new Date(), 'yyyy-MM-dd'));
    setFinalReadingVal(unit.finalWaterReading !== undefined ? unit.finalWaterReading.toString() : '');
    setFinalReadingDate(unit.finalWaterReadingDate || format(new Date(), 'yyyy-MM-dd'));
    setIsFinalReadingUpdate(unit.finalWaterReading !== undefined);
    setShowMeterUpdateModal(true);
  };

  // Quick Meter Reading Update Save Handler
  const handleSaveMeterReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meterModalUnit) return;
    const newReading = parseFloat(newReadingVal);
    if (isNaN(newReading)) return;

    const finalVal = finalReadingVal !== '' ? parseFloat(finalReadingVal) : undefined;

    const updatedUnit: Unit = {
      ...meterModalUnit,
      currentWaterReading: newReading,
      currentWaterReadingDate: newReadingDate,
      waterReadingDate: newReadingDate,
      finalWaterReading: isFinalReadingUpdate && finalVal !== undefined && !isNaN(finalVal) ? finalVal : meterModalUnit.finalWaterReading,
      finalWaterReadingDate: isFinalReadingUpdate && finalVal !== undefined && !isNaN(finalVal) ? finalReadingDate : meterModalUnit.finalWaterReadingDate,
    };

    updateUnit(updatedUnit);
    if (viewUnit?.id === updatedUnit.id) {
      setViewUnit(updatedUnit);
    }
    setMeterModalUnit(null);
    setNewReadingVal('');
    setFinalReadingVal('');
    setIsFinalReadingUpdate(false);
    setShowMeterUpdateModal(false);
  };

  const getWaterDetails = (unit: Unit) => {
    const initial = unit.initialWaterReading ?? (unit.previousWaterReading ?? 0);
    const initialDate = unit.initialWaterReadingDate ? format(new Date(unit.initialWaterReadingDate), 'MMM d, yyyy') : null;
    const current = unit.currentWaterReading ?? initial;
    const currentDate = (unit.currentWaterReadingDate || unit.waterReadingDate)
      ? format(new Date(unit.currentWaterReadingDate || unit.waterReadingDate!), 'MMM d, yyyy')
      : 'No Date';
    const final = unit.finalWaterReading;
    const finalDate = unit.finalWaterReadingDate ? format(new Date(unit.finalWaterReadingDate), 'MMM d, yyyy') : null;

    const baseMeasure = final !== undefined && final !== null ? final : current;
    const consumption = Math.max(0, baseMeasure - initial);
    const meterNum = unit.waterMeterNumber || 'Not Specified';

    return {
      meterNum,
      initial,
      initialDate,
      current,
      currentDate,
      final,
      finalDate,
      consumption: Number(consumption.toFixed(2))
    };
  };

  const getWaterBillWhatsAppUrl = (unit: Unit, tenant?: Tenant) => {
    if (!tenant || !tenant.phone) return null;
    const water = getWaterDetails(unit);
    let message = `Hello ${tenant.fullName}, here is the Water Utility & Meter Reading record for ${unit.name} (${unit.floor || 'Ground Floor'}):
- Meter No: ${water.meterNum}
- Initial Reading (Move-In): ${water.initial} m³${water.initialDate ? ` (${water.initialDate})` : ''}
- Current Reading: ${water.current} m³ (Read on: ${water.currentDate})
- Water Consumed: ${water.consumption} m³`;

    if (water.final !== undefined && water.final !== null) {
      message += `\n- Final Reading (Move-Out): ${water.final} m³${water.finalDate ? ` (${water.finalDate})` : ''}`;
    }

    if (unit.utilityNote) {
      message += `\n- Additional Note: ${unit.utilityNote}`;
    }

    const cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getUnitsForProperty = (pid: string) => units.filter(u => u.propertyId === pid);
  
  const getTenantForUnit = (unitId: string) => tenants.find(t => t.unitId === unitId);

  const getDepositDetails = (unit: Unit) => {
    const required = unit.depositAmount || 0;
    
    // Sum all completed deposit payments for this unit and CURRENT tenant
    const paid = payments
      .filter(p => p.unitId === unit.id && (!unit.tenantId || p.tenantId === unit.tenantId) && p.type === 'Deposit' && p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const balance = Math.max(0, required - paid);
    
    let status: 'Fully Paid' | 'Partially Paid' | 'Not Paid' | 'No Deposit Set';
    let colorClass;
    
    if (required === 0) {
      status = 'No Deposit Set';
      colorClass = 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    } else if (paid >= required) {
      status = 'Fully Paid';
      colorClass = 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    } else if (paid > 0) {
      status = 'Partially Paid';
      colorClass = 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
    } else {
      status = 'Not Paid';
      colorClass = 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
    }

    return { required, paid, balance, status, colorClass };
  };

  const getStatusColor = (status: UnitStatus) => {
    switch (status) {
      case UnitStatus.OCCUPIED: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case UnitStatus.VACANT: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case UnitStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  // Filter tenants for searchable dropdown (Only Active Tenants)
  const filteredTenants = tenants.filter(t => 
    t.status === 'Active' &&
    t.fullName.toLowerCase().includes(tenantSearchTerm.toLowerCase())
  );

  const handleTenantSelect = (tenant: Tenant) => {
    setEditForm(prev => ({
      ...prev,
      tenantId: tenant.id,
      status: UnitStatus.OCCUPIED, // Auto-set to Occupied
      leaseStart: tenant.leaseStart || format(new Date(), 'yyyy-MM-dd') // Default to existing or today
    }));
    setTenantSearchTerm(tenant.fullName);
    setIsTenantDropdownOpen(false);
  };

  const handleTenantClear = () => {
     setEditForm(prev => ({
      ...prev,
      tenantId: null,
      status: UnitStatus.VACANT, // Auto-set to Vacant
      leaseStart: ''
    }));
    setTenantSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Properties</h1>
        <button onClick={() => setShowAddProp(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map(property => {
          const propUnits = getUnitsForProperty(property.id);
          const occupiedCount = propUnits.filter(u => u.status === UnitStatus.OCCUPIED).length;

          return (
            <div key={property.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="h-36 overflow-hidden relative group">
                <img src={property.image} alt={property.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => setEditProperty({ ...property })}
                    className="p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs transition-colors shadow-xs"
                    title="Edit Property (Name, Address, Picture)"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property)}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs transition-colors shadow-xs"
                    title="Delete Property"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{property.name}</h2>
                    <p className="text-sm flex items-center gap-1 opacity-90"><MapPin size={14} /> {property.address}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {occupiedCount} / {propUnits.length} Units Occupied
                    </span>
                    <span className="text-xs text-gray-400 ml-1.5 font-medium">
                      ({Math.round(propUnits.length > 0 ? (occupiedCount / propUnits.length) * 100 : 0)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGroupByFloorByProperty(prev => ({
                        ...prev,
                        [property.id]: !(prev[property.id] ?? true)
                      }))}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors font-medium"
                      title="Toggle Floor Grouping View"
                    >
                      <Layers size={13} className="text-blue-500" />
                      {(groupByFloorByProperty[property.id] ?? true) ? 'Grouped by Floor' : 'Flat List'}
                    </button>
                    <button onClick={() => setShowAddUnit(property.id)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs transition-colors font-medium">
                      <Plus size={14} /> Add Unit
                    </button>
                  </div>
                </div>

                {/* Floor Filter Tabs */}
                {(() => {
                  const uniqueFloors = Array.from(new Set(propUnits.map(u => u.floor || 'Ground Floor'))).sort();
                  const selectedFloor = selectedFloorByProperty[property.id] || 'All';
                  if (uniqueFloors.length <= 1) return null;

                  return (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      <button
                        onClick={() => setSelectedFloorByProperty(prev => ({ ...prev, [property.id]: 'All' }))}
                        className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors text-[11px] ${
                          selectedFloor === 'All'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        All Floors ({propUnits.length})
                      </button>
                      {uniqueFloors.map(floor => {
                        const count = propUnits.filter(u => (u.floor || 'Ground Floor') === floor).length;
                        return (
                          <button
                            key={floor}
                            onClick={() => setSelectedFloorByProperty(prev => ({ ...prev, [property.id]: floor }))}
                            className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors text-[11px] ${
                              selectedFloor === floor
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {floor} ({count})
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Units List (Grouped or Flat) */}
                {(() => {
                  const selectedFloor = selectedFloorByProperty[property.id] || 'All';
                  const displayedUnits = selectedFloor === 'All'
                    ? propUnits
                    : propUnits.filter(u => (u.floor || 'Ground Floor') === selectedFloor);

                  const isGrouped = (groupByFloorByProperty[property.id] ?? true) && selectedFloor === 'All';

                  if (displayedUnits.length === 0) {
                    return <p className="text-sm text-gray-400 text-center py-6">No units added yet.</p>;
                  }

                  const renderUnitRow = (unit: Unit) => {
                    const water = getWaterDetails(unit);
                    return (
                      <div key={unit.id} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg group hover:bg-blue-50/40 dark:hover:bg-gray-700/60 transition-colors border border-gray-100/80 dark:border-gray-700/50">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-white dark:bg-gray-800 rounded-md shadow-2xs text-gray-400">
                            <Home size={15} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-gray-800 dark:text-gray-100 text-xs sm:text-sm">{unit.name}</p>
                              {unit.floor && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                  {unit.floor}
                                </span>
                              )}
                              {unit.unitType && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                  {unit.unitType}{unit.unitTypeNote ? ` • ${unit.unitTypeNote}` : ''}
                                </span>
                              )}
                              {unit.waterMeterNumber && (
                                <span 
                                  className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 flex items-center gap-0.5 cursor-pointer hover:bg-cyan-100 transition-colors" 
                                  title={`Meter #${unit.waterMeterNumber} | Current: ${water.current} m³ (${water.currentDate}) | Initial: ${water.initial} m³ | Consumed: ${water.consumption} m³`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMeterModal(unit);
                                  }}
                                >
                                  <Droplets size={10} /> {water.current} m³
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>Rent: <strong className="text-gray-700 dark:text-gray-300">Ksh {unit.rentAmount.toLocaleString()}</strong></span>
                              {unit.waterMeterNumber && (
                                <span className="text-cyan-600 dark:text-cyan-400 font-medium">💧 {water.consumption} m³ consumed</span>
                              )}
                              {unit.utilityNote && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium truncate max-w-[220px]" title={unit.utilityNote}>
                                  📌 {unit.utilityNote}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(unit.status)}`}>
                            {unit.status}
                          </span>
                          <div className="flex gap-0.5">
                            <button 
                              onClick={() => setViewUnit(unit)}
                              className="p-1 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
                              title="View Details & Water Utility"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={() => openEditModal(unit)}
                              className="p-1 text-gray-400 hover:text-green-500 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
                              title="Edit Unit"
                            >
                              <Edit size={15} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUnit(unit.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
                              title="Delete Unit"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  if (isGrouped) {
                    const floorsMap: { [floor: string]: Unit[] } = {};
                    displayedUnits.forEach(u => {
                      const f = u.floor || 'Ground Floor';
                      if (!floorsMap[f]) floorsMap[f] = [];
                      floorsMap[f].push(u);
                    });

                    return (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {Object.entries(floorsMap).map(([floorName, floorUnits]) => (
                          <div key={floorName} className="space-y-1.5">
                            {/* Visual Floor Divider Header */}
                            <div className="flex items-center justify-between py-1 px-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/20 dark:from-blue-900/30 dark:to-transparent rounded border-l-4 border-blue-600">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                                <Layers size={13} className="text-blue-600" />
                                <span>{floorName}</span>
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                {floorUnits.length} {floorUnits.length === 1 ? 'unit' : 'units'}
                              </span>
                            </div>
                            <div className="space-y-1.5 pl-1">
                              {floorUnits.map(unit => renderUnitRow(unit))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {displayedUnits.map(unit => renderUnitRow(unit))}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Property Modal */}
      {showAddProp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Home className="text-blue-600" size={20} /> Add New Property
            </h3>
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Name *</label>
                <input required placeholder="e.g. Sunset Apartments" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={newProperty.name} onChange={e => setNewProperty({...newProperty, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input required placeholder="e.g. 123 Main St, Westlands" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={newProperty.address} onChange={e => setNewProperty({...newProperty, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Image URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://images.unsplash.com/... or leave empty for auto image" 
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" 
                  value={newProperty.image} 
                  onChange={e => setNewProperty({...newProperty, image: e.target.value})} 
                />
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-gray-500">Sample presets:</span>
                  <button 
                    type="button" 
                    onClick={() => setNewProperty({...newProperty, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'})}
                    className="text-xs text-blue-600 hover:underline"
                  >Modern</button>
                  <button 
                    type="button" 
                    onClick={() => setNewProperty({...newProperty, image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80'})}
                    className="text-xs text-blue-600 hover:underline"
                  >Villa</button>
                  <button 
                    type="button" 
                    onClick={() => setNewProperty({...newProperty, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'})}
                    className="text-xs text-blue-600 hover:underline"
                  >Apartments</button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowAddProp(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Property</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Edit className="text-blue-600" size={20} /> Edit Property
            </h3>
            <form onSubmit={handleUpdateProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Name *</label>
                <input 
                  required 
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={editProperty.name} 
                  onChange={e => setEditProperty({...editProperty, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input 
                  required 
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                  value={editProperty.address} 
                  onChange={e => setEditProperty({...editProperty, address: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Picture URL</label>
                <input 
                  type="url"
                  placeholder="https://..." 
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm" 
                  value={editProperty.image || ''} 
                  onChange={e => setEditProperty({...editProperty, image: e.target.value})} 
                />
                {/* Live Preview */}
                {editProperty.image && (
                  <div className="mt-2 h-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                    <img 
                      src={editProperty.image} 
                      alt="Property preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Picture Preview</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-gray-500">Presets:</span>
                  <button 
                    type="button" 
                    onClick={() => setEditProperty({...editProperty, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'})}
                    className="text-xs text-blue-600 hover:underline"
                  >Modern</button>
                  <button 
                    type="button" 
                    onClick={() => setEditProperty({...editProperty, image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80'})}
                    className="text-xs text-blue-600 hover:underline"
                  >Villa</button>
                  <button 
                    type="button" 
                    onClick={() => setEditProperty({...editProperty, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'})}
                    className="text-xs text-blue-600 hover:underline"
                  >Apartments</button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setEditProperty(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Home className="text-blue-600" size={20} /> Add New Unit
            </h3>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Name / Number *</label>
                  <input required placeholder="e.g. Apt 101" className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    value={newUnit.name} onChange={e => setNewUnit({...newUnit, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor Level *</label>
                  <select
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newUnit.floor}
                    onChange={e => setNewUnit({...newUnit, floor: e.target.value})}
                  >
                    {PRESET_FLOORS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Type *</label>
                  <select
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newUnit.unitType}
                    onChange={e => setNewUnit({...newUnit, unitType: e.target.value})}
                  >
                    {PRESET_UNIT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Type / Descriptor (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Big room, Master Ensuite"
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newUnit.unitTypeNote}
                    onChange={e => setNewUnit({...newUnit, unitTypeNote: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Complements chosen type without affecting your selection</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Note / Terms (Optional)
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Water deposit is 1000", "No pets allowed", etc.'
                  className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={newUnit.utilityNote}
                  onChange={e => setNewUnit({...newUnit, utilityNote: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent Amount (Ksh) *</label>
                  <input 
                    required 
                    type="text" 
                    inputMode="numeric"
                    placeholder="e.g. 15,000" 
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    value={newUnit.rentAmount === 0 ? '' : newUnit.rentAmount.toLocaleString()} 
                    onChange={e => {
                      const value = e.target.value.replace(/,/g, '');
                      if (!isNaN(Number(value))) {
                          setNewUnit({...newUnit, rentAmount: Number(value)});
                      }
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit Requirement (Ksh) *</label>
                  <input 
                    required 
                    type="text" 
                    inputMode="numeric"
                    placeholder="e.g. 15,000" 
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    value={newUnit.depositAmount === 0 ? '' : newUnit.depositAmount.toLocaleString()} 
                    onChange={e => {
                      const value = e.target.value.replace(/,/g, '');
                      if (!isNaN(Number(value))) {
                          setNewUnit({...newUnit, depositAmount: Number(value)});
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Water Utility & Meter Setup (Without Tariff) */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  <Droplets size={14} className="text-cyan-600" />
                  <span>Water Utility & Meter Setup</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Water Meter Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. WM-101"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={newUnit.waterMeterNumber}
                      onChange={e => setNewUnit({...newUnit, waterMeterNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Reading Date (Move-In)</label>
                    <input 
                      type="date"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                      value={newUnit.initialWaterReadingDate}
                      onChange={e => setNewUnit({...newUnit, initialWaterReadingDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Reading when tenant enters (m³)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={newUnit.initialWaterReading || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setNewUnit({
                          ...newUnit, 
                          initialWaterReading: val,
                          currentWaterReading: newUnit.currentWaterReading === 0 ? val : newUnit.currentWaterReading
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Reading (Can be changed anytime) (m³)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={newUnit.currentWaterReading || ''}
                      onChange={e => setNewUnit({...newUnit, currentWaterReading: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Current Reading was Taken *</label>
                    <input 
                      type="date"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                      value={newUnit.currentWaterReadingDate}
                      onChange={e => setNewUnit({...newUnit, currentWaterReadingDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Final Reading when tenant leaves (m³, Optional)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="Recorded upon move out"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={newUnit.finalWaterReading || ''}
                      onChange={e => setNewUnit({...newUnit, finalWaterReading: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
                <button type="button" onClick={() => setShowAddUnit(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs">Add Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {editUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
              <Edit size={20} className="text-blue-500"/> Edit Unit
            </h3>
            <form onSubmit={handleUpdateUnit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Name *</label>
                  <input required className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor Level *</label>
                  <select
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={editForm.floor}
                    onChange={e => setEditForm({...editForm, floor: e.target.value})}
                  >
                    {PRESET_FLOORS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Type *</label>
                  <select
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={editForm.unitType}
                    onChange={e => setEditForm({...editForm, unitType: e.target.value})}
                  >
                    {PRESET_UNIT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Type / Descriptor (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Big room, Master Ensuite"
                    className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={editForm.unitTypeNote}
                    onChange={e => setEditForm({...editForm, unitTypeNote: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Complements chosen type without affecting your selection</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Note / Terms (Optional)
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Water deposit is 1000", "No pets allowed", etc.'
                  className="w-full p-2 text-sm border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={editForm.utilityNote}
                  onChange={e => setEditForm({...editForm, utilityNote: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent (Ksh)</label>
                  <input 
                    required 
                    type="text" 
                    inputMode="numeric"
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    value={editForm.rentAmount === 0 ? '' : editForm.rentAmount.toLocaleString()} 
                    onChange={e => {
                        const value = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(value))) {
                            setEditForm({...editForm, rentAmount: Number(value)});
                        }
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit (Ksh)</label>
                  <input 
                    required 
                    type="text" 
                    inputMode="numeric"
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    value={editForm.depositAmount === 0 ? '' : editForm.depositAmount.toLocaleString()} 
                    onChange={e => {
                        const value = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(value))) {
                            setEditForm({...editForm, depositAmount: Number(value)});
                        }
                    }} 
                  />
                </div>
              </div>

              {/* Water Utility & Meter Setup (Without Tariff) */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  <Droplets size={14} className="text-cyan-600" />
                  <span>Water Utility & Meter Setup</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Water Meter Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. WM-101"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={editForm.waterMeterNumber}
                      onChange={e => setEditForm({...editForm, waterMeterNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Reading Date (Move-In)</label>
                    <input 
                      type="date"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                      value={editForm.initialWaterReadingDate}
                      onChange={e => setEditForm({...editForm, initialWaterReadingDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Reading when tenant enters (m³)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={editForm.initialWaterReading || ''}
                      onChange={e => setEditForm({...editForm, initialWaterReading: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Reading (Can be changed anytime) (m³)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={editForm.currentWaterReading || ''}
                      onChange={e => setEditForm({...editForm, currentWaterReading: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Current Reading was Taken *</label>
                    <input 
                      type="date"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                      value={editForm.currentWaterReadingDate}
                      onChange={e => setEditForm({...editForm, currentWaterReadingDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Final Reading when tenant leaves (m³, Optional)</label>
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="Recorded on move out"
                      className="w-full p-2 text-xs border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={editForm.finalWaterReading || ''}
                      onChange={e => setEditForm({...editForm, finalWaterReading: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as UnitStatus})}>
                  <option value={UnitStatus.OCCUPIED}>Occupied</option>
                  <option value={UnitStatus.VACANT}>Vacant</option>
                  <option value={UnitStatus.MAINTENANCE}>Maintenance</option>
                </select>
              </div>

              {/* Searchable Tenant Dropdown */}
              <div className="relative" ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Tenant</label>
                <div className="relative">
                  <div className="flex">
                    <div className="relative flex-1">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                       <input 
                         type="text"
                         className="w-full pl-9 pr-4 p-2 border border-gray-300 rounded-l bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                         placeholder="Search tenant..."
                         value={tenantSearchTerm}
                         onChange={(e) => {
                           setTenantSearchTerm(e.target.value);
                           setIsTenantDropdownOpen(true);
                         }}
                         onFocus={() => setIsTenantDropdownOpen(true)}
                       />
                    </div>
                    <button 
                      type="button"
                      onClick={handleTenantClear}
                      className="px-3 bg-gray-100 dark:bg-gray-600 border-y border-r border-gray-300 dark:border-gray-600 rounded-r hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-200"
                      title="Clear Tenant"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Dropdown Results */}
                  {isTenantDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto">
                      {filteredTenants.length > 0 ? (
                        filteredTenants.map(t => (
                          <div 
                            key={t.id}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-gray-800 dark:text-gray-200 text-sm"
                            onClick={() => handleTenantSelect(t)}
                          >
                            {t.fullName}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 text-sm">No active tenants found.</div>
                      )}
                      <div 
                        className="p-2 border-t dark:border-gray-600 text-blue-600 cursor-pointer text-xs hover:underline bg-gray-50 dark:bg-gray-700"
                        onClick={() => handleTenantSelect({ id: '', fullName: 'No Tenant' } as any)} 
                      >
                        Select None
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selecting a tenant will set status to 'Occupied'. Clearing will set to 'Vacant'.</p>
              </div>

              {/* Move In Date - Only visible if tenant selected */}
              {editForm.tenantId && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Move-In Date / Lease Start</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                    value={editForm.leaseStart}
                    onChange={e => setEditForm({...editForm, leaseStart: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">This updates the assigned tenant's record.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add a Note</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  rows={3}
                  placeholder="Maintenance needed, inspection done, etc..."
                  value={editForm.note}
                  onChange={e => setEditForm({...editForm, note: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setEditUnit(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Unit Details Modal */}
      {viewUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                  <Home size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {viewUnit.name}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 flex items-center gap-1">
                      <Layers size={12} /> {viewUnit.floor || 'Ground Floor'}
                    </span>
                    {viewUnit.unitType && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                        {viewUnit.unitType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Unit Details, Floor & Water Utility Tracking
                  </p>
                </div>
              </div>
              <button onClick={() => setViewUnit(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1">
                <X size={22} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Unit Info & Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Floor Level</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                        <Layers size={14} className="text-blue-500" /> {viewUnit.floor || 'Ground Floor'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Unit Type</p>
                      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {viewUnit.unitType || 'Not specified'}
                        {viewUnit.unitTypeNote ? ` • ${viewUnit.unitTypeNote}` : ''}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(viewUnit.status)}`}>
                        {viewUnit.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t dark:border-gray-600/60">
                     <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Monthly Rent</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">Ksh {viewUnit.rentAmount.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Deposit Requirement</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">Ksh {(viewUnit.depositAmount || 0).toLocaleString()}</p>
                     </div>
                  </div>
                </div>

                {/* Deposit Status Card */}
                {(() => {
                  const { status, paid, balance, colorClass } = getDepositDetails(viewUnit);
                  return (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Security Deposit Status</p>
                        <div className={`flex items-center gap-2.5 p-3 rounded-lg ${colorClass}`}>
                           {status === 'Fully Paid' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                           <div>
                             <p className="font-bold text-sm">{status}</p>
                             {status === 'Fully Paid' && <p className="text-xs">Paid in Full: Ksh {paid.toLocaleString()}</p>}
                             {status === 'Partially Paid' && <p className="text-xs">Paid: Ksh {paid.toLocaleString()} • Bal: Ksh {balance.toLocaleString()}</p>}
                             {status === 'Not Paid' && <p className="text-xs">Balance Due: Ksh {balance.toLocaleString()}</p>}
                           </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">Required prior to occupancy</p>
                    </div>
                  );
                })()}
              </div>

              {/* Additional Note / Terms Display (e.g. "Water deposit is 1000") */}
              {viewUnit.utilityNote && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                  <FileText size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Additional Note / Terms</p>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-0.5">{viewUnit.utilityNote}</p>
                  </div>
                </div>
              )}

              {/* Water Utility & Meter Setup (Without Tariff) */}
              {(() => {
                const water = getWaterDetails(viewUnit);
                const tenant = getTenantForUnit(viewUnit.id);
                const whatsappUrl = getWaterBillWhatsAppUrl(viewUnit, tenant);

                return (
                  <div className="p-5 bg-gradient-to-br from-cyan-50/70 via-blue-50/40 to-indigo-50/30 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-cyan-200/70 dark:border-cyan-800/50 shadow-xs space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-600 text-white rounded-lg shadow-2xs">
                          <Droplets size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">Water Utility & Meter Setup</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Meter #{water.meterNum} • Recorded Readings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openMeterModal(viewUnit)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw size={13} /> Update Reading
                        </button>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Share water meter readings with tenant via WhatsApp"
                          >
                            <Send size={13} /> Share Record
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* 1. Initial Reading when tenant enters */}
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">1. Initial (Move-In)</span>
                        <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                          {water.initial} <span className="text-xs font-normal text-gray-400">m³</span>
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Date: {water.initialDate || 'When tenant entered'}
                        </p>
                      </div>

                      {/* 2. Current Reading that can be changed anytime & date read */}
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">2. Current Reading</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 font-medium">Editable</span>
                        </div>
                        <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                          {water.current} <span className="text-xs font-normal text-gray-400">m³</span>
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Date Read: <strong className="text-gray-700 dark:text-gray-300">{water.currentDate}</strong>
                        </p>
                      </div>

                      {/* 3. Final Reading when tenant leaves */}
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">3. Final (Move-Out)</span>
                        <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                          {water.final !== undefined && water.final !== null ? `${water.final} m³` : <span className="text-xs text-gray-400 font-normal italic">Pending Move-Out</span>}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Date: {water.finalDate || 'When tenant leaves'}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-100/60 dark:bg-blue-900/30 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-blue-900 dark:text-blue-200 font-medium flex items-center gap-1.5">
                        <Droplets size={14} className="text-cyan-600" />
                        Net Water Consumed by Tenant:
                      </span>
                      <strong className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                        {water.consumption} m³
                      </strong>
                    </div>
                  </div>
                );
              })()}

              {/* Tenant Info */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} /> Current Tenant
              </h3>
              
              {getTenantForUnit(viewUnit.id) ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-5 space-y-4">
                  {(() => {
                    const tenant = getTenantForUnit(viewUnit.id)!;
                    return (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{tenant.fullName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">ID: {tenant.idNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Occupants</p>
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.occupants}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Mail size={16} className="text-blue-500" />
                            {tenant.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Phone size={16} className="text-blue-500" />
                            {tenant.phone}
                          </div>
                          {/* Move-In Date Display */}
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Clock size={16} className="text-blue-500" />
                              <span>Move-In Date: <span className="font-medium">{tenant.leaseStart ? format(new Date(tenant.leaseStart), 'MMM d, yyyy') : 'Not set'}</span></span>
                          </div>
                          {tenant.leaseEnd && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Calendar size={16} className="text-blue-500" />
                              <span>Lease Ends: <span className="font-medium">{format(new Date(tenant.leaseEnd), 'MMM d, yyyy')}</span></span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <User size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No tenant assigned to this unit.</p>
                </div>
              )}

              {/* Notes Section */}
               <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FileText size={20} /> Unit Notes
                  </h3>
                  <div className="space-y-3">
                    {viewUnit.notes && viewUnit.notes.length > 0 ? (
                      viewUnit.notes.map(note => (
                        <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                           <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                           <p className="text-xs text-gray-400 mt-1 flex justify-between">
                             <span>{format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}</span>
                             <span>by {note.author}</span>
                           </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No notes for this unit.</p>
                    )}
                  </div>
               </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center gap-3">
              <button 
                onClick={() => handleDeleteUnit(viewUnit.id)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
                title="Permanently remove this unit"
              >
                <Trash2 size={16} /> Delete Unit
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const u = viewUnit;
                    setViewUnit(null);
                    openEditModal(u);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-xs"
                >
                  Edit Unit
                </button>
                <button 
                  onClick={() => setViewUnit(null)} 
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Water Meter Reading Update Modal (Without Tariff) */}
      {showMeterUpdateModal && meterModalUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Droplets size={20} className="text-cyan-200" />
                <h3 className="font-bold text-base">Update Water Meter Reading</h3>
              </div>
              <button 
                onClick={() => {
                  setShowMeterUpdateModal(false);
                  setMeterModalUnit(null);
                }}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMeterReading} className="p-5 space-y-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg border border-cyan-100 dark:border-cyan-900/40 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Unit:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{meterModalUnit.name} • {meterModalUnit.floor || 'Ground Floor'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Meter Number:</span>
                  <span className="font-semibold text-cyan-700 dark:text-cyan-300">{meterModalUnit.waterMeterNumber || 'Not Set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Initial Reading (Move-In):</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {meterModalUnit.initialWaterReading ?? 0} m³ {meterModalUnit.initialWaterReadingDate ? `(${format(new Date(meterModalUnit.initialWaterReadingDate), 'MMM d, yyyy')})` : ''}
                  </span>
                </div>
                {meterModalUnit.utilityNote && (
                  <div className="flex justify-between pt-1 border-t border-cyan-200/50 dark:border-cyan-800/50 text-[11px]">
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Note:</span>
                    <span className="text-amber-800 dark:text-amber-200">{meterModalUnit.utilityNote}</span>
                  </div>
                )}
              </div>

              {/* Current Reading (Can be changed anytime) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Reading (m³) * <span className="text-gray-400 font-normal">(can be changed anytime)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 142.5"
                  className="w-full p-2.5 text-base font-bold border border-cyan-300 dark:border-cyan-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  value={newReadingVal}
                  onChange={e => setNewReadingVal(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Current Reading was Read *
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  value={newReadingDate}
                  onChange={e => setNewReadingDate(e.target.value)}
                />
              </div>

              {/* Final Reading when tenant leaves (Optional) */}
              <div className="pt-2 border-t dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Final Reading when tenant leaves (Move-Out)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFinalReadingUpdate(!isFinalReadingUpdate)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {isFinalReadingUpdate ? 'Remove Final' : '+ Record Final'}
                  </button>
                </div>

                {isFinalReadingUpdate && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/40">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">Final Reading (m³)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 155.0"
                        className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={finalReadingVal}
                        onChange={e => setFinalReadingVal(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">Date Tenant Left</label>
                      <input
                        type="date"
                        className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                        value={finalReadingDate}
                        onChange={e => setFinalReadingDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Live Consumption Preview */}
              {(() => {
                const initial = meterModalUnit.initialWaterReading ?? 0;
                const curr = parseFloat(newReadingVal) || initial;
                const cons = Math.max(0, curr - initial);

                return (
                  <div className="p-3 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-lg border border-cyan-100 dark:border-cyan-900/40 flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-300">Total Net Consumed:</span>
                    <strong className="text-cyan-700 dark:text-cyan-300 text-sm font-bold">{cons.toFixed(2)} m³</strong>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowMeterUpdateModal(false);
                    setMeterModalUnit(null);
                  }}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Meter Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
