import { extendTheme } from '@chakra-ui/react';
import colors from './colors';

const theme = extendTheme({
    fonts: {
        body: '\'Open Sans\', sans-serif',
        heading: 'Georgia, serif',
    },
    styles: {
        global: {
            body: {
                bg: colors.grey.main,
            },
            width: '100%',
            maxHeight: '100vh',
        },
    }
});

export default theme;
