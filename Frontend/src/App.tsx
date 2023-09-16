import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import Router from './Routes';
import theme from './utils/theme';

const App: React.FC = () => {
    return (
        <ChakraProvider theme={theme}>
            <Router />  
        </ChakraProvider>
    );
};

export default App;