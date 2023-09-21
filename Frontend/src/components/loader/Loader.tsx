import { Flex, Spinner, Text } from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';

const Loader: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            flexWrap={'wrap'}
            gap={'3rem'}
        >
            <Flex 
                width={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Spinner
                    thickness='0.5rem'
                    speed='0.75s'
                    emptyColor={colors.grey.main}
                    color={colors.blue.main}
                    boxSize={24}
                />
            </Flex>
            <Flex
                width={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Text fontSize='2xl'>
                    {'Chargement...'}
                </Text>
            </Flex>
           
        </Flex>
        
    );
};

export default Loader;