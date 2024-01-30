import React, { createContext, useContext } from "react";
import RootStore from "./app/stores/root.store";

interface ComponentProps {
  children: React.ReactNode;
}

const store = new RootStore(); // Create a single instance of the store
const RootStoreContext = createContext(store); // Pass the store instance to the context

export const RootStoreProvider = ({ children }: ComponentProps) => {
  return (
    <RootStoreContext.Provider value={store}>
      {children}
    </RootStoreContext.Provider>
  );
};

export const useStore = (): RootStore => {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error("useStore must be used within a storeProvider");
  }
  return store;
};
