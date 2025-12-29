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
import { CustomTemplate } from './custom_template';
import { Dropdown } from 'primereact/dropdown';
import { WorkerPicker } from '../../picker/workerpicker';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';

const initialWorkTime: CustomTemplate = {
    Id: '',
    IdWorker: '',
    DateCreated: new Date(),
    DateChanged: new Date(),
    title: '',
    content: '',
};



const CustomTemplateCreateView: React.FC = () => {
    const [customTemplateData, setCustomTemplateData] = useState<CustomTemplate>(initialWorkTime);
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
        if (!customTemplateData?.title) {
            msg.push("Naslov je obvezen podatek");

        }
        if (msg.length > 0) {
            showToastWithOutLoadRef(updateErrorToast, 'error', "Ustvarjanje", msg.join(", "));
            return false;
        }
        return true;
    };


    const createCustomTemplate = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            debugger;

            console.log('customTemplateData:', customTemplateData);

            const response = await api.post('/custom_template/create_custom_template', customTemplateData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Ustvarjanje", "Predloga ustvarjena");
                console.log('Created custom template successful',response.data );
                setCustomTemplateData(response.data);
                userFetchedRef.current = true;

                //navigate('/workers/edit/' + response.data.Id);
                navigate('/custom_templates');
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Created custom template failed:', error.response.data.detail);
            } else {
                console.error('Created custom template failed:', error);
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
            const newTemplateData = customTemplateData
                ? { ...customTemplateData, IdWorker: user?.Id || '' }
                : customTemplateData;

            setCustomTemplateData(newTemplateData);
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
            <Card title="Ustvarjanje Predloge" className='card'>
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Ustvari predlogo" iconPos="right" icon="pi pi-check" loading={loading} onClick={createCustomTemplate} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            
                            <div className='input'>
                                <FloatLabel>
                                
                                <InputText
                                    id="title"
                                    value={customTemplateData?.title ?? ''}
                                    onChange={(e) =>
                                        setCustomTemplateData((prev) =>
                                            prev ? { ...prev, title: e.target.value } : { title: e.target.value } as CustomTemplate
                                        )
                                    }
                                />
                                <label htmlFor="title">Ime predloge</label>
                                </FloatLabel>
                            </div>

                            <div className='input-lg'>
                                <label htmlFor="content">Vsebina</label>
                                <TinyMCEEditor
                                    onEditorChange={(newContent) => setCustomTemplateData((prev) =>
                                        prev ? { ...prev, content: newContent } : { content: newContent } as CustomTemplate
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

export default CustomTemplateCreateView;