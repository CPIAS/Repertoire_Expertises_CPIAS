import { Flex, Image } from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';
import NavItem from './NavItem';

const DesktopHeader: React.FC = () => {
    return (
        <Flex
            width={'100%'}
            height={'100%'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            gap={'2.5rem'}
            display={{ base: 'none', md: 'none', lg: 'flex' }}
        >
            <Flex
                paddingLeft={'1rem'}
                alignItems={'center'}
                backgroundColor={colors.blue.main}
            >
                <Image src='./images/cpias-logo.png' alt='cpias' alignSelf="center" height={'10vh'}/>
            </Flex>
            <Flex
                width={'auto%'}
                height={'100%'}
                alignItems={'center'}
                
            >
                <NavItem path="/accueil" label="Accueil" />
                <NavItem path="/membres" label="Membres" />
                <NavItem path="/apropos" label="À propos" />
            </Flex>
        </Flex>
    );
};

export default DesktopHeader;