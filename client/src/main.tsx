import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { ApiContext } from './contexts/APIContext';
import { AuthProvider } from "./contexts/AuthContext";

const api_url = 'http://localhost:3000';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
       <ApiContext.Provider value={{ api_url }}>
      <App />
      </ApiContext.Provider>
    </AuthProvider>
  </StrictMode>,
);
