import React from 'react';
import Header from '../header/header';
import Menu from '../sidebar/sidebar';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import './layout.css';

const Layout: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <>
            {!isAuthPage && <Header />}
            <div className="app-container">
                {!isAuthPage && (
                    <div className="menu-container">
                        <Menu />
                    </div>
                )}
                <div className="content-container">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default Layout;