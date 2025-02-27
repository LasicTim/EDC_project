import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import "./login.css";
import axios from 'axios';
import { api } from '../../api';
import { redirect, useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../../utils/UserContext';
import { TokenData } from '../../utils/UserContext';

const LogIn: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useUser();
    const navigate = useNavigate();
    
    const handleLogin = async () => {

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
    
            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log('data:', response);
            if (response.data && response.data.access_token) {

                const token = response.data.access_token;
                auth.setToken(token);
                // Decode token and set user in context
                const decoded = jwtDecode<TokenData>(token);
                
                setUser({
                    username: decoded.sub?.username,
                    Id: decoded.sub.Id
                });
                
                console.log('Login successful:', response.data);
                navigate('/');
            }
            
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.detail);
                console.error('Login failed:', error.response.data.detail);
            } else {
                console.error('Login failed:', error);
            }
            // Handle error (show error message to user)
        }
    };

    const footer = (
        <div className='Buttons'>
            <Button
                label="Vpis"
                icon="pi pi-check"
                onClick={handleLogin}
                className="p-button-rounded p-button-info w-full"
            />
            <Button
                label="Registracija"
                icon="pi pi-user-plus"
                onClick={() => navigate("/signup")}
                className="p-button-rounded p-button-info w-full"
            />
        </div>
    );

    return (
        <div
            className="login-page"
        >
            <Card title="Vpis" footer={footer}>
                <div className="InputFields">
                    {error && <div className="Error">{error}</div>}
                    <div className="Field">
                        <label htmlFor="username" className="font-bold">
                            Uporabniško ime:
                        </label>
                        <InputText
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3"
                        />
                    </div>
                    <div className="Field">
                        <label htmlFor="password" className="font-bold">
                            Geslo:
                        </label>
                        <Password
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            feedback={false}
                            className="w-full"
                            inputClassName="w-full p-3"
                        />
                    </div>
                    
                </div>
            </Card>
        </div>
    );
};

export default LogIn;