import React, { useState } from 'react';
import StorageService from '../services/storageService';
import useCustomerContext from '../context/CustomerContext';
import useOrderContext from '../context/OrderContext';
import { calculateOrderTotal, formatCurrency } from '../utils/financeUtils';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ResponsiveTable from '../components/ui/ResponsiveTable';
import CustomSelect from '../components/ui/CustomSelect';
import { Plus, BarChart2, Edit2, Trash2, Eye, X, Shield, Users as UsersIcon } from 'lucide-react';

const Users = () => {
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  const { logAction } = useAudit();
  const { setViewAsUserId } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState(StorageService.getAllUsers());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedCompareUsers, setSelectedCompareUsers] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES",
    status: "Active"
  });
  const [editingUser, setEditingUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "SALES",
    status: "Active"
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) return;
    
    const existing = StorageService.getUserByEmail(newUserData.email);
    if (existing) {
      alert("User with this email already exists!");
      return;
    }

    const createdUser = StorageService.saveUser(newUserData);
    logAction("Create User", "Users", `Created user ${createdUser.name} (${createdUser.role})`);
    setUsers(StorageService.getAllUsers());
    setIsModalOpen(false);
    setNewUserData({ name: "", email: "", password: "", role: "SALES", status: "Active" });
  };

  const handleEditUserSubmit = (e) => {
    e.preventDefault();
    if (!editingUser.name || !editingUser.email) return;

    const existing = StorageService.getUserByEmail(editingUser.email);
    if (existing && existing.id !== editingUser.id) {
      alert("Email already in use by another account!");
      return;
    }

    const updatedData = {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      status: editingUser.status
    };

    if (editingUser.password && editingUser.password.trim() !== "") {
      updatedData.password = editingUser.password;
    }

    StorageService.updateUser(editingUser.id, updatedData);
    logAction("Update User", "Users", `Updated user ${updatedData.name}`);
    setUsers(StorageService.getAllUsers());
    setIsEditModalOpen(false);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      StorageService.deleteUser(userToDelete.id);
      logAction("Delete User", "Users", `Deleted user ${userToDelete.name}`);
      setUsers(StorageService.getAllUsers());
      setUserToDelete(null);
    }
  };

  const userMetrics = users.filter(user => user.role !== 'ADMIN').map(user => {
    const userCustomers = customers.filter(c => c.createdBy === user.id);
    const userOrders = orders.filter(o => o.createdBy === user.id);
    
    const totalRevenue = userOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    
    return {
      ...user,
      customerCount: userCustomers.length,
      orderCount: userOrders.length,
      revenue: totalRevenue
    };
  });

  const handleToggleCompare = (user) => {
    if (selectedCompareUsers.find(u => u.id === user.id)) {
      setSelectedCompareUsers(selectedCompareUsers.filter(u => u.id !== user.id));
    } else {
      if (selectedCompareUsers.length >= 3) {
        alert("You can only compare up to 3 users at a time.");
        return;
      }
      setSelectedCompareUsers([...selectedCompareUsers, user]);
    }
  };

  const columns = [
    { key: "compare", label: "Compare" },
    { key: "user", label: "User" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "lastLogin", label: "Last Login", hiddenOnMobile: true },
    { key: "customers", label: "Customers", align: "center", hiddenOnMobile: true },
    { key: "revenue", label: "Revenue", align: "right" },
    { key: "actions", label: "Actions", align: "center" }
  ];

  const rowData = userMetrics.map(user => {
    const isChecked = !!selectedCompareUsers.find(u => u.id === user.id);
    return {
      id: user.id,
      compare: (
        <div className="flex items-center justify-center p-1" onClick={(e) => e.stopPropagation()}>
          <label className="relative flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isChecked}
              onChange={() => handleToggleCompare(user)}
              className="sr-only"
            />
            <div className={`w-4 h-4 lg:w-4 lg:h-4 rounded-[4px] border-2 transition-all flex items-center justify-center shadow-sm hover:ring-2 hover:ring-indigo-500/30 ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900'}`}>
              <svg className={`w-2.5 h-2.5 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </label>
        </div>
      ),
      user: (
        <div className="flex items-center gap-3">
          {user.profilePic ? (
            <img 
              src={user.profilePic} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-indigo-200 dark:border-indigo-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-500/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
          </div>
        </div>
      ),
      role: (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
          user.role === 'ADMIN' 
            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
        }`}>
          {user.role}
        </span>
      ),
      status: (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
          user.status === 'Active' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
        }`}>
          {user.status || 'Active'}
        </span>
      ),
      lastLogin: (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
        </span>
      ),
      customers: (
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
          {user.customerCount}
        </span>
      ),
      revenue: (
        <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
          ₹{formatCurrency(user.revenue)}
        </span>
      ),
      actions: (
        <div className="flex justify-center items-center gap-1">
          <button 
            onClick={() => {
              logAction("Impersonate", "Users", `Started viewing dashboard as ${user.name}`);
              setViewAsUserId(user.id);
              navigate('/dashboard');
            }} 
            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]" 
            title="View Dashboard As User"
            aria-label={`View Dashboard as ${user.name}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setEditingUser({ ...user, password: "" }); setIsEditModalOpen(true); }} 
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]" 
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setUserToDelete(user)} 
            className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]" 
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    };
  });

  const renderMobileCard = (row, index) => {
    const user = userMetrics[index];
    return (
      <div key={row.id} className="bg-white dark:bg-[#1a1d27] p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2 lg:space-y-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-2.5 lg:gap-3">
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt={user.name} 
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover shrink-0 border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs lg:text-sm shrink-0 border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm lg:text-base">{user.name}</span>
                <div className="flex gap-1.5 mt-0.5 lg:mt-1 items-center scale-90 origin-left lg:scale-100">
                  {row.role}
                  {row.status}
                </div>
              </div>
           </div>
           <div className="mt-1 mr-1">{row.compare}</div>
        </div>
        
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-2 lg:p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 shadow-inner">
           <div>
             <p className="text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5 lg:mb-1">Revenue</p>
             <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
               ₹{formatCurrency(user.revenue)}
             </p>
           </div>
           <div onClick={(e) => e.stopPropagation()}>{row.actions}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col z-0">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full">
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your team and view their performance</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {selectedCompareUsers.length > 1 && (
            <button 
              onClick={() => setIsCompareModalOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 min-h-[44px]"
            >
              <BarChart2 className="w-4 h-4" /> Compare ({selectedCompareUsers.length}/3)
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {userMetrics.length > 0 ? (
          <ResponsiveTable 
            columns={columns}
            data={rowData}
            renderMobileCard={renderMobileCard}
          />
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <UsersIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              No users found.
            </p>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#1a1d27]">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> Create User
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                <input 
                  type="text" required
                  value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
                  placeholder="Enter Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                <input 
                  type="email" required
                  value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
                  placeholder="sales@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                <input 
                  type="password" required minLength="6"
                  value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
                  placeholder="Enter secure password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Role</label>
                <CustomSelect 
                  value={newUserData.role} 
                  onChange={val => setNewUserData({...newUserData, role: val})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                  options={[
                    { value: 'SALES', label: 'Sales Rep' },
                    { value: 'ADMIN', label: 'Admin' }
                  ]}
                  minWidth="100%"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors min-h-[44px]">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#1a1d27]">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit User
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                <input 
                  type="text" required
                  value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                <input 
                  type="email" required
                  value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">New Password (Optional)</label>
                <input 
                  type="password"
                  value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Role</label>
                <CustomSelect 
                  value={editingUser.role} 
                  onChange={val => setEditingUser({...editingUser, role: val})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                  options={[
                    { value: 'SALES', label: 'Sales Rep' },
                    { value: 'ADMIN', label: 'Admin' }
                  ]}
                  minWidth="100%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Status (Force Logout)</label>
                <CustomSelect 
                  value={editingUser.status || 'Active'} 
                  onChange={val => setEditingUser({...editingUser, status: val})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  minWidth="100%"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors min-h-[44px]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* MULTI-USER COMPARISON MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d27] rounded-3xl shadow-xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#1a1d27] shrink-0">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">User Performance Comparison</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Side-by-side analysis of key metrics</p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-[#0f1117]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCompareUsers.map(user => (
                  <div key={user.id} className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl mb-4 border border-indigo-100 dark:border-indigo-500/20">
                      {user.name.charAt(0)}
                    </div>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">{user.name}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{user.email}</p>
                    
                    <div className="w-full space-y-3">
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Total Revenue</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">₹{formatCurrency(user.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Customers</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold tabular-nums">{user.customerCount}</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Orders Placed</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold tabular-nums">{user.orderCount}</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Last Login</span>
                        <span className="text-zinc-700 dark:text-zinc-300 text-xs font-mono">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete User?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <strong>{userToDelete.name}</strong>? Their historical sales data will be safely preserved.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors min-h-[44px]">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Users;
