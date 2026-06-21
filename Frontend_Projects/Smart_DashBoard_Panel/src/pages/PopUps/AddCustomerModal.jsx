import React, { useState, useEffect } from "react";
import useCustomerContext from "../../context/CustomerContext";
import ReactDOM from "react-dom";
import toast from 'react-hot-toast';
import CustomSelect from "../../components/ui/CustomSelect";

import { useAuth } from "../../context/AuthContext";

const AddCustomerModal = ({ isOpen, onClose }) => {
  const { customers, addCustomer } = useCustomerContext();
  const { currentUser, users } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    status: "Active",
    spend: "",
    lat: null,
    lng: null,
    owner_id: "" // Added owner_id for Sales Rep assignment
  });

  const [isLocating, setIsLocating] = useState(false);

  const captureLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          let fetchedAddress = "";
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: {
                'User-Agent': 'SmartDashboardPanel/1.0 (contact@example.com)'
              }
            });
            const data = await response.json();
            if (data && data.display_name) {
              fetchedAddress = data.display_name;
            }
          } catch (error) {
            console.error("Reverse geocoding failed", error);
          }

          setFormData(prev => ({
            ...prev,
            lat,
            lng,
            address: fetchedAddress || prev.address
          }));
          setIsLocating(false);
          
          if (fetchedAddress) {
            toast.success("Location and Address auto-filled!");
          } else {
            toast.success("Location captured successfully!");
          }
        },
        (error) => {
          setIsLocating(false);
          toast.error("Could not capture location. Please check permissions.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      captureLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      phone: "",
      status: "Active",
      spend: "",
      lat: null,
      lng: null,
      owner_id: ""
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent duplicate customers by phone number
    const isDuplicate = customers.some(
      (customer) => (customer.phone || '').replace(/[^0-9+]/g, '') === (formData.phone || '').replace(/[^0-9+]/g, '')
    );

    if (isDuplicate) {
      toast.error("A customer with this phone number already exists.");
      return;
    }

    // Create a beautifully formatted fake customer object
    const newCustomer = {
      id: `CUS-${Math.floor(Math.random() * 9000) + 1000}`, // Generates CUS-1234
      name: formData.name,
      email: formData.email,
      address: formData.address,
      phone: formData.phone,
      status: formData.status,
      // Format the number to look like currency ($1,000.00)
      spend: `₹${parseFloat(formData.spend || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      lat: formData.lat,
      lng: formData.lng,
      owner_id: formData.owner_id || currentUser?.id
    };

    // Send it to the parent
    addCustomer(newCustomer);

    // Reset the form and close the modal
    handleClose();
  };

  return ReactDOM.createPortal(
    // 1. The Dark Overlay Backdrop
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* 2. The Modal Box */}
      <div className="bg-white dark:bg-[#1a1d27] flex flex-col max-h-[calc(100dvh-2rem)] shadow-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20">
        {/* Modal Header */}
        <div className="shrink-0 px-6 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 transition-colors backdrop-blur-md">
          <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 transition-colors tracking-tight">Add New Customer</h3>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white p-2 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
            {/* Full Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
              >
                Full Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">👤</span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
              >
                Address *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">📍</span>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  placeholder="123 Main St, Anytown, USA"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
              >
                Phone *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">📱</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                />
              </div>
            </div>

            {/*  A Row with two smaller inputs (Status & Spend) */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
                >
                  Status
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">⚡</span>
                  <CustomSelect
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-between outline-none cursor-pointer"
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="spend" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors">Total Spend</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">₹</span>
                  <input type="number" id="spend" name="spend" step="0.01" value={formData.spend} onChange={(e) => setFormData({...formData, spend: e.target.value})} className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
                </div>
              </div>

            </div>
            
            {/* Sales Rep Assignment Dropdown (for DBs and above) */}
            {currentUser?.role !== 'SALES' && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label
                  htmlFor="owner_id"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 transition-colors"
                >
                  Assign to Sales Rep (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">👤</span>
                  <CustomSelect
                    value={formData.owner_id || ""}
                    onChange={(val) => setFormData({ ...formData, owner_id: val })}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner flex items-center justify-between outline-none cursor-pointer"
                    options={[
                      { value: "", label: "-- Assign to Me --" },
                      ...(users
                        ?.filter(u => u.role === 'SALES' && u.parent_id === currentUser?.id)
                        .map(u => ({ value: u.id, label: u.full_name || u.email })) || [])
                    ]}
                  />
                </div>
              </div>
            )}
            
            {/* Location Section */}
            <div className="col-span-1 md:col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-0.5">Store Location</label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formData.lat && formData.lng 
                      ? `Captured: ${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` 
                      : "No location captured yet."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={isLocating}
                  className="px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {isLocating ? (
                    <span className="animate-pulse">Locating...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Capture Current
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Modal Footer (Action Buttons) */}
          <div className="shrink-0 px-6 py-5 border-t border-white/10 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3 transition-colors backdrop-blur-md">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-white dark:hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all transform hover:scale-105"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById("PopModal"),
  );
};

export default AddCustomerModal;
