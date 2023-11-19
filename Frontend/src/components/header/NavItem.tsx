import { Flex, Link, Text } from '@chakra-ui/react';
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

export default NavItem;