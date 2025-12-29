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
import { formatDate } from '../../../utils/time';


export interface Vacation {
    Id: string;
    IdWorker: string;
    DateCreated: Date;
    DateChanged: Date;
    DateFrom: Date | null;
    DateTo: Date | null;
    Comment: string | null;
}

const VacationBrowseView: React.FC = () => {
    const { user, setUser } = useUser();
    const [vacations, setVacations] = useState<Vacation[]>([]);
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

        fetchCompanyVacations();
    }, [user]); // This will run whenever the `user` context changes


    const fetchCompanyVacations = async () => {
        try {

            const companydata = {
                Id_user: user?.Id,
            };


            const response = await api.post('/vacation/get_company_workers_vacations', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setVacations(response.data);
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

    const handleEdit = (vacation_selected: Vacation) => {
        navigate(`/vacation/edit/${vacation_selected.Id}`);
        // navigate(`/edit-user/${user.Id}`) or open a dialog
    };

    const handleDelete = async (vacation_selected: Vacation) => {
        try {

            const vacation_data = {
                Id: vacation_selected.Id,
            };


            const response = await api.post('/vacation/delete_vacation', vacation_data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {

                showToastWithOutLoadRef(toast, 'success', "Uspeh", "Dopust izbrisana");
                fetchCompanyVacations();

            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
            showToastWithOutLoadRef(toast, 'error', "Napaka", "Dopusta ni bila mogoče izbrisati");
        } finally {
            setLoading(false);
        }
    };

    const actionTemplate = (rowData: Vacation) => (
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
        <div className="">
            <Toast ref={toast} />
            
            {/* Header Section */}
            <div className="">
                <div className="">
                    <h2 className="">
                        Dopusti podjetja
                    </h2>
                </div>
                <Button
                    label="Ustvari dopust"
                    icon="pi pi-plus"
                    severity="success"
                    className="p-button-raised"
                    onClick={() => navigate('/vacation/create')}
                />
            </div>

            {/* Table Section */}

            <DataTable
                value={vacations}
                paginator
                rows={10}
                stripedRows
                emptyMessage="Ni najdenih odsotnosti"
                rowHover
                size="small"
                scrollable
                scrollHeight="400px"
                currentPageReportTemplate="Prikazano {first} do {last} od {totalRecords} delovnih časov"
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
                    field="Username" 
                    header="Uporabniško ime" 
                    sortable 
                    className="font-semibold"
                />
                <Column 
                    field="DateFrom"
                    header="Od"
                    body={(rowData) => formatDate(rowData.DateFrom)}
                    sortable
                    className="text-blue-600"
                />
                <Column 
                    field="DateTo" 
                    header="Do" 
                    body={(rowData) => formatDate(rowData.DateTo)}
                    sortable
                    className="text-blue-600"
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

export default VacationBrowseView;