import { Button, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import colors from '../../utils/theme/colors';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate ();
    return (
        <Flex 
            width={'100%'}
            height={'100vh'}
            minHeight={'100vh'}
            maxHeight={'100vh'}
            justifyContent={'center'}
            alignItems={'flex-start'}
            flexWrap={'wrap'}
            overflowY={'hidden'}
        >
            <Flex 
                width={'100%'}
                height={'10vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>
            <Flex
                width={'100%'}
                justifyContent={'center'}
                flexWrap={'wrap'}
                gap={'1rem'}
            >
                <Text 
                    width={'100%'} 
                    fontSize={{base:'6xl', md:'9xl'}} 
                    fontWeight={'bold'}
                    textAlign={'center'} 
                >
                    {'Oups !'}
                </Text>
                <Text 
                    width={'100%'} 
                    fontSize={{base:'lg', md:'2xl'}} 
                    textAlign={'center'}
                >
                    {'La page que vous recherchez n\'existe pas.'}
                </Text>
            </Flex>
            <Button
                size={'lg'}
                backgroundColor={colors.blue.main}
                color={colors.darkAndLight.white}
                fontWeight={'normal'}
                _hover={{
                    backgroundColor: colors.blue.light,
                }}
                _active={{
                    backgroundColor: colors.blue.light,
                }}
                onClick={()=>{
                    navigate('/accueil');
                }}
            >
                {'Aller à l\'accueil'}
            </Button>
            
        </Flex>
    );
};

export default NotFoundPage;