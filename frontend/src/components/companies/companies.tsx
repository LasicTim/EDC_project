import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import "./companies.css";
import axios from 'axios';
import { api } from '../../api';
import { redirect, useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const Companies: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const handleLogin = async () => {

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
    
            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log('data:', response);
            if (response.data && response.data.access_token) {
                auth.setToken(response.data.access_token);
                console.log('Login successful:', response.data);
                navigate('/');
            }
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Login failed:', error.response.data.detail);
            } else {
                console.error('Login failed:', error);
            }
            // Handle error (show error message to user)
        }
    };

    const footer = (
        <div className='Buttons'>
            <Button
                label="Vpis"
                icon="pi pi-check"
                onClick={handleLogin}
                className="p-button-rounded p-button-info w-full"
            />
            <Button
                label="Registracija"
                icon="pi pi-user-plus"
                onClick={() => navigate("/signup")}
                className="p-button-rounded p-button-info w-full"
            />
        </div>
    );

    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;

    return (
        <>
        <div className="companies-table-container">
        {
            (() => {
                const customers = [
                    {
                        id: 1,
                        name: "John Doe",
                        country: { name: "USA" },
                        company: "Acme Corp",
                        representative: { name: "Mary" }
                    },
                    {
                        id: 2,
                        name: "Jane Smith",
                        country: { name: "UK" },
                        company: "Beta LLC",
                        representative: { name: "Jim" }
                    },
                    {
                        id: 3,
                        name: "Alice Johnson",
                        country: { name: "Canada" },
                        company: "Gamma Co.",
                        representative: { name: "Laura" }
                    },
                    {
                        id: 4,
                        name: "Bob Brown",
                        country: { name: "Australia" },
                        company: "Delta Ltd",
                        representative: { name: "Steve" }
                    }
                ];
                return (
                    <DataTable value={customers} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}" paginatorLeft={paginatorLeft} paginatorRight={paginatorRight}
                            sortMode="multiple">
                        <Column field="name" sortable  header="Name" style={{ width: '25%' }}></Column>
                        <Column field="country.name"  header="Country" sortable  style={{ width: '25%' }}></Column>
                        <Column field="company" header="Company" sortable  style={{ width: '25%' }}></Column>
                        <Column field="representative.name" header="Representative" sortable  style={{ width: '25%' }}></Column>
                    </DataTable>
                );
            })()
        }
        </div>
        </>
    );
};

export default Companies;