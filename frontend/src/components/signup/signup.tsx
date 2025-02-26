import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import "./signup.css";
import axios from 'axios';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';

const SignUp: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatedPassword, setRepeatedPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        if (password !== repeatedPassword) {
            setError('Gesli se ne ujemata.');
            return false;
        }
        if (!email || !username || !password) {
            setError('Vsa polja so obvezna.');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            const userData = {
                username: username,
                password: password,
                email: email
            };
    
            const response = await api.post('/users/create_user', userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                console.log('Registration successful');
                navigate('/login');
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
                onClick={() => navigate("/login")}
                className="p-button-rounded p-button-info w-full"
            />
            <Button
                label="Ustvari račun"
                icon="pi pi-user-plus"
                onClick={handleRegister}
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
                        <label htmlFor="email" className="font-bold">
                            Elektronska pošta:
                        </label>
                        <InputText
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3"
                        />
                    </div>
                    {repeatedPassword && password !== repeatedPassword &&  (
                        <div className="field-warning" style={{ color: 'red', marginBottom: '1rem' }}>
                            Gesli se ne ujemata.
                        </div>
                    )}
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
                    <div className="Field">
                        <label htmlFor="repeatedPassword" className="font-bold">
                            Ponovi geslo:
                        </label>
                        <Password
                            id="repeatedPassword"
                            value={repeatedPassword}
                            onChange={(e) => setRepeatedPassword(e.target.value)}
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

export default SignUp;