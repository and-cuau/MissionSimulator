// ApiContext.tsx or ApiContext.js
import { createContext, useContext } from 'react';

export const ApiContext = createContext({
  api_url: '', // default value (can be blank or set a fallback)
});

// Custom hook for easier access
export const useApi = () => useContext(ApiContext);

