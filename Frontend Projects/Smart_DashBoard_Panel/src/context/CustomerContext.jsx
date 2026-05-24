import { createContext,useContext,useState } from "react";
import initialCustomers from "../utils/CustomerList";
import StorageService from "../services/storageService";
import toast from 'react-hot-toast';

const CustomerContext = createContext(null);


export const CustomerProvider = ({children}) => {
    const [customers,setCustomers] = useState(StorageService.getCustomers() ?? initialCustomers);
    const addCustomer = (customer) => {
        const newCustomers = [customer, ...customers];
        setCustomers(newCustomers);
        StorageService.saveCustomers(newCustomers);
    }
   
    const deleteCustomer = (customer) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-sm">Are you sure you want to delete {customer.name}?</span>
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    const newCustomers = customers.filter((c) => c.id !== customer.id);
                    setCustomers(newCustomers);
                    StorageService.saveCustomers(newCustomers);
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
        const updatedCustomers = customers.map(customer => 
            // If the ID matches, replace the old data with the new data
            customer.id === updatedCustomer.id ? updatedCustomer : customer
        );
        setCustomers(updatedCustomers);
        StorageService.saveCustomers(updatedCustomers);
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
