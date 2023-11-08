import React, { useState } from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import EditMembers from './components/EditMembers';
import { Flex } from '@chakra-ui/react';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [currentComponent, setCurrentComponent] = useState<React.ReactNode | null>(null);

    const sidebarItems = [
        {
            label: 'Gérer les membres',
            // icon: <IconComponent />, // Remplacez IconComponent par votre propre icône ou composant.
            onClick: () => setCurrentComponent(<EditMembers />),
        },
        {
            label: 'Gérer la base de données',
            // icon: <IconComponent />,
            onClick: () => setCurrentComponent(<EditMembers />),
        },
        // Ajoutez d'autres éléments de la barre latérale selon vos besoins.
    ];

    return (
        // !isLoggedIn ? 
        //     <Login setIsLoggedIn={setIsLoggedIn}/>
        //     : 
        <Flex>
            <Sidebar items={sidebarItems} />
            {currentComponent}
        </Flex>
        
    // <EditMembers />
            
    );
};

export default AdminPage;