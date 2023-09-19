import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Header from '../../components/header/Header';

const SignUpPage: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100vh'}
            minHeight={'100vh'}
            maxHeight={'100vh'}
            justifyContent={'center'}
            flexWrap={'wrap'}
        >
            <Flex 
                width={'100%'}
                height={'10vh'} 
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>
            <Text>
                {'L\'inscription se fait ici : https://docs.google.com/forms/d/e/1FAIpQLSe2SqXkvCzOzsXgFq7vw06ScGqprwYiqkzrJjdFwnYc73fc9g/viewform'}
            </Text>
        </Flex>
    );
};

export default SignUpPage;