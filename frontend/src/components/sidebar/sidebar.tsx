import React from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate } from 'react-router-dom';

import './sidebar.css';

const Menu: React.FC = () => {
    const navigate = useNavigate();
    const items = [
        {
            label: 'Dokumenti',
            icon: 'pi pi-fw pi-folder',
            
            command: () => navigate('/'),
        },
        {
            label: 'Podjetja',
            icon: 'pi pi-fw pi-briefcase',
            command: () => navigate('/companies'),
        },
        // Add more menu items as needed
    ];

    return (
        <PanelMenu model={items} className="sidebar-menu" />
    );
};

export default Menu;