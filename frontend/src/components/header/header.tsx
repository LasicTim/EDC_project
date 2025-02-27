import React from 'react';
import { Menubar } from 'primereact/menubar';

import { useNavigate } from "react-router-dom";
import 'primereact/resources/themes/saga-blue/theme.css';  // Choose your theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { auth } from '../../utils/auth';
import { Button } from 'primereact/button';
import './header.css';
import { useUser } from '../../utils/UserContext';

const Header: React.FC = () => {
    const navigate = useNavigate(); // React Router navigation hook
    const { user } = useUser();

    const deleteAccessToken = () => {
        console.log(user);
        auth.removeToken()
    };

    const items = [
        { label: "Domov", icon: "pi pi-fw pi-home", command: () => navigate("/") },
      ];

    const end = (
        /* display user from localstorage */
        <div className="user-info">
             <div>
                <span>Vpisan: {user?.username || 'Guest'}</span>
            </div>

            <Button 
                label="Izpis" 
                icon="pi pi-power-off" 
                className="p-button-text logout-button" 
                onClick={deleteAccessToken} 
            />
        </div>
    );

    return (
        <header>
            <Menubar model={items} end={end} />
        </header>
    );
};

export default Header;