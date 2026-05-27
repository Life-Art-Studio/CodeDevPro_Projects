import { createContext, useState, useContext, useEffect } from "react";
import StorageService from "../services/storageService";
import { useAuth } from "./AuthContext";

const OrderContext = createContext([]);

export const OrderProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const allOrders = StorageService.getOrders() ?? [];
    if (currentUser?.role === 'ADMIN') {
      setOrders(allOrders);
    } else if (currentUser?.role === 'SALES') {
      setOrders(allOrders.filter(o => o.createdBy === currentUser.id));
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  const addOrder = (order) => {
    const allOrders = StorageService.getOrders() ?? [];
    const newOrder = { ...order, createdBy: currentUser?.id };
    const updatedAll = [newOrder, ...allOrders];
    StorageService.saveOrders(updatedAll);
    setOrders([newOrder, ...orders]);
  };

  const deleteOrder = (id) => {
    const allOrders = StorageService.getOrders() ?? [];
    const updatedAll = allOrders.filter(o => o.id !== id);
    StorageService.saveOrders(updatedAll);
    setOrders(orders.filter((order) => order.id !== id));
  };

  const updateOrder = (id, updatedOrder) => {
    const allOrders = StorageService.getOrders() ?? [];
    const updatedAll = allOrders.map(o => o.id === id ? { ...o, ...updatedOrder } : o);
    StorageService.saveOrders(updatedAll);
    setOrders(orders.map((order) => order.id === id ? { ...order, ...updatedOrder } : order));
  };
  const clearAllOrders = () => {
    const allOrders = StorageService.getOrders() ?? [];
    if (currentUser?.role === 'ADMIN') {
      StorageService.clearOrders();
      setOrders([]);
    } else if (currentUser?.role === 'SALES') {
      const remainingOrders = allOrders.filter(o => o.createdBy !== currentUser.id);
      StorageService.saveOrders(remainingOrders);
      setOrders([]);
    }
  };

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, deleteOrder, updateOrder, clearAllOrders }}
    >
      {children}
    </OrderContext.Provider>
  );
};

const useOrderContext = () => {
  return useContext(OrderContext);
};

export default useOrderContext;
