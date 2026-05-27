import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import { useAuth } from "./AuthContext";

const VisitContext = createContext();

export const useVisitContext = () => useContext(VisitContext);

export const VisitProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const allVisits = StorageService.getVisits() || [];
    if (currentUser?.role === 'ADMIN') {
      setVisits(allVisits);
    } else if (currentUser?.role === 'SALES') {
      setVisits(allVisits.filter(v => v.createdBy === currentUser.id));
    } else {
      setVisits([]);
    }
  }, [currentUser]);

  const addVisit = (visitData) => {
    const allVisits = StorageService.getVisits() || [];
    const newVisit = {
      ...visitData,
      id: `VISIT-${Date.now()}`,
      createdBy: currentUser?.id
    };
    const updatedAll = [...allVisits, newVisit];
    StorageService.saveVisits(updatedAll);
    setVisits((prev) => [...prev, newVisit]);
  };

  const updateVisit = (id, updatedData) => {
    const allVisits = StorageService.getVisits() || [];
    const updatedAll = allVisits.map((visit) => (visit.id === id ? { ...visit, ...updatedData } : visit));
    StorageService.saveVisits(updatedAll);
    setVisits((prev) => prev.map((visit) => (visit.id === id ? { ...visit, ...updatedData } : visit)));
  };

  const deleteVisit = (id) => {
    const allVisits = StorageService.getVisits() || [];
    const updatedAll = allVisits.filter((visit) => visit.id !== id);
    StorageService.saveVisits(updatedAll);
    setVisits((prev) => prev.filter((visit) => visit.id !== id));
  };

  return (
    <VisitContext.Provider value={{ visits, addVisit, updateVisit, deleteVisit }}>
      {children}
    </VisitContext.Provider>
  );
};
