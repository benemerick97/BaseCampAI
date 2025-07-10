// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // ✅ added
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ✅ Create the client instance
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}> {/* ✅ wrap with provider */}
        <AuthProvider>
          <App />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} /> {/* ✅ optional debug panel */}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
