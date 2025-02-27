import React, { useEffect, useState } from 'react';
import TinyMCEEditor from '../../tinymceeditor';
import "./userview.css";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { TabPanel, TabView } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { api } from '../../../api';
import axios from 'axios';

import { useUser } from '../../../utils/UserContext';

interface User {
    Id: string;
    username: string;
    email: string;
    isSuperuser: boolean;
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    phoneNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    IdCompany?: string | null;
    DateCreated: Date;
    DateChanged: Date;
    UserChanged: string;
    UserCreated: string;
}

const UserView: React.FC = () => {
    const [content, setContent] = useState("");
    const [userdata, setUserData]  = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useUser();


    useEffect(() => {

        // If the user is not available in the context, we just return
        if (!user || !user.Id) {
            setLoading(true);
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
                }
                console.log("clas")
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

    // Log userdata only after it's updated
    useEffect(() => {
        if (userdata) {
        console.log('Updated user data:', userdata.Id);
        }
    }, [userdata]);  // Runs when `userdata` state is updated

    return (
        <div className='userview'>
            <Card title="Urejanje osebnih podatkov">
                <TabView>
                    <TabPanel header="Osnovni podatki">
                        <div className='inputs'>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            
                        </div>
                       
                    </TabPanel>
                    <TabPanel header="Dosegljivost">
                    <div className='inputs'>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
                                </FloatLabel>
                            </div>
                            <div className='input'>
                                <FloatLabel>
                                    <InputText id="username" value={content} onChange={(e) => setContent(e.target.value)} tooltip="Vnesite veljavno uporabniško ime"/>
                                    <label htmlFor="username">Uporabniško ime</label>
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