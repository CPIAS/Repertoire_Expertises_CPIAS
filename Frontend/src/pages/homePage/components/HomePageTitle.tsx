import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

const HomePageTitle: React.FC = () => {
    return (
        <Flex
            width={'100%'}
            height={'90%'}
            justifyContent={'center'}
            flexWrap={'wrap'}
        >
            <Flex 
                width={'100%'}
                height={'55%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Text 
                    fontSize='6xl'
                    fontWeight={'bold'}
                    textAlign={'center'}
                >
                    {'Répertoire des expertises'}
                </Text>
            </Flex>
            <Flex
                width={'100%'} 
                height={'35%'} 
                justifyContent={'center'}
                alignItems={'flex-start'}
            >
                <Text
                    fontSize='2xl'
                    textAlign={'center'}
                >
                    {'Trouvez des collaborateurs pour vos projets en intelligence artificielle et en santé.'}
                </Text>
            </Flex>
            
        </Flex>
    );
};

export default HomePageTitle;