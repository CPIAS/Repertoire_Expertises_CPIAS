import { Flex } from '@chakra-ui/react';
import React from 'react';
import SearchBar from '../../components/searchBar/SearchBar';
import HomePageTitle from './components/HomePageTitle';

const HomePage: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            flexWrap={'wrap'}
            gap={'5rem'}
        >
            <Flex 
                width={'100%'}
                justifyContent={'center'}
            >
                <HomePageTitle />

            </Flex>

            <Flex
                width={'100%'}
                height={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <SearchBar />
            </Flex>
        </Flex>
    );
};

export default HomePage;