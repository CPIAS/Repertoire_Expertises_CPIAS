import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/aboutPage/AboutPage';
import HomePage from './pages/homePage/HomePage';
import MembersPage from './pages/membersPage/MembersPage';
import NotFoundPage from './pages/notFoundPage/NotFoundPage';
import SearchResultsPage from './pages/searchResultsPage/SearchResultsPage';

const Router: React.FC = () => {
    return (
        <BrowserRouter basename={process.env.REACT_APP_BASE_HREF}>
            <Routes>
                <Route path="/" element={<Navigate to="/accueil" replace />} />              
                <Route path="/accueil" element={<HomePage />} />
                <Route path="/recherche" element={<SearchResultsPage />} />
                <Route path="/membres" element={<MembersPage />} />
                <Route path="/apropos" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;