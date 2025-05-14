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
import { WorkTime } from './worktimeview';
import { Dropdown } from 'primereact/dropdown';
import { WorkerPicker } from '../../picker/workerpicker';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';
import { workTypeOptions } from './create_worktimeview';




const WorkTimeEditView: React.FC = () => {
    const [workTimeData, setWorkTimeData] = useState<WorkTime | null>(null);
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
        if (!workTimeData?.WorkTimeFrom) {
            msg.push("Delo od je obvezno");

        }
        if (!workTimeData?.WorkTimeTo) {
            msg.push("Delo do je obvezno");

        }
        if (!workTimeData?.IdWorker) {
            msg.push("Delavec je obvezno");

        }
        if (!workTimeData?.WorkDate) {
            msg.push("Datum dela je obvezno");

        }
        if (!workTimeData?.WorkType) {
            msg.push("Vrsta dela je obvezno");

        }
        if (msg.length > 0) {
            showToastWithOutLoadRef(updateErrorToast, 'error', "Ustvarjanje", msg.join(", "));
            return false;
        }
        return true;
    };


    const updateWorkTime = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            console.log('workTimeData:', workTimeData);

            const response = await api.post('/worktime/update_worktime', workTimeData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Urejanje", "Delovni čas urejen");
                console.log('Updated work time successful',response.data );
                setWorkTimeData(response.data[0]);
                userFetchedRef.current = true;

                //navigate('/workers/edit/' + response.data.Id);
                navigate('/worktime');
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Updated work time failed:', error.response.data.detail);
            } else {
                console.error('Updated work time failed:', error);
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
        const fetchWorkTime = async () => {
            try {
                const userData = {
                    Id: id,  // Use the id from URL instead of user.Id
                };
                    
                const response = await api.post('/worktime/get_worktime', userData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    console.log("response", response.data);
                    setWorkTimeData(response.data[0]);
                    setContent(response.data[0].Comment);
                    console.log("worktimedate", workTimeData);
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

        fetchWorkTime();

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
            <Card title="Ustvarjanje Delovnega časa" className='card'>
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Uredi delovni čas" iconPos="right" icon="pi pi-check" loading={loading} onClick={updateWorkTime} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className="input">
                                <WorkerPicker
                                    currentUserId={user?.Id ?? ''}
                                    selectedId={workTimeData?.IdWorker ?? ''}
                                    onSelect={(user) => {
                                        setWorkTimeData((prev) =>
                                            prev ? { ...prev, IdWorker: user?.Id ?? '' } : prev
                                        );
                                    }}
                                />
                            </div>
                            <div className="input">
                                <FloatLabel>
                                    <Dropdown
                                        id="WorkType"
                                        value={workTimeData?.WorkType ?? ''}
                                        options={workTypeOptions}
                                        onChange={(e) =>
                                            setWorkTimeData((prev) =>
                                                prev ? { ...prev, WorkType: e.value } : prev
                                            )
                                        }
                                        optionLabel="label"
                                        placeholder="Izberite tip dela"
                                        tooltip="Izberite tip dela"
                                    />
                                    <label htmlFor="WorkType">Tip dela</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <Calendar
                                        id="WorkDate"
                                        value={workTimeData?.WorkDate ? new Date(workTimeData.WorkDate) : null}
                                        onChange={(e) =>
                                            setWorkTimeData((prev) =>
                                                prev ? { ...prev, WorkDate: e.value ?? null } : prev
                                            )
                                        }
                                        showIcon
                                        dateFormat="dd.mm.yy"
                                        showButtonBar
                                        tooltip="Izberite datum"
                                    />
                                    <label htmlFor="WorkDate">Datum dela</label>
                                </FloatLabel>
                            </div>
                            <div className="input">
                                <FloatLabel>
                                    <Calendar
                                        id="WorkTimeFrom"
                                        value={workTimeData?.WorkTimeFrom ? new Date(workTimeData.WorkTimeFrom) : null}
                                        onChange={(e) =>
                                            setWorkTimeData((prev) =>
                                                prev ? { ...prev, WorkTimeFrom: e.value ?? null } : prev
                                            )
                                        }
                                        timeOnly
                                        hourFormat="24"
                                        showIcon
                                        tooltip="Izberite čas začetka"
                                    />
                                    <label htmlFor="WorkTimeFrom">Začetek dela</label>
                                </FloatLabel>
                            </div>
                            
                            <div className="input">
                                <FloatLabel>
                                    <Calendar
                                        id="WorkTimeTo"
                                        value={workTimeData?.WorkTimeTo ? new Date(workTimeData.WorkTimeTo) : null}
                                        onChange={(e) =>
                                            setWorkTimeData((prev) =>
                                                prev ? { ...prev, WorkTimeTo: e.value ?? null } : prev
                                            )
                                        }
                                        timeOnly
                                        hourFormat="24"
                                        showIcon
                                        tooltip="Izberite čas konca"
                                    />
                                    <label htmlFor="WorkTimeTo">Konec dela</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                
                                <InputText
                                    id="PlaceOfWork"
                                    value={workTimeData?.PlaceOfWork ?? ''}
                                    onChange={(e) =>
                                        setWorkTimeData((prev) =>
                                            prev ? { ...prev, PlaceOfWork: e.target.value } : { PlaceOfWork: e.target.value } as WorkTime
                                        )
                                    }
                                />
                                <label htmlFor="PlaceOfWork">Kraj dela</label>
                                </FloatLabel>
                            </div>

                            <div className="input">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        inputId="HasBreakTime"
                                        checked={workTimeData?.HasBreakTime ?? false}
                                        onChange={(e) =>
                                            setWorkTimeData((prev) =>
                                                prev ? { ...prev, HasBreakTime: e.checked } : { HasBreakTime: e.checked } as WorkTime
                                            )
                                        }
                                    />
                                    <label htmlFor="HasBreakTime">Imate odmor?</label>
                                </div>
                            </div>

                            {workTimeData?.HasBreakTime && (
                                <>
                                    <div className="input">
                                        <FloatLabel>
                                            <Calendar
                                                id="BreakTimeFrom"
                                                value={workTimeData?.BreakTimeFrom ? new Date(workTimeData.BreakTimeFrom) : null}
                                                onChange={(e) =>
                                                    setWorkTimeData((prev) =>
                                                        prev ? { ...prev, BreakTimeFrom: e.value ?? null } : prev
                                                    )
                                                }
                                                timeOnly
                                                hourFormat="24"
                                                showIcon
                                                tooltip="Začetek odmora"
                                            />
                                            <label htmlFor="BreakTimeFrom">Začetek odmora</label>
                                        </FloatLabel>
                                    </div>

                                    <div className="input">
                                        <FloatLabel>
                                            <Calendar
                                                id="BreakTimeTo"
                                                value={workTimeData?.BreakTimeTo ? new Date(workTimeData.BreakTimeTo) : null}
                                                onChange={(e) =>
                                                    setWorkTimeData((prev) =>
                                                        prev ? { ...prev, BreakTimeTo: e.value ?? null } : prev
                                                    )
                                                }
                                                timeOnly
                                                hourFormat="24"
                                                showIcon
                                                tooltip="Konec odmora"
                                            />
                                            <label htmlFor="BreakTimeTo">Konec odmora</label>
                                        </FloatLabel>
                                    </div>
                                </>
                            )}

                            <div className='input-md'>
                                <label htmlFor="Comment">Komentar</label>
                                <TinyMCEEditor
                                    initialValue={content ?? ''}
                                    onEditorChange={(newContent) => setWorkTimeData((prev) =>
                                        prev ? { ...prev, Comment: newContent } : { Comment: newContent } as WorkTime
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

export default WorkTimeEditView;