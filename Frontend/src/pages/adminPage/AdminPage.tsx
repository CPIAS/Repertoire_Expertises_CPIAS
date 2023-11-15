import React, { useState } from 'react';
import EditMembers from './components/EditMembers';
import Login from './components/Login';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    return (
        !isLoggedIn ? 
            <Login setIsLoggedIn={setIsLoggedIn}/>
            : 
            <EditMembers />
            
    );
};

export default AdminPage;