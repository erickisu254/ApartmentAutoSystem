
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { format } from 'date-fns';
import { Plus, Search, TrendingDown, Filter, Trash2, Eye, X, Building2, Calendar, DollarSign, FileText, ArrowUpDown, ArrowUp, ArrowDown, Edit } from 'lucide-react';

const Expenses: React.FC = () => {
  const { expenses, properties, addExpense, updateExpense, deleteExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    propertyId: '',
    category: 'Maintenance',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const getPropertyName = (id: string) => {
    if (id === 'general') return 'General / Overhead';
    return properties.find(p => p.id === id)?.name || 'Unknown Property';
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      ...newExpense as Expense,
      id: `exp${Date.now()}`
    });
    setShowModal(false);
    setNewExpense({
      propertyId: '',
      category: 'Maintenance',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      deleteExpense(id);
      setViewExpense(null);
    }
  };

  const handleEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExpense) return;
    updateExpense(editExpense);
    setEditExpense(null);
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
      ? <ArrowUp size={14} className="text-orange-600 dark:text-orange-400" /> 
      : <ArrowDown size={14} className="text-orange-600 dark:text-orange-400" />;
  };

  const filteredExpenses = [...expenses]
    .filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            getPropertyName(e.propertyId).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'property':
          aValue = getPropertyName(a.propertyId).toLowerCase();
          bValue = getPropertyName(b.propertyId).toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Expenses</h1>
        <button onClick={() => setShowModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search description or property..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select 
                className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
            >
                <option value="All">All Categories</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Utilities">Utilities</option>
                <option value="Tax">Tax</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
            </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredExpenses.length === 0 ? (
             <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No expenses found.</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                    <th onClick={() => handleSort('date')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                        <div className="flex items-center gap-2">Date {getSortIcon('date')}</div>
                    </th>
                    <th onClick={() => handleSort('category')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                        <div className="flex items-center gap-2">Category {getSortIcon('category')}</div>
                    </th>
                    <th onClick={() => handleSort('description')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                        <div className="flex items-center gap-2">Description {getSortIcon('description')}</div>
                    </th>
                    <th onClick={() => handleSort('property')} className="p-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                        <div className="flex items-center gap-2">Property {getSortIcon('property')}</div>
                    </th>
                    <th onClick={() => handleSort('amount')} className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none">
                        <div className="flex items-center justify-end gap-2">Amount (Ksh) {getSortIcon('amount')}</div>
                    </th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-center">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 group">
                    <td className="p-4 text-gray-700 dark:text-gray-300">{format(new Date(exp.date), 'MMM d, yyyy')}</td>
                    <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        {exp.category}
                        </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 truncate max-w-xs">{exp.description}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{getPropertyName(exp.propertyId)}</td>
                    <td className="p-4 text-right font-bold text-gray-800 dark:text-white">{exp.amount.toLocaleString()}</td>
                    <td className="p-4 text-center flex justify-center gap-2">
                        <button 
                            onClick={() => setViewExpense(exp)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                        <button 
                            onClick={() => setEditExpense({ ...exp })}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors"
                            title="Edit Expense"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(exp.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Delete Expense"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <TrendingDown className="text-orange-600"/> Add Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Property / Context</label>
                <select 
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newExpense.propertyId} 
                    onChange={e => setNewExpense({...newExpense, propertyId: e.target.value})}
                >
                  <option value="general">General / Overhead</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newExpense.category} 
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Tax">Tax</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    value={newExpense.date} 
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Amount (Ksh)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    required
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={newExpense.amount === 0 ? '' : newExpense.amount?.toLocaleString()}
                    onChange={e => {
                        const value = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(value))) {
                            setNewExpense({...newExpense, amount: Number(value)});
                        }
                    }} 
                  />
              </div>

              <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Details about the expense..."
                    value={newExpense.description} 
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                  />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-orange-600" /> Expense Details
                    </h2>
                    <button onClick={() => setViewExpense(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">Ksh {viewExpense.amount.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                                <p className="text-gray-800 dark:text-white">{format(new Date(viewExpense.date), 'MMMM d, yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <TrendingDown className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                                    {viewExpense.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building2 className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Property</p>
                                <p className="text-gray-800 dark:text-white">{getPropertyName(viewExpense.propertyId)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                            <FileText className="text-gray-400 mt-1 shrink-0" size={18} />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{viewExpense.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                     <button 
                        onClick={() => handleDelete(viewExpense.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                     >
                         <Trash2 size={16} /> Delete Record
                     </button>
                     <div className="flex gap-2">
                       <button 
                          onClick={() => {
                            setEditExpense({ ...viewExpense });
                            setViewExpense(null);
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium flex items-center gap-1.5"
                       >
                           <Edit size={15} /> Edit
                       </button>
                       <button 
                          onClick={() => setViewExpense(null)} 
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                      >
                          Close
                      </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Edit className="text-orange-600"/> Edit Expense
              </h2>
              <button onClick={() => setEditExpense(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditExpense} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">Property / Context</label>
                <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={editExpense.propertyId} 
                    onChange={e => setEditExpense({...editExpense, propertyId: e.target.value})}
                >
                  <option value="general">General / Overhead</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">Category</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={editExpense.category} 
                    onChange={e => setEditExpense({...editExpense, category: e.target.value as any})}
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Tax">Tax</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    value={editExpense.date} 
                    onChange={e => setEditExpense({...editExpense, date: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">Amount (Ksh)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    required
                    min="0"
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={editExpense.amount === 0 ? '' : editExpense.amount?.toLocaleString()}
                    onChange={e => {
                        const value = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(value))) {
                            setEditExpense({...editExpense, amount: Number(value)});
                        }
                    }} 
                  />
              </div>

              <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">Description</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Details about the expense..."
                    value={editExpense.description} 
                    onChange={e => setEditExpense({...editExpense, description: e.target.value})} 
                  />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t dark:border-gray-700">
                <button type="button" onClick={() => setEditExpense(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
