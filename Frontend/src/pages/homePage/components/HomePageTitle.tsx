import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

const HomePageTitle: React.FC = () => {
    return (
        <Flex
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            flexWrap={'wrap'}
        >
            <Flex 
                width={'100%'}
                height={'60%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Text 
                    fontSize='5xl'
                    textAlign={'center'}
                >
                    {'Répertoire des expertises'}
                </Text>
            </Flex>
            <Flex
                width={'100%'} 
                height={'40%'} 
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