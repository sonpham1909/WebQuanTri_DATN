import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [selectedSidebarItem, setSelectedSidebarItem] = useState('item1');

    return (
        <SidebarContext.Provider value={{ selectedSidebarItem, setSelectedSidebarItem }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    return useContext(SidebarContext);
};
