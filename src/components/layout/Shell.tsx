"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Pass toggle to children via a wrapper */}
        <MobileMenuContext.Provider value={() => setSidebarOpen((v) => !v)}>
          {children}
        </MobileMenuContext.Provider>
      </main>
    </div>
  );
}

import { createContext, useContext } from "react";
export const MobileMenuContext = createContext<() => void>(() => {});
export function useMobileMenu() {
  return useContext(MobileMenuContext);
}
