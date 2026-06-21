import React from 'react';
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider } from "./AuthContext";
import { AuditProvider } from "./AuditContext";
import { CustomerProvider } from "./CustomerContext";
import { OrderProvider } from "./OrderContext";
import { BeatProvider } from "./BeatContext";
import { VisitProvider } from "./VisitContext";
import { ProductProvider } from "./ProductContext";
import { SupplyChainProvider } from "./SupplyChainContext";
import { BillingProvider } from "./BillingContext";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <AuditProvider>
            <CustomerProvider>
              <OrderProvider>
                <BeatProvider>
                  <VisitProvider>
                    <ProductProvider>
                      <SupplyChainProvider>
                        <BillingProvider>
                          {children}
                        </BillingProvider>
                      </SupplyChainProvider>
                    </ProductProvider>
                  </VisitProvider>
                </BeatProvider>
              </OrderProvider>
            </CustomerProvider>
          </AuditProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
