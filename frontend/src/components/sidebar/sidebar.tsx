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
            command: () => navigate('/user'),
        },
        {
            label: 'Evidenca delovnega časa',
            icon: 'pi pi-fw pi-clock',
            command: () => navigate('/worktime'),
        },
        {
            label: 'Odsotnosti',
            icon: 'pi pi-fw pi-calendar',
            command: () => navigate('/absence'),
        },
        {
            label: 'Dopusti',
            icon: 'pi pi-fw pi-sun',
            command: () => navigate('/vacation'),
        },
        {
            label: 'Predloge',
            icon: 'pi pi-fw pi-file',
            command: () => navigate('/custom_templates'),
        },
        {
            label: 'Dokumenti',
            icon: 'pi pi-fw pi-book',
            command: () => navigate('/generated_reports'),
        },
        {
            label: 'Podjetje',
            icon: 'pi pi-fw pi-building',
            command: () => navigate('/company'),
        },
        {
            label: 'Delavci',
            icon: 'pi pi-fw pi-users',
            command: () => navigate('/workers'),
        },
        // Add more menu items as needed
    ];

    return (
        <PanelMenu model={items} className="sidebar-menu" />
    );
};

export default Menu;