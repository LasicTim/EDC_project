import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogIn from './components/login/login';
import SignUp from './components/signup/signup';
import AuthWrapper from './utils/AuthWrapper';
import Login from './components/login/login';
import Layout from './components/layout/layout';
import Companies from './components/companies/companies';
import Home from './components/home';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
      <BrowserRouter> 
        <AuthWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/companies" element={<Companies />} />
            </Route>
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </React.StrictMode>
);

