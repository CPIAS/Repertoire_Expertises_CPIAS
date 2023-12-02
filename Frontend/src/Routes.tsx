import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/aboutPage/AboutPage';
import HomePage from './pages/homePage/HomePage';
import MembersPage from './pages/membersPage/MembersPage';
import NotFoundPage from './pages/notFoundPage/NotFoundPage';
import SearchResultsPage from './pages/searchResultsPage/SearchResultsPage';
import AdminPage from './pages/adminPage/AdminPage';

const Router: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/accueil" replace />} />              
                <Route path="/accueil" element={<HomePage />} />
                <Route path="/recherche" element={<SearchResultsPage />} />
                <Route path="/membres" element={<MembersPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/apropos" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </HashRouter>
    );
};

export default Router;