import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import Header from '../../components/header/Header';
import UserGuideModal from '../../components/modals/UserGuideModal';
import SearchBar from '../../components/searchBar/SearchBar';
import colors from '../../utils/theme/colors';
import HomePageFooter from './components/HomePageFooter';
import HomePageTitle from './components/HomePageTitle';

const HomePage: React.FC = () => {
    const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);

    const openUserGuideModal = () => {
        setIsUserGuideModalOpen(true);
    };

    const closeUserGuideModal = () => {
        setIsUserGuideModalOpen(false);
    };

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
                height={'90vh'}
                paddingTop={'8.5vh'}
                justifyContent={'center'}
                flexWrap={'wrap'}
                overflowY={'auto'}
            >
            
                <Flex 
                    width={'85%'}
                    height={'35vh'}
                    justifyContent={'center'}
                >
                    <HomePageTitle />

                </Flex>

                <Flex
                    width={'60%'}
                    height={'20vh'}
                    justifyContent={'center'}
                    alignItems={'flex-start'}
                >
                    <SearchBar isAutoFocus={true}/>
                </Flex>
                <Flex 
                    width={'85%'}
                    height={'27.5vh'}
                    justifyContent={'center'}
                    alignItems={'flex-start'}
                >
                    <Button
                        size={'lg'}
                        backgroundColor={colors.blue.main}
                        color={colors.darkAndLight.white}
                        leftIcon={<QuestionOutlineIcon boxSize={6}/>}
                        fontWeight={'normal'}
                        _hover={{
                            backgroundColor: colors.blue.light,
                        }}
                        _active={{
                            backgroundColor: colors.blue.light,
                        }}
                        onClick={()=>{
                            openUserGuideModal();
                        }}
                    >
                        {'Guide d\'utilisation'}
                    </Button>
                </Flex>
                <UserGuideModal isOpen={isUserGuideModalOpen} onClose={closeUserGuideModal} />
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