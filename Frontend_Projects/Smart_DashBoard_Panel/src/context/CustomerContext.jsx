import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from 'react-hot-toast';
import { useAuth } from "./AuthContext";
import { useAudit } from "./AuditContext";

const CustomerContext = createContext(null);

export const CustomerProvider = ({children}) => {
    const { currentUser, viewAsUserId, users } = useAuth();
    const { logAction } = useAudit();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCustomers = async () => {
        if (!currentUser?.org_id) {
            setCustomers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            let query = supabase.from('customers').select('*').eq('org_id', currentUser.org_id);

            // Execute query
            const { data, error } = await query;
            
            if (error) {
                console.error("Error fetching customers:", error);
                toast.error("Failed to load customers.");
                setCustomers([]);
            } else {
                let filteredData = data || [];
                // Unified Role-Based Hierarchy Firewall
                      if (viewAsUserId) {
                        const allowedIds = users
                            .filter(u => u.id === viewAsUserId || u.parent_id === viewAsUserId || (u.ancestor_ids && u.ancestor_ids.includes(viewAsUserId)))
                            .map(u => u.id);
                        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
                      } else {
                        // WITHOUT View As mode: Admins, SS, DB see data for all users they manage.
                        const allowedIds = users.map(u => u.id);
                        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
                      }
                setCustomers(filteredData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();

        if (currentUser?.org_id) {
            const subscription = supabase.channel('customers_channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `org_id=eq.${currentUser.org_id}` }, () => {
                    fetchCustomers();
                }).subscribe();
            
            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [currentUser, viewAsUserId, users]);

    const addCustomer = async (customerData) => {
        const newCustomer = {
            ...customerData,
            status: customerData.status || "Active", 
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            owner_id: customerData.owner_id || viewAsUserId || currentUser?.id,
        };

        try {
            const { data, error } = await supabase.from('customers').insert([newCustomer]).select();
            if (error) throw error;
            
            if (data && data.length > 0) {
                setCustomers(prev => [data[0], ...prev]);
                logAction("Add Customer", "Customers", `Added customer ${data[0].name || newCustomer.name}`);
            }
            return true;
        } catch (error) {
            console.error("Error adding customer:", error);
            toast.error("Failed to add customer.");
            return false;
        }
    }
   
    const deleteCustomer = (customer) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-sm">Are you sure you want to delete {customer.name}?</span>
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={async () => {
                    toast.dismiss(t.id);
                    try {
                        const { error } = await supabase.from('customers').delete().eq('id', customer.id);
                        if (error) throw error;
                        
                        setCustomers(prev => prev.filter((c) => c.id !== customer.id));
                        logAction("Delete Customer", "Customers", `Deleted customer ${customer.name}`);
                        toast.success("Customer deleted.");
                    } catch (error) {
                        console.error("Error deleting customer:", error);
                        toast.error("Failed to delete customer.");
                    }
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                >Delete</button>
                <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              </div>
            </div>
          ), { duration: Infinity });
    }

    const updateCustomer = async (updatedCustomer) => {
        try {
            const { error } = await supabase
                .from('customers')
                .update(updatedCustomer)
                .eq('id', updatedCustomer.id);
            
            if (error) throw error;

            setCustomers(prev => prev.map(customer => 
                customer.id === updatedCustomer.id ? updatedCustomer : customer
            ));
            logAction("Update Customer", "Customers", `Updated customer ${updatedCustomer.name}`);
            return true;
        } catch (error) {
            console.error("Error updating customer:", error);
            toast.error("Failed to update customer.");
            return false;
        }
    };

    return (
        <CustomerContext.Provider value={{customers, isLoading, addCustomer, deleteCustomer, updateCustomer, fetchCustomers}}>
            {children}
        </CustomerContext.Provider>
    )
}

const useCustomerContext = () => {
    return useContext(CustomerContext);
}

export default useCustomerContext;
