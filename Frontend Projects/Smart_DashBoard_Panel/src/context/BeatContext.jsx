import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import { useAuth } from "./AuthContext";

const BeatContext = createContext();

export const useBeatContext = () => useContext(BeatContext);

export const BeatProvider = ({ children }) => {
  const { currentUser, viewAsUserId } = useAuth();
  const [beats, setBeats] = useState([]);

  useEffect(() => {
    const allBeats = StorageService.getBeats() || [];
    if (currentUser?.role === 'ADMIN') {
      if (viewAsUserId) {
        setBeats(allBeats.filter(b => b.createdBy === viewAsUserId));
      } else {
        setBeats(allBeats);
      }
    } else if (currentUser?.role === 'SALES') {
      setBeats(allBeats.filter(b => b.createdBy === currentUser.id));
    } else {
      setBeats([]);
    }
  }, [currentUser, viewAsUserId]);

  const addBeat = (beatData) => {
    const allBeats = StorageService.getBeats() || [];
    const newBeat = {
      ...beatData,
      id: StorageService.getNextBeatId(),
      createdAt: new Date().toISOString(),
      createdBy: viewAsUserId || currentUser?.id
    };
    const updatedAll = [...allBeats, newBeat];
    StorageService.saveBeats(updatedAll);
    setBeats((prev) => [...prev, newBeat]);
  };

  const updateBeat = (id, updatedData) => {
    const allBeats = StorageService.getBeats() || [];
    const updatedAll = allBeats.map((beat) => (beat.id === id ? { ...beat, ...updatedData } : beat));
    StorageService.saveBeats(updatedAll);
    setBeats((prev) => prev.map((beat) => (beat.id === id ? { ...beat, ...updatedData } : beat)));
  };

  const deleteBeat = (id) => {
    const allBeats = StorageService.getBeats() || [];
    const updatedAll = allBeats.filter((beat) => beat.id !== id);
    StorageService.saveBeats(updatedAll);
    setBeats((prev) => prev.filter((beat) => beat.id !== id));
  };

  const addCustomerToBeat = (beatId, customerId) => {
    const allBeats = StorageService.getBeats() || [];
    const updatedAll = allBeats.map((beat) => {
      if (beat.id === beatId) {
        const assigned = beat.assignedCustomers || [];
        if (!assigned.includes(customerId)) {
          return { ...beat, assignedCustomers: [...assigned, customerId] };
        }
      }
      return beat;
    });
    StorageService.saveBeats(updatedAll);
    setBeats(updatedAll.filter(b => currentUser?.role === 'ADMIN' || b.createdBy === currentUser?.id));
  };

  const removeCustomerFromBeat = (beatId, customerId) => {
    const allBeats = StorageService.getBeats() || [];
    const updatedAll = allBeats.map((beat) => {
      if (beat.id === beatId) {
        return {
          ...beat,
          assignedCustomers: (beat.assignedCustomers || []).filter(c => c !== customerId)
        };
      }
      return beat;
    });
    StorageService.saveBeats(updatedAll);
    setBeats(updatedAll.filter(b => currentUser?.role === 'ADMIN' || b.createdBy === currentUser?.id));
  };

  return (
    <BeatContext.Provider value={{ 
      beats, 
      addBeat, 
      updateBeat, 
      deleteBeat, 
      addCustomerToBeat,
      removeCustomerFromBeat
    }}>
      {children}
    </BeatContext.Provider>
  );
};
