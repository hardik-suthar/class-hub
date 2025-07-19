import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add global authFetch utility for authenticated API calls
(window as any).authFetch = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  options.headers = options.headers || {};
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(url, options);
    
    // Handle different response types
    if (res.status === 401) {
      // Token expired or unauthorized, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return { ok: false, status: 401 };
    }
    
    if (res.status === 500) {
      console.error('Server error for URL:', url);
      return { ok: false, status: 500, error: 'Internal server error' };
    }
    
    // Handle JSON responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await res.text();
        if (!text) {
          return { ok: false, status: res.status, error: 'Empty response' };
        }
        const json = JSON.parse(text);
        // Create a new response with the parsed JSON
        return new Response(JSON.stringify(json), {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers
        });
      } catch (jsonError) {
        console.error('JSON parsing error for URL:', url, 'Response text:', await res.text());
        return { ok: false, status: res.status, error: `Invalid JSON response: ${jsonError}` };
      }
    }
    
    // Handle non-JSON responses (like login token)
    if (res.status === 200 && !contentType?.includes('application/json')) {
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      });
    }
    
    return res;
  } catch (err) {
    console.error('Network error for URL:', url, err);
    return { ok: false, status: 0, error: err };
  }
};

// Utility to check and clean corrupted localStorage
(window as any).checkAndCleanStorage = () => {
  try {
    // Check if token is valid JSON
    const token = localStorage.getItem('token');
    if (token) {
      // If token is not a simple string, it might be corrupted
      if (token.startsWith('{') || token.startsWith('[')) {
        console.warn('Corrupted token found in localStorage, clearing...');
        localStorage.removeItem('token');
      }
    }
    
    // Check other potential JSON items
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          JSON.parse(value); // Test if it's valid JSON
        }
      } catch (e) {
        console.warn(`Corrupted localStorage item found: ${key}, removing...`);
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('Error checking localStorage:', e);
  }
};

// Run storage check on app start
(window as any).checkAndCleanStorage();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
