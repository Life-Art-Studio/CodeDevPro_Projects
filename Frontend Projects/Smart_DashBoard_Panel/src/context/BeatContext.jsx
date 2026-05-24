import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";

const BeatContext = createContext();

export const useBeatContext = () => useContext(BeatContext);

export const BeatProvider = ({ children }) => {
  const [beats, setBeats] = useState(() => {
    return StorageService.getBeats() || [];
  });

  useEffect(() => {
    StorageService.saveBeats(beats);
  }, [beats]);

  const addBeat = (beatData) => {
    const newBeat = {
      ...beatData,
      id: StorageService.getNextBeatId(),
      createdAt: new Date().toISOString()
    };
    setBeats((prev) => [...prev, newBeat]);
  };

  const updateBeat = (id, updatedData) => {
    setBeats((prev) =>
      prev.map((beat) => (beat.id === id ? { ...beat, ...updatedData } : beat))
    );
  };

  const deleteBeat = (id) => {
    setBeats((prev) => prev.filter((beat) => beat.id !== id));
  };

  const addCustomerToBeat = (beatId, customerId) => {
    setBeats((prev) => 
      prev.map((beat) => {
        if (beat.id === beatId) {
          const assigned = beat.assignedCustomers || [];
          if (!assigned.includes(customerId)) {
            return { ...beat, assignedCustomers: [...assigned, customerId] };
          }
        }
        return beat;
      })
    );
  };

  const removeCustomerFromBeat = (beatId, customerId) => {
    setBeats((prev) => 
      prev.map((beat) => {
        if (beat.id === beatId) {
          return {
            ...beat,
            assignedCustomers: (beat.assignedCustomers || []).filter(c => c !== customerId)
          };
        }
        return beat;
      })
    );
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
