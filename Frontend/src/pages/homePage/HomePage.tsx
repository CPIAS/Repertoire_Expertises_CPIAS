import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import SearchBar from '../../components/searchBar/SearchBar';
import HomePageTitle from './components/HomePageTitle';
import HomePageFooter from './components/HomePageFooter';
import Header from '../../components/header/Header';

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
                width={'100%'}
                height={'10vh'} 
                alignItems={'center'}
                boxSizing={'border-box'}
                borderBottom={'1px solid black'}
            >
                <Header />
            </Flex>
            <Flex 
                width={'100%'}
                height={'40vh'}
                justifyContent={'center'}
            >
                <HomePageTitle />

            </Flex>

            <Flex
                width={'100%'}
                height={'25vh'}
                justifyContent={'center'}
                alignItems={'flex-start'}
            >
                <SearchBar />
            </Flex>
            <Flex 
                width={'100%'}
                height={'25vh'}
                justifyContent={'center'}
                alignItems={'flex-start'}
            >
                <Text>
                    {'[Guide d\'utilisation]'}
                </Text>
            </Flex>
            <Flex 
                width={'100%'}
                height={'35vh'}
                justifyContent={'center'}
                alignItems={'center'}
                backgroundColor={'white'}
            >
                <HomePageFooter />

            </Flex>
        </Flex>
    );
};

export default HomePage;