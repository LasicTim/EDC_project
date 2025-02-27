import React from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { useNavigate } from 'react-router-dom';

import './sidebar.css';

const Menu: React.FC = () => {
    const navigate = useNavigate();
    const items = [
        {
            label: 'Osebni potatki',
            icon: 'pi pi-fw pi-user',
            command: () => navigate('/'),
        },
        {
            label: 'Evidenca delovnega časa',
            icon: 'pi pi-fw pi-clock',
            command: () => navigate('/'),
        },
        {
            label: 'Predloge',
            icon: 'pi pi-fw pi-file',
            command: () => navigate('/'),
        },
        {
            label: 'Dokumenti',
            icon: 'pi pi-fw pi-book',
            command: () => navigate('/'),
        },
        {
            label: 'Podjetje',
            icon: 'pi pi-fw pi-building',
            command: () => navigate('/companies'),
        },
        // Add more menu items as needed
    ];

    return (
        <PanelMenu model={items} className="sidebar-menu" />
    );
};

export default Menu;