
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

import { ProgressSpinner } from 'primereact/progressspinner';
import { User } from '../views/userview/userview';
import { Toast } from 'primereact/toast';
import { api } from '../../api';
import { showToast, showToastWithOutLoadRef } from '../../utils/toast';
import DatatablePicker from './datatablepicker';

interface WorkerPickerProps {
    currentUserId: string;
    selectedId?: string;
    idField?: string;
    onSelect: (user: User | null) => void;
}

export const WorkerPicker: React.FC<WorkerPickerProps> = ({ currentUserId, selectedId, idField, onSelect }) => {
    const [userData, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const fetchCompanyUsers = async () => {
            try {
                setLoading(true);
                const response = await api.post('/companies/get_company_workers', {
                    IdUser: currentUserId,
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    setUsers(response.data);
                    console.log("users", userData);
                }
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.detail);
                } else {
                    setError('Napaka pri nalaganju uporabnikov');
                }
            } finally {
                setLoading(false);
            }
        };
        console.log("currentUserId", currentUserId);
        if (!currentUserId) {
            setError('ID uporabnika ni določen');
            return;
        } else {
            fetchCompanyUsers();
        }
    }, [currentUserId]);

    const userColumns = [
        { field: 'first_name', header: 'Ime' },
        { field: 'last_name', header: 'Priimek' },
        { field: 'email', header: 'E-pošta' }
    ];

    if (loading) {
        return <ProgressSpinner />;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <>  
            <Toast ref={toast} />
            <DatatablePicker
                onSelect={onSelect}
                data={userData}
                columns={userColumns}
                label="Izberi delavca"
                maxWidth="600px"
                selectedId={selectedId}
                idField={idField}
            />
        </>
    );
};
