import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

const HomePageTitle: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            justifyContent={'center'}
            flexWrap={'wrap'}
        >
            <Flex 
                width={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Text 
                    fontSize='5xl'
                    textAlign={'center'}
                >
                    {'Répertoire des expertises de la CPIAS'}
                </Text>
            </Flex>
            <Flex
                width={'100%'}  
                justifyContent={'center'}
                alignItems={'flex-start'}
            >
                <Text
                    fontSize='2xl'
                    textAlign={'center'}
                >
                    {'[Description de l\'outil]'}
                </Text>
            </Flex>
            
        </Flex>
    );
};

export default HomePageTitle;