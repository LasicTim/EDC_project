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
import { useNavigate } from 'react-router-dom';
import { Vacation } from './vacationview';
import { Dropdown } from 'primereact/dropdown';
import { WorkerPicker } from '../../picker/workerpicker';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';

const initialVacation: Vacation = {
    Id: '',
    IdWorker: '',
    DateCreated: new Date(),
    DateChanged: new Date(),
    DateFrom: null,
    DateTo: null,
    Comment: '',

};



const VacationCreateView: React.FC = () => {
    const [vacationData, setVacationData] = useState<Vacation>(initialVacation);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, setUser } = useUser();

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


    const createVacation = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            console.log('vacationData:', vacationData);

            const response = await api.post('/vacation/create_vacation', vacationData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Ustvarjanje", "Dopust je ustvarjen");
                console.log('Created vacation successful',response.data );
                setVacationData(response.data);
                userFetchedRef.current = true;

                //navigate('/workers/edit/' + response.data.Id);
                navigate('/vacation');
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Created vacation failed:', error.response.data.detail);
            } else {
                console.error('Created vacation failed:', error);
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
        }else{
            setLoading(false);
        }
        if (userFetchedRef.current){
            return;
        }


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
            <Card title="Ustvarjanje Dopusta" className='card'>
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Ustvari dopust" iconPos="right" icon="pi pi-check" loading={loading} onClick={createVacation} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className="input">
                                <WorkerPicker
                                    currentUserId={user.Id}
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
                                        value={vacationData?.DateFrom ?? null}
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
                                    <label htmlFor="DateFrom">Začetek dopusta</label>
                                </FloatLabel>
                            </div>
                            <div className="input">
                                <FloatLabel>
                                    <Calendar
                                        id="DateTo"
                                        value={vacationData?.DateTo ?? null}
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

export default VacationCreateView;