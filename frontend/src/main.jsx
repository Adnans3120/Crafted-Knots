import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Lato, sans-serif',
            background: '#fff8f4',
            color: '#2c1810',
            border: '1px solid #e8d8d0',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(92,45,33,0.12)',
          },
          success: { iconTheme: { primary: '#4a7c59', secondary: '#fff' } },
          error: { iconTheme: { primary: '#c0392b', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
