import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AuditState, AuditAction } from '../types/audit';
import { initialAuditState, auditReducer } from './auditReducer';

interface AuditContextType {
  state: AuditState;
  dispatch: React.Dispatch<AuditAction>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export interface AuditProviderProps {
  children: ReactNode;
}

export const AuditProvider: React.FC<AuditProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(auditReducer, initialAuditState);

  return (
    <AuditContext.Provider value={{ state, dispatch }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
