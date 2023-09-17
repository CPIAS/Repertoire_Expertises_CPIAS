import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import SearchBar from '../../components/searchBar/SearchBar';
import HomePageTitle from './components/HomePageTitle';

const HomePage: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100vh'}
            minHeight={'100vh'}
            maxHeight={'100vh'}
            flexWrap={'wrap'}
        >
            <Flex 
                height={'5.5vh'} 
                width={'100%'}
                alignItems={'center'}
                boxSizing={'border-box'}
                borderBottom={'1px solid black'}
            >
                <Text>
                    {'[Header]'}
                </Text>
            </Flex>
            <Flex 
                width={'100%'}
                height={'30vh'}
                justifyContent={'center'}
            >
                <HomePageTitle />

            </Flex>

            <Flex
                width={'100%'}
                height={'27.5vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <SearchBar />
            </Flex>
            <Flex 
                width={'100%'}
                height={'5vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Text>
                    {'[Guide d\'utilisation]'}
                </Text>
            </Flex>
            <Flex 
                width={'100%'}
                height={'26.5vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Text>
                    {'[Partenaires]'}
                </Text>

            </Flex>
        </Flex>
    );
};

export default HomePage;