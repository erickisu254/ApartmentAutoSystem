
export enum UnitStatus {
  OCCUPIED = 'Occupied',
  VACANT = 'Vacant',
  MAINTENANCE = 'Maintenance',
}

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO Date string
  author: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  image?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  name: string;
  rentAmount: number;
  depositAmount?: number; // Added deposit requirement
  status: UnitStatus;
  tenantId?: string | null;
  floor?: string; // e.g. 'Ground Floor', '1st Floor', '2nd Floor', etc.
  unitType?: string; // e.g. 'Single Room', 'Bedsitter', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Penthouse'
  unitTypeNote?: string; // Custom description (e.g. 'Big room', 'Master ensuite', 'Corner balcony') that does not override unitType
  utilityNote?: string; // Additional utility / deposit note (e.g. 'Water deposit is 1000')
  waterMeterNumber?: string;
  initialWaterReading?: number; // Initial reading when tenant enters the unit
  initialWaterReadingDate?: string; // Date of initial reading
  currentWaterReading?: number; // Current reading (can be updated anytime)
  currentWaterReadingDate?: string; // Date current reading was taken
  finalWaterReading?: number; // Final reading when tenant leaves the unit
  finalWaterReadingDate?: string; // Date of final reading
  // Compatibility fields
  previousWaterReading?: number;
  waterReadingDate?: string;
  waterRatePerUnit?: number;
  features?: string[];
  notes?: Note[];
}

export interface Tenant {
  id: string;
  fullName: string;
  email?: string; // Optional
  phone: string;
  idNumber?: string; // Optional
  leaseStart?: string; // Optional
  leaseEnd?: string; // Optional
  occupants: number;
  unitId?: string | null; // Currently assigned unit
  previousUnitId?: string | null; // Last assigned unit before move out
  previousUnitName?: string; // Cached unit name for historical records
  documents?: string[]; // mocked file names
  notes: Note[];
  status: 'Active' | 'Previous'; // Added status
  paidUntil?: string; // ISO Date string - The date up to which rent is paid
  leaseSigned?: boolean;
  leaseSignature?: string; // Base64 data URL
  leaseSignedDate?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  unitId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card' | string;
  type: 'Rent' | 'Deposit' | 'Rent + Deposit' | string;
  rentPortion?: number;
  depositPortion?: number;
  status: 'Completed' | 'Pending' | 'Failed';
  notes?: string;
}

export interface Expense {
  id: string;
  propertyId: string; // Linked to a property usually, or 'general'
  category: 'Maintenance' | 'Utilities' | 'Tax' | 'Insurance' | 'Other';
  amount: number;
  date: string;
  description: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  title: string;
  description: string;
  category: 'Plumbing' | 'Electrical' | 'Structural' | 'HVAC' | 'Appliance' | 'Pest Control' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Pending Approval' | 'Completed' | 'Cancelled';
  estimatedCost?: number;
  actualCost?: number;
  reportedDate: string; // YYYY-MM-DD
  scheduledDate?: string;
  completedDate?: string;
  contractorName?: string;
  contractorPhone?: string;
  convertedToExpense?: boolean;
  notes?: Note[];
}

export interface AppState {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  maintenanceTickets: MaintenanceTicket[];
  darkMode: boolean;
}