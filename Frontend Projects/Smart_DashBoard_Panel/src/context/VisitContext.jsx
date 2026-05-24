import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";

const VisitContext = createContext();

export const useVisitContext = () => useContext(VisitContext);

export const VisitProvider = ({ children }) => {
  const [visits, setVisits] = useState(() => {
    return StorageService.getVisits() || [];
  });

  useEffect(() => {
    StorageService.saveVisits(visits);
  }, [visits]);

  const addVisit = (visitData) => {
    const newVisit = {
      ...visitData,
      id: `VISIT-${Date.now()}`
    };
    setVisits((prev) => [...prev, newVisit]);
  };

  const updateVisit = (id, updatedData) => {
    setVisits((prev) =>
      prev.map((visit) => (visit.id === id ? { ...visit, ...updatedData } : visit))
    );
  };

  const deleteVisit = (id) => {
    setVisits((prev) => prev.filter((visit) => visit.id !== id));
  };

  return (
    <VisitContext.Provider value={{ visits, addVisit, updateVisit, deleteVisit }}>
      {children}
    </VisitContext.Provider>
  );
};
