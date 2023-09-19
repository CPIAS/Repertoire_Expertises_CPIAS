import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import MembersPage from './pages/membersPage/MembersPage';
import SignUpPage from './pages/signUpPage/signUpPage';
import AboutPage from './pages/aboutPage/AboutPage';

const Router: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/membres" element={<MembersPage/>} />
                <Route path="/inscription" element={<SignUpPage/>} />
                <Route path="/a-propos" element={<AboutPage/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;