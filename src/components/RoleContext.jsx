import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

export const ROLES = {
  COORDENADOR: { id: 'coordenador', label: 'Coordenador de Curso', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  PROFESSOR: { id: 'professor', label: 'Professor EBTT', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  SUPERVISAO: { id: 'supervisao', label: 'Supervisão Pedagógica', badge: 'bg-purple-100 text-purple-800 border-purple-300' }
};

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(ROLES.COORDENADOR);

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
