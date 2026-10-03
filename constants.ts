import { Property, Unit, Tenant, Payment, UnitStatus, MaintenanceTicket, Expense } from './types';

export const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', name: 'Sunset Apartments', address: '124 Sunset Blvd, CA', image: 'https://picsum.photos/400/300?random=1' },
  { id: 'p2', name: 'Highland Heights', address: '89 Highland Ave, NY', image: 'https://picsum.photos/400/300?random=2' },
];

export const MOCK_UNITS: Unit[] = [
  { 
    id: 'u1', 
    propertyId: 'p1', 
    name: 'Apt 101', 
    floor: 'Ground Floor',
    unitType: '2 Bedroom',
    unitTypeNote: 'Big Master Bedroom with Balcony',
    utilityNote: 'Water deposit is Ksh 1,000 paid upon entry',
    rentAmount: 15000, 
    depositAmount: 15000, 
    status: UnitStatus.OCCUPIED, 
    tenantId: 't1', 
    waterMeterNumber: 'WM-101-G',
    initialWaterReading: 124.5,
    initialWaterReadingDate: '2023-01-01',
    currentWaterReading: 138.2,
    currentWaterReadingDate: '2023-11-25',
    waterReadingDate: '2023-11-25',
    notes: [] 
  },
  { 
    id: 'u2', 
    propertyId: 'p1', 
    name: 'Apt 102', 
    floor: 'Ground Floor',
    unitType: 'Single Room',
    unitTypeNote: 'Big room with kitchenette',
    utilityNote: 'Water deposit is 1000',
    rentAmount: 8500, 
    depositAmount: 8500, 
    status: UnitStatus.VACANT, 
    tenantId: null, 
    waterMeterNumber: 'WM-102-G',
    initialWaterReading: 89.0,
    initialWaterReadingDate: '2023-10-01',
    currentWaterReading: 89.0,
    currentWaterReadingDate: '2023-11-20',
    waterReadingDate: '2023-11-20',
    notes: [] 
  },
  { 
    id: 'u3', 
    propertyId: 'p1', 
    name: 'Apt 201', 
    floor: '1st Floor',
    unitType: '3 Bedroom',
    unitTypeNote: 'Spacious family unit',
    utilityNote: 'Water deposit is 1500',
    rentAmount: 18000, 
    depositAmount: 18000, 
    status: UnitStatus.MAINTENANCE, 
    tenantId: null, 
    waterMeterNumber: 'WM-201-F1',
    initialWaterReading: 210.0,
    initialWaterReadingDate: '2023-05-10',
    currentWaterReading: 215.3,
    currentWaterReadingDate: '2023-11-18',
    finalWaterReading: 215.3,
    finalWaterReadingDate: '2023-11-18',
    waterReadingDate: '2023-11-18',
    notes: [] 
  },
  { 
    id: 'u4', 
    propertyId: 'p2', 
    name: 'Unit A', 
    floor: '1st Floor',
    unitType: '2 Bedroom',
    unitTypeNote: 'Master Ensuite with large wardrobes',
    utilityNote: 'Water deposit is 1000',
    rentAmount: 25000, 
    depositAmount: 30000, 
    status: UnitStatus.OCCUPIED, 
    tenantId: 't2', 
    waterMeterNumber: 'WM-H1-A',
    initialWaterReading: 340.2,
    initialWaterReadingDate: '2023-02-15',
    currentWaterReading: 356.8,
    currentWaterReadingDate: '2023-11-28',
    waterReadingDate: '2023-11-28',
    notes: [] 
  },
  { 
    id: 'u5', 
    propertyId: 'p2', 
    name: 'Unit B', 
    floor: '2nd Floor',
    unitType: 'Penthouse',
    unitTypeNote: 'Rooftop terrace view',
    utilityNote: 'Water deposit is 2000',
    rentAmount: 28000, 
    depositAmount: 28000, 
    status: UnitStatus.VACANT, 
    tenantId: null, 
    waterMeterNumber: 'WM-H2-B',
    initialWaterReading: 180.0,
    initialWaterReadingDate: '2023-04-01',
    currentWaterReading: 180.0,
    currentWaterReadingDate: '2023-11-15',
    waterReadingDate: '2023-11-15',
    notes: [] 
  },
];

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254 700 000101',
    idNumber: 'ID987654321',
    leaseStart: '2023-01-01',
    leaseEnd: '2024-01-01',
    occupants: 2,
    unitId: 'u1',
    status: 'Active',
    paidUntil: '2023-11-30', // Paid up until end of Nov
    notes: [
      { id: 'n1', content: 'Tenant requested heater repair.', createdAt: '2023-11-15T10:00:00Z', author: 'Admin' }
    ]
  },
  {
    id: 't2',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+254 700 000202',
    idNumber: 'ID123456789',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-06-01',
    occupants: 1,
    unitId: 'u4',
    status: 'Active',
    paidUntil: '2023-10-31', // Paid up until end of Oct
    notes: []
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', tenantId: 't1', unitId: 'u1', amount: 15000, date: '2023-10-01', method: 'Bank Transfer', type: 'Rent', status: 'Completed' },
  { id: 'pay2', tenantId: 't1', unitId: 'u1', amount: 15000, date: '2023-11-01', method: 'Bank Transfer', type: 'Rent', status: 'Completed' },
  { id: 'pay3', tenantId: 't2', unitId: 'u4', amount: 25000, date: '2023-10-05', method: 'Card', type: 'Deposit', status: 'Completed' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', propertyId: 'p1', category: 'Maintenance', amount: 5000, date: '2023-10-10', description: 'Plumbing repair Apt 101' },
  { id: 'e2', propertyId: 'p1', category: 'Utilities', amount: 2500, date: '2023-10-28', description: 'Common area electricity' },
  { id: 'e3', propertyId: 'p2', category: 'Maintenance', amount: 12000, date: '2023-11-05', description: 'Roof leak repair' },
  { id: 'e4', propertyId: 'p2', category: 'Tax', amount: 8000, date: '2023-11-15', description: 'Property Tax Installment' },
  { id: 'e5', propertyId: 'p1', category: 'Other', amount: 1500, date: '2023-11-20', description: 'Cleaning supplies' },
];

export const MOCK_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 'm1',
    propertyId: 'p1',
    unitId: 'u3',
    tenantId: undefined,
    title: 'Water pipe leak in kitchen',
    description: 'Under-sink copper pipe joint leaking during high pressure. Requires replacement washer and pipe seal.',
    category: 'Plumbing',
    priority: 'High',
    status: 'In Progress',
    estimatedCost: 4500,
    actualCost: 0,
    reportedDate: '2023-11-18',
    scheduledDate: '2023-11-20',
    contractorName: 'Apex Plumbing Services',
    contractorPhone: '+254 722 110022',
    convertedToExpense: false,
    notes: [
      { id: 'mn1', content: 'Technician inspected unit and ordered replacement copper valve.', createdAt: '2023-11-18T14:30:00Z', author: 'Caretaker' }
    ]
  },
  {
    id: 'm2',
    propertyId: 'p1',
    unitId: 'u1',
    tenantId: 't1',
    title: 'Faulty bathroom exhaust fan',
    description: 'Exhaust fan making loud screeching motor noise. Tenant requested replacement.',
    category: 'Electrical',
    priority: 'Medium',
    status: 'Open',
    estimatedCost: 3000,
    reportedDate: '2023-11-22',
    convertedToExpense: false,
    notes: []
  },
  {
    id: 'm3',
    propertyId: 'p2',
    unitId: 'u4',
    tenantId: 't2',
    title: 'Window latch latch repair',
    description: 'Master bedroom window latch stuck and unable to lock securely.',
    category: 'Structural',
    priority: 'Low',
    status: 'Completed',
    estimatedCost: 1500,
    actualCost: 1200,
    reportedDate: '2023-10-12',
    scheduledDate: '2023-10-14',
    completedDate: '2023-10-15',
    contractorName: 'QuickFix Handyman',
    contractorPhone: '+254 711 334455',
    convertedToExpense: true,
    notes: [
      { id: 'mn2', content: 'New sliding latch installed and tested.', createdAt: '2023-10-15T11:00:00Z', author: 'Handyman' }
    ]
  }
];
