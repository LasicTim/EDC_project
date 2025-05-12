import React, { useEffect, useRef, useState } from 'react';
import TinyMCEEditor from '../../tinymceeditor';
import "./userview.css";
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

interface User {
    Id: string;
    username: string;
    email: string;
    is_superuser: boolean;
    first_name?: string;
    last_name?: string;
    birth_date?: Date | null;
    phone_number?: string | undefined;
    address?: string;
    city?: string;
    country?: string;
    IdCompany?: string | null;
    DateCreated: Date;
    DateChanged: Date;
}


const UserView: React.FC = () => {
    const [content, setContent] = useState("");
    const [userdata, setUserData]  = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, setUser } = useUser();

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


    useEffect(() => {
        // If the user is not available in the context, we just return
        if (!user || !user.Id ) {
            setLoading(true);
            return;
        }
        if (userFetchedRef.current){
            return;
        }

        const fetchUser = async () => {
            try {

                const userData = {
                    Id: user?.Id,
                };

                    
                const response = await api.post('/users/get_user_data', userData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setUserData(response.data[0]);
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

        fetchUser();
    }, [user]); // This will run whenever the `user` context changes

    const updateUser = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);

            console.log('userdata:', userdata);

            const response = await api.post('/users/update_user', userdata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Posodobitev", "Uporabnik posodobljen");
                console.log('Updated user successful',response.data );
                setUserData(response.data);
                userFetchedRef.current = true;
                
                
            }
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Updated user failed:', error.response.data.detail);
            } else {
                console.error('Updated user failed:', error);
            }
            // Handle error (show error message to user)
        } finally {
            if (userdata && user) {
                setUser({
                    username: userdata.username,
                    Id: user.Id
                });
            }
            setLoading(false)
            
        }
    };


    return (
        <div className='userview'>
            <Card title="Urejanje osebnih podatkov">
                <div className='FormSaveButton'>
                    <Toast ref={toast}></Toast>
                    <Toast ref={updateErrorToast}></Toast>
                    <Button label="Posodobi podatke" iconPos="right" icon="pi pi-check" loading={loading} onClick={updateUser} />
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
                                        value={userdata?.birth_date ? new Date(userdata.birth_date) : undefined} // Convert string to Date
                                        onChange={(e) => 
                                            setUserData((prev) => {
                                                if (!prev) return null;

                                                return { 
                                                    ...prev, 
                                                    birth_date: e.value ?? undefined // Ensure undefined instead of null
                                                };
                                            })
                                        }
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
                                        value={userdata?.phone_number ?? undefined} // Ensure it's never null
                                        onChange={(e) => 
                                            setUserData((prev) => {
                                                if (!prev) return null; // If prev is null, return null to maintain state integrity
                                                
                                                return { 
                                                    ...prev, 
                                                    phone_number: e.target.value ?? undefined // Convert null to undefined
                                                };
                                            })
                                        } 
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

export default UserView;