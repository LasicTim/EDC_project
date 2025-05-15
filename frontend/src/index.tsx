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
import { UserProvider } from './utils/UserContext';
import CompanyView from './components/views/companyview/companyview';
import UserView from './components/views/userview/userview';
import UserBrowseView from './components/views/companyworkersview/companyworkersview';
import UserCreateView from './components/views/companyworkersview/create_companyworkersview';
import UserEditView from './components/views/companyworkersview/edit_companyworkersview';
import WorkTimeBrowseView from './components/views/worktimeview/worktimeview';
import WorkTimeCreateView from './components/views/worktimeview/create_worktimeview';
import WorkTimeEditView from './components/views/worktimeview/edit_worktimeview';
import AbsenceBrowseView from './components/views/absenceview/absenceview';
import AbsenceCreateView from './components/views/absenceview/create_absenceview';
import AbsenceEditView from './components/views/absenceview/edit_absenceview';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
      <BrowserRouter>
        <UserProvider> 
          <AuthWrapper>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/company" element={<CompanyView />} />
                <Route path="/user" element={<UserView />} />
                <Route path="/workers" element={<UserBrowseView />} />
                <Route path="/workers/create" element={<UserCreateView />} />
                <Route path="/workers/edit/:id" element={<UserEditView />} />
                <Route path="/worktime" element={<WorkTimeBrowseView />} />
                <Route path="/worktime/create" element={<WorkTimeCreateView />} />
                <Route path="/worktime/edit/:id" element={<WorkTimeEditView />} />
                <Route path="/absence" element={<AbsenceBrowseView />} />
                <Route path="/absence/create" element={<AbsenceCreateView />} />
                <Route path="/absence/edit/:id" element={<AbsenceEditView />} />
              </Route>
            </Routes>
          </AuthWrapper>
        </UserProvider>
      </BrowserRouter>
    </React.StrictMode>
);

