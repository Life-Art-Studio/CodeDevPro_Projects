import React, { useState } from 'react';
import StorageService from '../services/storageService';
import useCustomerContext from '../context/CustomerContext';
import useOrderContext from '../context/OrderContext';
import { calculateOrderTotal, formatCurrency } from '../utils/financeUtils';

const Users = () => {
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  
  // Get all users
  const [users, setUsers] = useState(StorageService.getAllUsers());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES"
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) return;
    
    // Check if email exists
    const existing = StorageService.getUserByEmail(newUserData.email);
    if (existing) {
      alert("User with this email already exists!");
      return;
    }

    StorageService.saveUser(newUserData);
    setUsers(StorageService.getAllUsers());
    setIsModalOpen(false);
    setNewUserData({ name: "", email: "", password: "", role: "SALES" });
  };

  const handleDeleteUser = (userId) => {
    // This is now handled by confirmDelete
  };

  const confirmDelete = () => {
    if (userToDelete) {
      StorageService.deleteUser(userToDelete.id);
      setUsers(StorageService.getAllUsers());
      setUserToDelete(null);
    }
  };

  // Calculate metrics for each user
  const userMetrics = users.map(user => {
    // Sales users are the main focus, but we'll show admins too
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

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm mb-2">
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your team and view their performance</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] text-white font-semibold py-2.5 px-5 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm flex items-center gap-2"
        >
          <span>➕</span> Add Sales Rep
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-white/20">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
                <th className="pb-4 font-semibold px-4">User</th>
                <th className="pb-4 font-semibold px-4">Role</th>
                <th className="pb-4 font-semibold px-4 text-center">Customers</th>
                <th className="pb-4 font-semibold px-4 text-center">Orders</th>
                <th className="pb-4 font-semibold px-4 text-right">Revenue</th>
                <th className="pb-4 font-semibold px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userMetrics.map((user) => (
                <tr key={user.id} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        : 'bg-teal-500/10 text-teal-600 border-teal-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                    {user.customerCount}
                  </td>
                  <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                    {user.orderCount}
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                    ₹{formatCurrency(user.revenue)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="View Data">
                        👁️
                      </button>
                      <button onClick={() => setUserToDelete(user)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete User">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {userMetrics.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 dark:bg-white/5 transition-colors backdrop-blur-md">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">Create Sales Rep</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text" required
                  value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Enter Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input 
                  type="email" required
                  value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="sales@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input 
                  type="password" required minLength="6"
                  value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Enter secure password"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER DATA MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 dark:bg-white/5 transition-colors backdrop-blur-md shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">{selectedUser.name}'s Data</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {/* Customers Section */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Customers ({customers.filter(c => c.createdBy === selectedUser.id).length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customers.filter(c => c.createdBy === selectedUser.id).map(c => (
                    <div key={c.id} className="p-3 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.phone}</p>
                    </div>
                  ))}
                  {customers.filter(c => c.createdBy === selectedUser.id).length === 0 && (
                    <p className="text-sm text-slate-500 italic">No customers found.</p>
                  )}
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Orders Section */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Orders ({orders.filter(o => o.createdBy === selectedUser.id).length})</h4>
                <div className="space-y-3">
                  {orders.filter(o => o.createdBy === selectedUser.id).map(o => (
                    <div key={o.id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{o.id}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(o.date).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{formatCurrency(calculateOrderTotal(o))}</p>
                    </div>
                  ))}
                  {orders.filter(o => o.createdBy === selectedUser.id).length === 0 && (
                    <p className="text-sm text-slate-500 italic">No orders found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete <strong>{userToDelete.name}</strong>? Their historical sales data will be safely preserved.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
