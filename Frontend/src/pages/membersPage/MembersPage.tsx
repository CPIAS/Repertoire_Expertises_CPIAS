import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Header from '../../components/header/Header';

const MembersPage: React.FC = () => {
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
                height={'8.5vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>
            <Text>
                {'Page des membres'}
            </Text>
        </Flex>
    );
};

export default MembersPage;