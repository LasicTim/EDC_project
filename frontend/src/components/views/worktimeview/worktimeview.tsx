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
import { workTypeOptions } from './create_worktimeview';
import { formatDate, formatTime } from '../../../utils/time';


export interface WorkTime {
    Id: string;
    IdWorker: string;
    WorkType: string;
    DateCreated: Date;
    DateChanged: Date;
    BreakTimeFrom: Date | null;
    BreakTimeTo: Date | null;
    HasBreakTime: boolean | undefined;
    WorkDate: Date | null;
    WorkTimeFrom: Date | null;
    WorkTimeTo: Date | null;
    Comment: string | null;
    PlaceOfWork: string | null;
}

const WorkTimeBrowseView: React.FC = () => {
    const { user, setUser } = useUser();
    const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
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

        fetchCompanyWorkTimes();
    }, [user]); // This will run whenever the `user` context changes


    const fetchCompanyWorkTimes = async () => {
        try {

            const companydata = {
                Id_user: user?.Id,
            };

                
            const response = await api.post('/worktime/get_company_workers_worktime', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setWorkTimes(response.data);
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

    const handleEdit = (workTime_selected: WorkTime) => {
        navigate(`/worktime/edit/${workTime_selected.Id}`);
        // navigate(`/edit-user/${user.Id}`) or open a dialog
    };

    const handleDelete = async (workTime_selected: WorkTime) => {
        try {

            const workTime_data = {
                Id: workTime_selected.Id,
            };


            const response = await api.post('/worktime/delete_worktime', workTime_data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {

                showToastWithOutLoadRef(toast, 'success', "Uspeh", "Delovni čas izbrisan");
                fetchCompanyWorkTimes();

            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
            showToastWithOutLoadRef(toast, 'error', "Napaka", "Delovni čas ni bil mogoče izbrisati");
        } finally {
            setLoading(false);
        }
    };

    const actionTemplate = (rowData: WorkTime) => (
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
    const getWorkTypeLabel = (value: string) => {
        const match = workTypeOptions.find(option => option.value === value);
        return match ? match.label : value; // fallback to raw value if no match
    };

    return (
        <div >
            <Toast ref={toast} />
            
            {/* Header Section */}
            <div >
                <div>
                    <h2>
                        Delovni časi podjetja
                    </h2>
                </div>
                <Button
                    label="Ustvari delovni čas"
                    icon="pi pi-plus"
                    severity="success"
                    className="p-button-raised"
                    onClick={() => navigate('/worktime/create')}
                />
            </div>

            {/* Table Section */}

            <DataTable
                value={workTimes}
                paginator
                rows={10}
                stripedRows
                emptyMessage="Ni najdenih delovnih časov"
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
                    field="username" 
                    header="Uporabniško ime" 
                    sortable 
                    className="font-semibold"
                />
                <Column 
                    field="WorkDate" 
                    header="Datum" 
                    body={(rowData) => formatDate(rowData.WorkDate)}
                    sortable
                    className="text-blue-600"
                />
                <Column 
                    field="WorkTimeFrom" 
                    header="Od" 
                    body={(rowData) => formatTime(rowData.WorkTimeFrom)}
                    sortable
                    className="text-blue-600"
                />
                <Column 
                    field="WorkTimeTo" 
                    header="Do" 
                    body={(rowData) => formatTime(rowData.WorkTimeTo)}
                    sortable
                />
                <Column 
                    field="WorkType" 
                    header="Vrsta dela" 
                    sortable
                    body={(rowData) => getWorkTypeLabel(rowData.WorkType)} 
                />
                <Column 
                    field="BreakTimeFrom" 
                    header="Odmor Od" 
                    body={(rowData) => formatTime(rowData.BreakTimeFrom)}
                    sortable
                />
                <Column 
                    field="BreakTimeTo" 
                    header="Odmor Do" 
                    body={(rowData) => formatTime(rowData.BreakTimeTo)}
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

export default WorkTimeBrowseView;