import React from 'react';
import { Menubar } from 'primereact/menubar';

import { useNavigate } from "react-router-dom";
import 'primereact/resources/themes/saga-blue/theme.css';  // Choose your theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Header: React.FC = () => {
    const navigate = useNavigate(); // React Router navigation hook

    const items = [
        { label: "Home", icon: "pi pi-fw pi-home", command: () => navigate("/") },
        { label: "About", icon: "pi pi-fw pi-info-circle", command: () => navigate("/about") },
        { label: "Contact", icon: "pi pi-fw pi-envelope", command: () => navigate("/contact") },
      ];

    return (
        <header>
            <Menubar model={items} />
        </header>
    );
};

export default Header;