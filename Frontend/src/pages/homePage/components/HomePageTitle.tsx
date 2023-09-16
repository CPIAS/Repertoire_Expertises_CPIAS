import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

const HomePageTitle: React.FC = () => {
    return (
        <Flex 
            width={'60%'}
            justifyContent={'center'}
            flexWrap={'wrap'}
            gap={'2rem'}
        >
            <Flex 
                width={'100%'}
                justifyContent={'center'}
            >
                <Text 
                    fontSize='5xl'
                    textAlign={'center'}
                >
                    {'Bienvenue sur le répertoire des expertises de la Communauté de pratique IA en santé'}
                </Text>
            </Flex>
            <Flex
                width={'100%'}  
                justifyContent={'center'}
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