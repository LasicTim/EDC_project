import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogIn from './components/login/login';
import SignUp from './components/signup/signup';
import AuthWrapper from './utils/AuthWrapper';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(

      <React.StrictMode>
        <BrowserRouter> 
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<LogIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </AuthWrapper>
        </BrowserRouter>
      </React.StrictMode>
);

