import { Flex, Image, Link, Text } from '@chakra-ui/react';
import React from 'react';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import colors from '../../utils/colors';

interface NavProps {
    path: string;
    label: string;
  }

const NavItem: React.FC<NavProps> = ({ path, label }) => {
    const location = useLocation();
    const isActive = location.pathname === path;
  
    return (
        <Flex height="100%" alignItems="center">
            <Link
                as={ReactRouterLink}
                to={path}
                textDecoration="none"
                _hover={{ color: isActive ? '' : 'lightgrey' }}
            >
                <Text
                    color={isActive ? '#F2810C' : 'white'}
                    fontSize="2xl"
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
            justifyContent={'space-between'}
            backgroundColor={colors.blue.main}
        >
            <Flex 
                paddingLeft={'0.5rem'}
                paddingRight={'5rem'}
            >
                <Image src='/images/cpias-logo.png' alt='cpias' alignSelf="center" height={'9vh'}/>
            </Flex>
            <Flex
                paddingRight={'1.5rem'}
                gap={'2.5rem'}
            >
                <NavItem path="/" label="Rechercher" />
                <NavItem path="/membres" label="Membres" />
                <NavItem path="/inscription" label="Inscription" />
                <NavItem path="/a-propos" label="À propos" />
            </Flex>
        </Flex>
    );
};

export default Header;