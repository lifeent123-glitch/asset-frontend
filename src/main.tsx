// src/main.tsx
import 'antd/dist/reset.css';            // AntD のリセットCSS
import './index.css';                    // Tailwind などプロジェクトの共通CSS
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StyleProvider } from '@ant-design/cssinjs';
import App from './App';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <BrowserRouter>
        <StyleProvider hashPriority="high">
          <App />
        </StyleProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  document.body.innerHTML = '<pre>NO ROOT</pre>';
}