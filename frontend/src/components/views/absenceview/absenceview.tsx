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


export interface Absence {
    Id: string;
    IdWorker: string;
    DateCreated: Date;
    DateChanged: Date;
    DateFrom: Date | null;
    DateTo: Date | null;
    Comment: string | null;
    Reason: string | null;
}

const AbsenceBrowseView: React.FC = () => {
    const { user, setUser } = useUser();
    const [absences, setAbsences] = useState<Absence[]>([]);
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

        fetchCompanyAbsences();
    }, [user]); // This will run whenever the `user` context changes


    const fetchCompanyAbsences = async () => {
        try {

            const companydata = {
                Id_user: user?.Id,
            };


            const response = await api.post('/absence/get_company_workers_absences', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setAbsences(response.data);
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

    const handleEdit = (absence_selected: Absence) => {
        navigate(`/absence/edit/${absence_selected.Id}`);
        // navigate(`/edit-user/${user.Id}`) or open a dialog
    };

    const handleDelete = async (absence_selected: Absence) => {
        try {

            const absence_data = {
                Id: absence_selected.Id,
            };


            const response = await api.post('/absence/delete_absence', absence_data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {

                showToastWithOutLoadRef(toast, 'success', "Uspeh", "Odsotnost izbrisana");
                fetchCompanyAbsences();

            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
            showToastWithOutLoadRef(toast, 'error', "Napaka", "Odsotnost ni bila mogoče izbrisati");
        } finally {
            setLoading(false);
        }
    };

    const actionTemplate = (rowData: Absence) => (
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
                        Odsotnosti podjetja
                    </h2>
                </div>
                <Button
                    label="Ustvari odsotnost"
                    icon="pi pi-plus"
                    severity="success"
                    className="p-button-raised"
                    onClick={() => navigate('/absence/create')}
                />
            </div>

            {/* Table Section */}

            <DataTable
                value={absences}
                paginator
                rows={10}
                stripedRows
                emptyMessage="Ni najdenih odsotnosti"
                className="p-datatable-sm"
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
                    field="Reason"
                    header="Razlog"
                    body={(rowData) => rowData.Reason}
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

export default AbsenceBrowseView;