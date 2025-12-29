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
import { formatDate, formatTime } from '../../../utils/time';


export interface CustomTemplate {
    Id: string;
    IdWorker: string;
    title: string;
    content: string;
    DateCreated: Date;
    DateChanged: Date;
}

const CustomTemplateBrowseView: React.FC = () => {
    const { user, setUser } = useUser();
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
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

        fetchUserCustomTemplates();
    }, [user]); // This will run whenever the `user` context changes


    const fetchUserCustomTemplates = async () => {
        try {

            const companydata = {
                IdWorker: user?.Id,
            };

                
            const response = await api.post('/custom_template/get_workers_custom_templates', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setCustomTemplates(response.data);
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

    const handleEdit = (customTemplate_selected: CustomTemplate) => {
        navigate(`/custom_templates/edit/${customTemplate_selected.Id}`);
        // navigate(`/edit-user/${user.Id}`) or open a dialog
    };

    const handleDelete = async (customTemplate_selected: CustomTemplate) => {
        try {

            const workTime_data = {
                Id: customTemplate_selected.Id,
            };


            const response = await api.post('/custom_template/delete_custom_template', workTime_data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {

                showToastWithOutLoadRef(toast, 'success', "Uspeh", "Predloga izbrisana");
                fetchUserCustomTemplates();

            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail);
            }
            showToastWithOutLoadRef(toast, 'error', "Napaka", "Predlogo ni bilo mogoče izbrisati");
        } finally {
            setLoading(false);
        }
    };

    const actionTemplate = (rowData: CustomTemplate) => (
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
        <div >
            <Toast ref={toast} />
            
            {/* Header Section */}
            <div >
                <div>
                    <h2>
                        Predloge
                    </h2>
                </div>
                <Button
                    label="Ustvari predlogo"
                    icon="pi pi-plus"
                    severity="success"
                    className="p-button-raised"
                    onClick={() => navigate('/custom_templates/create')}
                />
            </div>

            {/* Table Section */}

            <DataTable
                value={customTemplates}
                paginator
                rows={10}
                stripedRows
                emptyMessage="Ni najdenih predlog"
                rowHover
                size="small"
                scrollable
                scrollHeight="400px"
                currentPageReportTemplate="Prikazano {first} do {last} od {totalRecords} predlog"
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
                    field="title" 
                    header="Ime predloge" 
                    sortable 
                    className="font-semibold"
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

export default CustomTemplateBrowseView;