import { Flex, Spinner, Text } from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';

const Loader: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            alignContent={'center'}
            flexWrap={'wrap'}
            gap={'2rem'}
        >
            <Flex 
                width={'100%'}
                justifyContent={'center'}
            >
                <Spinner
                    thickness='0.5rem'
                    speed='0.75s'
                    color={colors.blue.main}
                    boxSize={24}
                />
            </Flex>
            <Flex
                width={'100%'}
                justifyContent={'center'}
            >
                <Text fontSize='2xl' fontWeight={'bold'}>
                    {'Chargement...'}
                </Text>
            </Flex>
           
        </Flex>
        
    );
};

export default Loader;