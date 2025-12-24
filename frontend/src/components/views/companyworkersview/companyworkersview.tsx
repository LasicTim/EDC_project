import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ToastMessage } from 'primereact/toast';
import { api } from '../../../api';
import { useUser } from '../../../utils/UserContext';
import axios from 'axios';
import { showToast, showToastWithOutLoadRef } from '../../../utils/toast';
import { useNavigate } from 'react-router-dom';


interface User {
    Id: string;
    username: string;
    email: string;
    is_superuser: boolean;
    first_name?: string;
    last_name?: string;
    birth_date?: Date | null;
    phone_number?: string | undefined;
    address?: string;
    city?: string;
    country?: string;
    IdCompany?: string | null;
    DateCreated: Date;
    DateChanged: Date;
}

const UserBrowseView: React.FC = () => {
    const { user, setUser } = useUser();
    const [users, setUsers] = useState<User[]>([]);
    const toast = useRef<Toast>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const userFetchedRef = useRef<Boolean>(false);
    const toastLoadFormShown = useRef<Boolean>(false);  // Flag to track if toast has been shown
    
    useEffect(() => {
        // If the user is not available in the context, we just return
        if (!user || !user.Id ) {
            setLoading(true);
            return;
        }
        if (userFetchedRef.current){
            return;
        }

        fetchCompanyUsers();
    }, [user]); // This will run whenever the `user` context changes


    const fetchCompanyUsers = async () => {
        try {

            const companydata = {
                IdUser: user?.Id,
            };

                
            const response = await api.post('/companies/get_company_workers', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setUsers(response.data);
                showToast(toastLoadFormShown, toast);
                
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
        } finally {
            setLoading(false);
            
        }
    };

    const printWorkers = async () => {
        try {

            const companydata = {
                IdUser: user?.Id,
            };

                
            const response = await api.post('/reports/create_user_reports', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            debugger;
            if (response.status === 200) {
                const reportUrl = response.data.url;
                // Open the report in a new tab
                window.open(reportUrl, '_blank');
                showToastWithOutLoadRef(toast, 'success', "Uspeh", "Poročilo ustvarjeno");
                
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
        } finally {
            setLoading(false);
            
        }
    };

    const handleEdit = (user_selected: User) => {
        navigate(`/workers/edit/${user_selected.Id}`);
        // navigate(`/edit-user/${user.Id}`) or open a dialog
    };

    const handleDelete = async (user_selected: User) => {
        try {

            const user_data = {
                Id: user_selected.Id,
            };

                
            const response = await api.post('/users/delete_user', user_data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
        
                showToastWithOutLoadRef(toast, 'success', "Uspeh", "Uporabnik izbrisan");
                fetchCompanyUsers();
                
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
            showToastWithOutLoadRef(toast, 'error', "Napaka", "Uporabnika ni bilo mogoče izbrisati");
        } finally {
            setLoading(false);
            
        }
    };

    const actionTemplate = (rowData: User) => (
        <div className="flex gap-2 justify-center">
            <Button 
                icon="pi pi-pencil" 
                className="p-button-rounded p-button-text p-button-info" 
                tooltip="Uredi"
                onClick={() => handleEdit(rowData)} 
            />
            {rowData.Id !== user?.Id && (
                <Button 
                    icon="pi pi-trash" 
                    className="p-button-rounded p-button-text p-button-danger" 
                    tooltip="Izbriši"
                    onClick={() => handleDelete(rowData)} 
                />
            )}
        </div>
    );

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <Toast ref={toast} />
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-6 mb-10">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Delavci podjetja
                    </h2>
                </div>
                <Button 
                    label="Ustvari uporabnika" 
                    icon="pi pi-plus"
                    severity="success"
                    className="p-button-raised" 
                    onClick={() => navigate('/workers/create')}
                />
                <Button
                    label="Izpis podatkov"
                    iconPos="right"
                    icon="pi pi-print"
                    onClick={printWorkers} />
            </div>

            {/* Table Section */}

            <DataTable 
                value={users} 
                paginator 
                rows={10} 
                stripedRows
                emptyMessage="Ni najdenih uporabnikov"
                className="p-datatable-sm"
                rowHover
                size="small"
                scrollable
                scrollHeight="400px"
                currentPageReportTemplate="Prikazano {first} do {last} od {totalRecords} uporabnikov"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[5, 10, 25, 50]}
            >
                <Column 
                    field="Id" 
                    header="Id" 
                    sortable 
                    className="font-semibold"
                />
                <Column 
                    field="username" 
                    header="Uporabniško ime" 
                    sortable 
                    className="font-semibold"
                />
                <Column 
                    field="email" 
                    header="Email" 
                    sortable
                    className="text-blue-600"
                />
                <Column 
                    field="first_name" 
                    header="Ime" 
                    sortable
                />
                <Column 
                    field="last_name" 
                    header="Priimek" 
                    sortable
                />
                <Column 
                    header="Dejanja" 
                    body={actionTemplate} 
                    style={{ width: '150px' }}
                    className="text-center"
                />
            </DataTable>

        </div>
    );
};

export default UserBrowseView;