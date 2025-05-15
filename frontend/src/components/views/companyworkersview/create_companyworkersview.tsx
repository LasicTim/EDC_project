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

interface User {
    Id: string;
    username: string;
    email: string;
    is_superuser: boolean;
    first_name?: string;
    last_name?: string;
    birth_date?: Date | null;
    phone_number?: string | null;
    address?: string;
    city?: string;
    country?: string;
    IdCompany?: string | null;
    password?: string | null;
    DateCreated: Date;
    DateChanged: Date;
}

const initialWorker: User = {
    Id: '',
    username: '',
    email: '',
    is_superuser: false,
    first_name: '',
    last_name: '',
    birth_date: null,
    phone_number: null,
    address: '',
    city: '',
    country: '',
    IdCompany: null,
    DateCreated: new Date(),
    DateChanged: new Date(),
}

const UserCreateView: React.FC = () => {
    const [userdata, setUserData]  = useState<User>(initialWorker);
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
        if (!userdata?.username) {
            showToastWithOutLoadRef(updateErrorToast, 'error', "Posodobitev", "Uporabniško ime je obvezno");
            return false;
        }
        if (!userdata?.email) {
            showToastWithOutLoadRef(updateErrorToast, 'error',"Posodobitev", "Elektronska pošta je obezna");
            return false;
        }
        return true;
    };


    const createUser = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            console.log('userdata:', userdata);

            const response = await api.post('/users/create_worker', userdata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Ustvarjanje", "Delavec ustvarjen");
                console.log('Created worker successful',response.data );
                setUserData(response.data);
                userFetchedRef.current = true;

                //navigate('/workers/edit/' + response.data.Id);
                navigate('/workers');
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Created worker failed:', error.response.data.detail);
            } else {
                console.error('Created worker failed:', error);
            }
            // Handle error (show error message to user)
        } finally {
            setLoading(false)
            
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


    return (
        <div className='userview'>
            <Card title="Ustvarjanje Delavca" className='card'>
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Ustvari delavca" iconPos="right" icon="pi pi-check" loading={loading} onClick={createUser} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={userdata?.username ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, username: e.target.value } : { username: e.target.value } as User
                                    )} tooltip="Vnesite veljavno uporabniško ime" required/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="first_name" value={userdata?.first_name ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, first_name: e.target.value } : { first_name: e.target.value } as User
                                    )} />
                                    <label htmlFor="first_name">Ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="last_name" value={userdata?.last_name ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, last_name: e.target.value } : { last_name: e.target.value } as User
                                    )} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="last_name">Priimek</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <Calendar  
                                        inputId="birth_date"
                                        value={userdata?.birth_date ?? null} // Ensure it's never null
                                        onChange={(e) => setUserData((prev) =>
                                            prev ? { ...prev, birth_date: e.target.value } : { birth_date: e.target.value } as User
                                        )}
                                        showIcon 
                                    />
                                    <label htmlFor="birth_date">Datum rojstva</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="address" value={userdata?.address ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, address: e.target.value } : { address: e.target.value } as User
                                    )} />
                                    <label htmlFor="address">Naslov</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="city" value={userdata?.city ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, city: e.target.value } : { city: e.target.value } as User
                                    )} />
                                    <label htmlFor="city">Mesto</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="country" value={userdata?.country ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, country: e.target.value } : { country: e.target.value } as User
                                    )} />
                                    <label htmlFor="country">Država</label>
                                </FloatLabel>
                            </div>
                            
                            
                            
                        </div>
                       
                    </TabPanel>
                    <TabPanel header="Dosegljivost">
                        <div className='inputs'>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="email" value={userdata?.email ?? ''} onChange={(e) => setUserData((prev) =>
                                        prev ? { ...prev, email: e.target.value } : { email: e.target.value } as User
                                    )} keyfilter="email" required />
                                    <label htmlFor="email">Elektronski naslov</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputMask  
                                        id="phone_number" 
                                        value={userdata?.phone_number ?? ''} // Ensure it's never null
                                        onChange={(e) => setUserData((prev) =>
                                            prev ? { ...prev, phone_number: e.target.value } : { phone_number: e.target.value } as User
                                        )}
                                        mask="999-999-999"
                                    />
                                    <label htmlFor="phone_number">Telefonska št.</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Card>
        </div>
    );
};

export default UserCreateView;