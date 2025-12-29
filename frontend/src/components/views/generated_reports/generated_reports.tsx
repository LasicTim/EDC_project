import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { api } from '../../../api';
import { useUser } from '../../../utils/UserContext';
import axios from 'axios';
import { showToast, showToastWithOutLoadRef } from '../../../utils/toast';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';


export interface GeneratedReport {
    name: string;
    url: string;
}

const GeneratedReportsBrowseView: React.FC = () => {
    const { user, setUser } = useUser();
    const [reports, setReports] = useState<GeneratedReport[]>([]);
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

        fetchGeneratedReports();
    }, [user]); // This will run whenever the `user` context changes


    const fetchGeneratedReports = async () => {
        try {

            const response = await api.get('/reports/get_all_reports', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setReports(response.data?.reports || []);
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

    const openDocument = (report: GeneratedReport) => {
        window.open(report.url, '_blank');
    }

    const actionTemplate = (rowData: GeneratedReport) => (
            <div className="flex gap-2 justify-center">
                <Button 
                    icon="pi pi-eye" 
                    className="p-button-rounded p-button-text p-button-info" 
                    tooltip="Odpri dokument"
                    onClick={() => openDocument(rowData)} 
                />
            </div>
        );

    return (
        <div >
            <Toast ref={toast} />
            
            {/* Header Section */}
            <div >
                <div>
                    <h2>
                        Dokumenti
                    </h2>
                </div>
            </div>

            {/* Table Section */}

            <DataTable
                value={reports}
                paginator
                rows={10}
                stripedRows
                emptyMessage="Ni najdenih dokumentov"
                rowHover
                size="small"
                scrollable
                scrollHeight="400px"
                currentPageReportTemplate="Prikazano {first} do {last} od {totalRecords} dokumentov"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[5, 10, 25, 50]}
            >
                <Column 
                    field="name" 
                    header="Ime dokumenta" 
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

export default GeneratedReportsBrowseView;