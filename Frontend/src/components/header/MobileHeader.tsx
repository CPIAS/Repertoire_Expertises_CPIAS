
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerOverlay, Flex, Image, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import colors from '../../utils/theme/colors';
import NavItem from './NavItem';

const MobileHeader: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Flex
            width="100%"
            height="auto"
            alignItems="center"
            justifyContent="flex-start"
        >
            <Flex paddingLeft={'1.5rem'} zIndex={5}>
                <GiHamburgerMenu
                    aria-label="Menu"
                    onClick={()=>onOpen()}
                    color={'white'}
                    size={'32px'}
                />
            </Flex>
    
            <Flex alignItems="center" justifyContent={'center'} width={'100%'} position={'absolute'}>
                <Image src='./images/cpias-logo.png' alt='cpias' height="8.5vh" />
            </Flex>
    
            <Drawer 
                placement="left" 
                size={{ base: 'full', md: 'sm' }}
                onClose={onClose} 
                isOpen={isOpen}
            >
                <DrawerOverlay>
                    <DrawerContent backgroundColor={colors.blue.main}>
                        <DrawerCloseButton color={colors.darkAndLight.white}/>
                        <DrawerBody paddingTop={'2rem'}>
                            <Flex flexDirection="column">
                                <NavItem path="/accueil" label="Accueil" />
                                <NavItem path="/membres" label="Membres" />
                                <NavItem path="/apropos" label="À propos" />
                                <NavItem path="/admin" label="Se connecter" />
                            </Flex>
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </Flex>
    );
};

export default MobileHeader;
