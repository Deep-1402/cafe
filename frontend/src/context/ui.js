import React, { createContext, useContext, useState } from "react";

// 1️⃣ Create the context
export const UIContext = createContext(null);

// 2️⃣ Create Provider
export const UIProvider = ({ children }) => {
  const [uiState, setUiState] = useState({
    sidebarShow: true,
    theme: "light",
  });

  // mimic the Redux "set" reducer
  const setUI = (payload) => {
    // console.log({ ...uiState, ...payload });
    setUiState((prev) => ({ ...prev, ...payload }));
  };

  const value = {
    ...uiState,
    setUI,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// 3️⃣ Custom Hook
export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
};
