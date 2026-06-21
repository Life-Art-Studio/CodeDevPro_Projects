import { useState, useMemo } from 'react';
import useCustomerContext from '../context/CustomerContext';
import useOrderContext from '../context/OrderContext';

export default function useGlobalSearch() {
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    return customers.filter(c => 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    return orders.filter(o => 
      (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerId || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredCustomers,
    filteredOrders
  };
}
