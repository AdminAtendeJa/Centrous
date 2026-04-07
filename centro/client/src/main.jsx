import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: '#1a1d26',
                    color: '#f0f2ff',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    fontSize: '13px',
                },
            }}
        />
    </React.StrictMode>
);
