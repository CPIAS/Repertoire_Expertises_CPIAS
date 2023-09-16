import { ChakraProvider, theme } from '@chakra-ui/react';
import React from 'react';
import Router from './Routes';

const App: React.FC = () => {
    return (
        <ChakraProvider theme={theme}>
            <Router />  
        </ChakraProvider>
    );
};

export default App;