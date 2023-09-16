import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import MembersPage from './pages/membersPage/MembersPage';

const Router: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route  path="/" element={<HomePage/>} />
                <Route path="/membres" element={<MembersPage/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;