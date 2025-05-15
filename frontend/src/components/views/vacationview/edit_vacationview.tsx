import React, { useEffect, useRef, useState } from 'react';
import TinyMCEEditor from '../../tinymceeditor';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { TabPanel, TabView } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { api } from '../../../api';
import axios from 'axios';

import { useUser } from '../../../utils/UserContext';
import { Calendar } from 'primereact/calendar';
import { InputMask } from "primereact/inputmask";
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { showToast, showToastWithOutLoadRef } from '../../../utils/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Vacation } from './vacationview';
import { Dropdown } from 'primereact/dropdown';
import { WorkerPicker } from '../../picker/workerpicker';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';



const VacationEditView: React.FC = () => {
    const [vacationData, setVacationData] = useState<Vacation | null>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState('');
    const { user, setUser } = useUser();
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    //refs
    const toast = useRef<Toast>(null);
    const toastLoadFormShown = useRef<Boolean>(false);  // Flag to track if toast has been shown
    const updateErrorToast = useRef<Toast>(null);
    const userFetchedRef = useRef<Boolean>(false);

    const validateForm = (): boolean => {
        let msg: Array<string> = [];
        if (!vacationData?.DateFrom) {
            msg.push("Datum od je obvezno");

        }
        if (!vacationData?.DateTo) {
            msg.push("Datum do je obvezno");

        }
        if (!vacationData?.IdWorker) {
            msg.push("Delavec je obvezno");

        }
        if (msg.length > 0) {
            showToastWithOutLoadRef(updateErrorToast, 'error', "Ustvarjanje", msg.join(", "));
            return false;
        }
        return true;
    };


    const updateVacation = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            console.log('vacationData:', vacationData);

            const response = await api.post('/vacation/update_vacation', vacationData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Urejanje", "Dopust urejen");
                console.log('Updated vacation successful',response.data );
                setVacationData(response.data[0]);
                userFetchedRef.current = true;

                //navigate('/workers/edit/' + response.data.Id);
                navigate('/vacation');
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Updated vacation failed:', error.response.data.detail);
            } else {
                console.error('Updated vacation failed:', error);
            }
            // Handle error (show error message to user)
        } finally {
            setLoading(false);

        }
    };

    useEffect(() => {
        // If the user is not available in the context, we just return
        console.log("user", user);
        if (!user || !user.Id ) {
            setLoading(true);
            return;
        }
        if (userFetchedRef.current){
            return;
        }
        const fetchAbsence = async () => {
            try {
                const userData = {
                    Id: id,  // Use the id from URL instead of user.Id
                };

                const response = await api.post('/vacation/get_vacation', userData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    console.log("response", response.data);
                    setVacationData(response.data[0]);
                    setContent(response.data[0].Comment);
                    console.log("vacationdate", vacationData);
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

        fetchAbsence();

    }, [user]); // This will run whenever the `user` context changes

    if (!user?.Id) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <ProgressSpinner />
            </div>
        );
    }
    return (
        
        <div className='userview'>
            <Card title="Urejanje Dopusta" className='card'>
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Uredi dopust" iconPos="right" icon="pi pi-check" loading={loading} onClick={updateVacation} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className="input">
                                <WorkerPicker
                                    currentUserId={user?.Id ?? ''}
                                    selectedId={vacationData?.IdWorker ?? ''}
                                    onSelect={(user) => {
                                        setVacationData((prev) =>
                                            prev ? { ...prev, IdWorker: user?.Id ?? '' } : prev
                                        );
                                    }}
                                />
                            </div>

                            <div className='input'>
                                <FloatLabel>
                                    <Calendar
                                        id="DateFrom"
                                        value={vacationData?.DateFrom ? new Date(vacationData.DateFrom) : null}
                                        onChange={(e) =>
                                            setVacationData((prev) =>
                                                prev ? { ...prev, DateFrom: e.value ?? null } : prev
                                            )
                                        }
                                        showIcon
                                        dateFormat="dd.mm.yy"
                                        showButtonBar
                                        tooltip="Izberite datum začetka"
                                    />
                                    <label htmlFor="DateFrom">Datum od</label>
                                </FloatLabel>
                            </div>
                            <div className="input">
                                <FloatLabel>
                                    <Calendar
                                        id="DateTo"
                                        value={vacationData?.DateTo  ? new Date(vacationData.DateTo) : null}
                                        onChange={(e) =>
                                            setVacationData((prev) =>
                                                prev ? { ...prev, DateTo: e.value ?? null } : prev
                                            )
                                        }
                                        showButtonBar
                                        dateFormat="dd.mm.yy"
                                        showIcon
                                        tooltip="Izberite datum konca"
                                    />
                                    <label htmlFor="DateTo">Konec dopusta</label>
                                </FloatLabel>
                            </div>
                            

                            <div className='input-md'>
                                <label htmlFor="Comment">Komentar</label>
                                <TinyMCEEditor
                                    initialValue={content ?? ''}
                                    onEditorChange={(newContent) => setVacationData((prev) =>
                                        prev ? { ...prev, Comment: newContent } : { Comment: newContent } as Vacation
                                    )}
                                />
                            </div>
                            
                            
                        </div>
                       
                    </TabPanel>
                </TabView>
            </Card>
        </div>
    );
};

export default VacationEditView;