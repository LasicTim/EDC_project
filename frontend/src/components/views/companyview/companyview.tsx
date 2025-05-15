import React, { useEffect, useRef, useState } from 'react';
import TinyMCEEditor from '../../tinymceeditor';
import "./companyview.css";
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

interface Company {
    Id: string;
    name: string;
    email: string;
    phone_number?: string | undefined;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    DateCreated: Date;
    DateChanged: Date;
    Active: boolean;
}
interface CreateCompany {
    Id: string;
    name: string;
    address: string;
    email: string;
    IdUser: string
    DateCreated: Date;
    DateChanged: Date;
}


const CompanyView: React.FC = () => {
    const [companydata, setcompanydata]  = useState<Company | null>(null);
    const [createcompanydata, setcreatecompanydata]  = useState<CreateCompany| null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, setUser } = useUser();

    //refs
    const toast = useRef<Toast>(null);
    const toastLoadFormShown = useRef<Boolean>(false);  // Flag to track if toast has been shown
    const updateErrorToast = useRef<Toast>(null);
    const createtoast = useRef<Toast>(null);
    const createErrorToast = useRef<Toast>(null);
    const userFetchedRef = useRef<Boolean>(false);

    const validateForm = (): boolean => {
        if (!companydata?.name) {
            showToastWithOutLoadRef(updateErrorToast, 'error', "Posodobitev", "Ime podjetja je obvezno");
            return false;
        }
        if (!companydata?.email) {
            showToastWithOutLoadRef(updateErrorToast, 'error',"Posodobitev", "Elektronska pošta je obezna");
            return false;
        }
        return true;
    };
    const validateCreateForm = (): boolean => {
        if (!createcompanydata?.name) {
            showToastWithOutLoadRef(createErrorToast, 'error', "Posodobitev", "Ime podjetja je obvezno");
            return false;
        }
        if (!createcompanydata?.address) {
            showToastWithOutLoadRef(createErrorToast, 'error',"Posodobitev", "Elektronska pošta je obezna");
            return false;
        }
        if (!createcompanydata?.email) {
            showToastWithOutLoadRef(createErrorToast, 'error',"Posodobitev", "Elektronska pošta je obezna");
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

        const fetchCompany = async () => {
            try {

                const companydata = {
                    IdUser: user?.Id,
                };

                    
                const response = await api.post('/companies/get_company', companydata, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    setcompanydata(response.data[0]);
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

        fetchCompany();
    }, [user]); // This will run whenever the `user` context changes

    const updateCompnay = async () => {
        if (!validateForm()) return;

        try {

            setLoading(true);
            
            console.log('companydata:', companydata);

            const response = await api.post('/companies/update_company', companydata, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Posodobitev", "Podjetje posodobljeno");
                console.log('Updated company successful',response.data );
                setcompanydata(response.data);
                userFetchedRef.current = true;
                
                
            }
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Create company failed:', error.response.data.detail);
            } else {
                console.error('Create company failed:', error);
            }
            // Handle error (show error message to user)
        } finally {
            setLoading(false)
            
        }
    };

    const createCompnay = async () => {
        if (!validateCreateForm()) return;

        try {

            setLoading(true);

            const payload = {
                ...createcompanydata,
                IdUser: user?.Id
            };

            const response = await api.post('/companies/create_company', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                showToastWithOutLoadRef(updateErrorToast, 'success',"Posodobitev", "Podjetje istvarjeno");
                console.log('Create company successful',response.data );
                setcompanydata(response.data);
                userFetchedRef.current = true;
                
                
            }
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Create company failed:', error.response.data.detail);
            } else {
                console.error('Create company failed:', error);
            }
            // Handle error (show error message to user)
        } finally {
            setLoading(false)
            
        }
    };


    return (
        <div className='companyview'>
            <Toast ref={toast}></Toast>
            <Toast ref={updateErrorToast}></Toast>
            <Toast ref={createtoast}></Toast>
            <Toast ref={createErrorToast}></Toast>
            { companydata ? (
            <Card title="Urejanje podatkov podjetja">
                <div className='FormSaveButton'>

                    <Button label="Posodobi podatke" iconPos="right" icon="pi pi-check" loading={loading} onClick={updateCompnay} />
                </div>
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="name" value={companydata?.name ?? ''} onChange={(e) => setcompanydata((prev) =>
                                        prev ? { ...prev, name: e.target.value } : { name: e.target.value } as Company
                                    )} tooltip="Vnesite veljavno ime" required/>
                                    <label htmlFor="name">Ime podjetja</label>
                                </FloatLabel>
                            </div>
                            
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="address" value={companydata?.address ?? ''} onChange={(e) => setcompanydata((prev) =>
                                        prev ? { ...prev, address: e.target.value } : { address: e.target.value } as Company
                                    )} />
                                    <label htmlFor="address">Naslov</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="city" value={companydata?.city ?? ''} onChange={(e) => setcompanydata((prev) =>
                                        prev ? { ...prev, city: e.target.value } : { city: e.target.value } as Company
                                    )} />
                                    <label htmlFor="city">Mesto</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="country" value={companydata?.country ?? ''} onChange={(e) => setcompanydata((prev) =>
                                        prev ? { ...prev, country: e.target.value } : { country: e.target.value } as Company
                                    )} />
                                    <label htmlFor="country">Država</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="postal_code" value={companydata?.postal_code ?? ''} onChange={(e) => setcompanydata((prev) =>
                                        prev ? { ...prev, postal_code: e.target.value } : { postal_code: e.target.value } as Company
                                    )} />
                                    <label htmlFor="postal_code">Poštna št.</label>
                                </FloatLabel>
                            </div>
    
                        </div>
                       
                    </TabPanel>
                    <TabPanel header="Dosegljivost">
                        <div className='inputs'>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="email" value={companydata?.email ?? ''} onChange={(e) => setcompanydata((prev) =>
                                        prev ? { ...prev, email: e.target.value } : { email: e.target.value } as Company
                                    )} keyfilter="email" required />
                                    <label htmlFor="email">Elektronski naslov</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputMask  
                                        id="phone_number" 
                                        value={companydata?.phone_number ?? undefined} // Ensure it's never null
                                        onChange={(e) => 
                                            setcompanydata((prev) => {
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
            ) : (
                <div className='companyview'>
                    <div className='FormCreateButton'>

                        <Button label="Ustvari podjetje" iconPos="right" icon="pi pi-check" loading={loading} onClick={createCompnay} />
                    </div>
                    <TabView>
                        <TabPanel header="Podatki">
                            <div className='inputs'>
                                <div className='input'>
                                    <FloatLabel>
                                        <InputText id="name" value={createcompanydata?.name ?? ''} onChange={(e) => setcreatecompanydata((prev) =>
                                            prev ? { ...prev, name: e.target.value } : { name: e.target.value } as CreateCompany
                                        )} tooltip="Vnesite veljavno ime" required/>
                                        <label htmlFor="name">Ime podjetja</label>
                                    </FloatLabel>
                                </div>
                                
                                <div className='input'>
                                    <FloatLabel>
                                        <InputText id="address" value={createcompanydata?.address ?? ''} onChange={(e) => setcreatecompanydata((prev) =>
                                            prev ? { ...prev, address: e.target.value } : { address: e.target.value } as CreateCompany
                                        )} />
                                        <label htmlFor="address">Naslov podjetja</label>
                                    </FloatLabel>
                                </div>
                                <div className='input'>
                                    <FloatLabel>
                                        <InputText id="email" value={createcompanydata?.email ?? ''} onChange={(e) => setcreatecompanydata((prev) =>
                                            prev ? { ...prev, email: e.target.value } : { email: e.target.value } as CreateCompany
                                        )} />
                                        <label htmlFor="email">Elrktronska pošta</label>
                                    </FloatLabel>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            )}
        </div>
    );
};

export default CompanyView;