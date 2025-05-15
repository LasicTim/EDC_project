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
import { Absence } from './absenceview';
import { Dropdown } from 'primereact/dropdown';
import { WorkerPicker } from '../../picker/workerpicker';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';

const initialAbsence: Absence = {
    Id: '',
    IdWorker: '',
    DateCreated: new Date(),
    DateChanged: new Date(),
    DateFrom: null,
    DateTo: null,
    Reason: '',
    Comment: '',

};



const AbsenceCreateView: React.FC = () => {
    const [absenceData, setAbsenceData] = useState<Absence>(initialAbsence);
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
        if (!absenceData?.DateFrom) {
            msg.push("Datum od je obvezno");

        }
        if (!absenceData?.DateTo) {
            msg.push("Datum do je obvezno");

        }
        if (!absenceData?.IdWorker) {
            msg.push("Delavec je obvezno");

        }
        if (!absenceData?.Reason) {
            msg.push("Razlog odsotnosti je obvezno");

        }
        if (msg.length > 0) {
            showToastWithOutLoadRef(updateErrorToast, 'error', "Ustvarjanje", msg.join(", "));
            return false;
        }
        return true;
    };


    const createAbsence = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            console.log('absenceData:', absenceData);

            const response = await api.post('/absence/create_absence', absenceData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Ustvarjanje", "Odsotnost ustvarjena");
                console.log('Created absence successful',response.data );
                setAbsenceData(response.data);
                userFetchedRef.current = true;

                //navigate('/workers/edit/' + response.data.Id);
                navigate('/absence');
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Created absence failed:', error.response.data.detail);
            } else {
                console.error('Created absence failed:', error);
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
            <Card title="Ustvarjanje Odsotnosti" className='card'>
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Ustvari odsotnost" iconPos="right" icon="pi pi-check" loading={loading} onClick={createAbsence} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className="input">
                                <WorkerPicker
                                    currentUserId={user.Id}
                                    onSelect={(user) => {
                                        setAbsenceData((prev) =>
                                            prev ? { ...prev, IdWorker: user?.Id ?? '' } : prev
                                        );
                                    }}
                                />
                            </div>

                            <div className='input'>
                                <FloatLabel>
                                    <Calendar
                                        id="DateFrom"
                                        value={absenceData?.DateFrom ?? null}
                                        onChange={(e) =>
                                            setAbsenceData((prev) =>
                                                prev ? { ...prev, DateFrom: e.value ?? null } : prev
                                            )
                                        }
                                        showIcon
                                        dateFormat="dd.mm.yy"
                                        showButtonBar
                                        tooltip="Izberite datum začetka"
                                    />
                                    <label htmlFor="DateFrom">Začetek odsotnosti</label>
                                </FloatLabel>
                            </div>
                            <div className="input">
                                <FloatLabel>
                                    <Calendar
                                        id="DateTo"
                                        value={absenceData?.DateTo ?? null}
                                        onChange={(e) =>
                                            setAbsenceData((prev) =>
                                                prev ? { ...prev, DateTo: e.value ?? null } : prev
                                            )
                                        }
                                        showButtonBar
                                        dateFormat="dd.mm.yy"
                                        showIcon
                                        tooltip="Izberite datum konca"
                                    />
                                    <label htmlFor="DateTo">Konec odsotnosti</label>
                                </FloatLabel>
                            </div>
                            
                            <div className="input">
                                <FloatLabel>
                                                                
                                    <InputText
                                        id="Reason"
                                        value={absenceData?.Reason ?? ''}
                                        onChange={(e) =>
                                            setAbsenceData((prev) =>
                                                prev ? { ...prev, Reason: e.target.value } : { Reason: e.target.value } as Absence
                                            )
                                        }
                                    />
                                    <label htmlFor="Reason">Razlog odsotnosti</label>
                                </FloatLabel>
                            </div>
                            

                            <div className='input-md'>
                                <label htmlFor="Comment">Komentar</label>
                                <TinyMCEEditor
                                    onEditorChange={(newContent) => setAbsenceData((prev) =>
                                        prev ? { ...prev, Comment: newContent } : { Comment: newContent } as Absence
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

export default AbsenceCreateView;