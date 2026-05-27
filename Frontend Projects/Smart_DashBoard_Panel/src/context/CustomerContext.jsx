import { createContext, useContext, useState, useEffect } from "react";
import initialCustomers from "../utils/CustomerList";
import StorageService from "../services/storageService";
import toast from 'react-hot-toast';
import { useAuth } from "./AuthContext";

const CustomerContext = createContext(null);


export const CustomerProvider = ({children}) => {
    const { currentUser, viewAsUserId } = useAuth();
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const allCustomers = StorageService.getCustomers() ?? initialCustomers;
        if (currentUser?.role === 'ADMIN') {
            if (viewAsUserId) {
                setCustomers(allCustomers.filter(c => c.createdBy === viewAsUserId));
            } else {
                setCustomers(allCustomers);
            }
        } else if (currentUser?.role === 'SALES') {
            setCustomers(allCustomers.filter(c => c.createdBy === currentUser.id));
        } else {
            setCustomers([]);
        }
    }, [currentUser, viewAsUserId]);

    const addCustomer = (customerData) => {
        const allCustomers = StorageService.getCustomers() ?? initialCustomers;
        const newCustomer = {
            ...customerData,
            id: `CUST-${Date.now()}`,
            status: customerData.status || "Active", // Default to Active
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            createdBy: viewAsUserId || currentUser?.id, // Assign to current salesperson
        };
        const updatedAll = [newCustomer, ...allCustomers];
        StorageService.saveCustomers(updatedAll);
        setCustomers([newCustomer, ...customers]);
    }
   
    const deleteCustomer = (customer) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-sm">Are you sure you want to delete {customer.name}?</span>
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    const allCustomers = StorageService.getCustomers() ?? initialCustomers;
                    const updatedAll = allCustomers.filter((c) => c.id !== customer.id);
                    StorageService.saveCustomers(updatedAll);
                    setCustomers(customers.filter((c) => c.id !== customer.id));
                    toast.success("Customer deleted.");
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                >Delete</button>
                <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              </div>
            </div>
          ), { duration: Infinity });
    }
    const updateCustomer = (updatedCustomer) => {
        const allCustomers = StorageService.getCustomers() ?? initialCustomers;
        const updatedAll = allCustomers.map(c => 
            c.id === updatedCustomer.id ? updatedCustomer : c
        );
        StorageService.saveCustomers(updatedAll);
        
        const updatedLocal = customers.map(customer => 
            customer.id === updatedCustomer.id ? updatedCustomer : customer
        );
        setCustomers(updatedLocal);
    };
    return (
        <CustomerContext.Provider value={{customers,addCustomer,deleteCustomer,updateCustomer}}>
            {children}
        </CustomerContext.Provider>
    )
}





const useCustomerContext = () => {
    return useContext(CustomerContext);
}



export default useCustomerContext;
