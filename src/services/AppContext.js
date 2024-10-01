import React, { createContext, useState } from 'react';

// Tạo Context
const AppContext = createContext();

// Tạo Provider
const AppProvider = ({ children }) => {
    const [state, setState] = useState({
        // Dữ liệu ban đầu
        user: null,
        // Các trạng thái khác
    });

    return (
        <AppContext.Provider value={{ state, setState }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
