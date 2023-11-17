import { Flex, Image } from '@chakra-ui/react';
import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import colors from '../../utils/theme/colors';
import NavItem from './NavItem';
import { useNavigate } from 'react-router';

const DesktopHeader: React.FC = () => {
    const navigate = useNavigate();
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
                width={'95%'}
                height={'100%'}
                alignItems={'center'}
                justifyContent={'flex-start'} 
                gap={'2.5rem'}
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
            <Flex
                width={'5%'}
                height={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <FaUserCircle 
                    color={'white'} 
                    size={'32px'} 
                    cursor={'pointer'}
                    onClick={()=>navigate('/admin')}
                />
            </Flex>
        </Flex>
    );
};

export default DesktopHeader;