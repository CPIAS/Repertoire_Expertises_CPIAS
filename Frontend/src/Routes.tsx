import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/aboutPage/AboutPage';
import HomePage from './pages/homePage/HomePage';
import MembersPage from './pages/membersPage/MembersPage';
import SearchResultsPage from './pages/searchResultsPage/SearchResultsPage';

const Router: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/accueil" replace />} />              
                <Route path="/accueil" element={<HomePage />} />
                <Route path="/recherche" element={<SearchResultsPage />} />
                <Route path="/membres" element={<MembersPage />} />
                <Route path="/apropos" element={<AboutPage />} />
                {/* TODO: Create error 404 page */}
            </Routes>
        </BrowserRouter>
    );
};

export default Router;