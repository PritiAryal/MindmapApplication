import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/Login.js';
import UserRegister from './pages/Registration.js';
import Dashboard from './pages/Dashboard.js';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/UserRegister" element={<UserRegister />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
