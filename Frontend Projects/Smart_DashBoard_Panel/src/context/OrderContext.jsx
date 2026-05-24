import { createContext, useState, useContext } from "react";
import StorageService from "../services/storageService";

const OrderContext = createContext([]);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    return StorageService.getOrders() ?? []; // Default to empty array if no orders exist yet
  });

  const addOrder = (order) => {
    const newOrders = [order, ...orders]; // Put new order at the top
    setOrders(newOrders);
    StorageService.saveOrders(newOrders); // SAVE TO STORAGE!
  };

  const deleteOrder = (id) => {
    const newOrders = orders.filter((order) => order.id !== id);
    setOrders(newOrders);
    StorageService.saveOrders(newOrders); // SAVE TO STORAGE!
  };

  const updateOrder = (id, updatedOrder) => {
    const newOrders = orders.map((order) =>
      order.id === id ? { ...order, ...updatedOrder } : order,
    );
    setOrders(newOrders);
    StorageService.saveOrders(newOrders); // SAVE TO STORAGE!
  };
  const clearAllOrders = () => {
    setOrders([]); // Wipe React state
    StorageService.clearOrders(); // Wipe Local Storage
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
