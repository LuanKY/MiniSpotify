import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App'; // Deve ser AppWrapper

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);

