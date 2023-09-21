import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Header from '../../components/header/Header';
import SearchBar from '../../components/searchBar/SearchBar';
import colors from '../../utils/theme/colors';
import HomePageFooter from './components/HomePageFooter';
import HomePageTitle from './components/HomePageTitle';

const HomePage: React.FC = () => {
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
            <Flex
                width={'100%'}
                height={'91.5vh'}
                paddingTop={'8.5vh'}
                justifyContent={'center'}
                flexWrap={'wrap'}
                overflowY={'auto'}
            >
            
                <Flex 
                    width={'85%'}
                    height={'40vh'}
                    justifyContent={'center'}
                >
                    <HomePageTitle />

                </Flex>

                <Flex
                    width={'85%'}
                    height={'20vh'}
                    justifyContent={'center'}
                    alignItems={'flex-start'}
                >
                    <SearchBar />
                </Flex>
                <Flex 
                    width={'85%'}
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
                    backgroundColor={colors.darkAndLight.white}
                >
                    <HomePageFooter />

                </Flex>
            </Flex>
        </Flex>
    );
};

export default HomePage;