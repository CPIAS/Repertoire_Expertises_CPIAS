import { Flex, Image, Link, Text } from '@chakra-ui/react';
import React from 'react';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import colors from '../../utils/theme/colors';

interface NavProps {
    path: string;
    label: string;
}

const NavItem: React.FC<NavProps> = ({ path, label }) => {
    const location = useLocation();
    const isActive = location.pathname === path;
  
    return (
        <Flex
            height={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            borderBottom={'0.35rem'}
            borderBottomStyle={'solid'}
            paddingTop={'0.75rem'}
            borderBottomColor={isActive ? colors.orange.main : colors.blue.main}
            boxSizing={'border-box'}
        >
            <Link
                as={ReactRouterLink}
                to={path}
                textDecoration="none"
            >
                <Text
                    color={colors.darkAndLight.white}
                    fontSize="2xl"
                    paddingX={'2rem'}
                    height={'100%'}
                    textAlign={'center'}
                    _hover={{color: isActive ? colors.darkAndLight.white : colors.orange.light }}
                >
                    {label}
                </Text>
            </Link>
        </Flex>
    );
};

const Header: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            backgroundColor={colors.blue.main}
            flexWrap={'wrap'}
            boxShadow={`0px 0px 10px 2px ${colors.grey.dark}`}
            gap={'2.5rem'}
        >
            <Flex
                paddingLeft={'1rem'}
                alignItems={'center'}
                backgroundColor={colors.blue.main}
            >
                <Image src='/images/cpias-logo.png' alt='cpias' alignSelf="center" height={'10vh'}/>
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

export default Header;