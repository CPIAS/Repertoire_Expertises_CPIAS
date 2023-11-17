import { Flex } from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

const Header: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            alignItems={'center'}
            justifyContent={'space-between'}
            backgroundColor={colors.blue.main}
            flexWrap={'wrap'}
            boxShadow={`0px 0px 10px 2px ${colors.grey.dark}`}
        >
            {/* Larger screens */}
            <Flex
                width={'100%'}
                height={'100%'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                gap={'2.5rem'}
                display={{ base: 'none', md: 'none', lg: 'flex' }}
            >
                <DesktopHeader />
            </Flex>

            {/* Smaller screens */}
            <Flex
                width={'100%'}
                height={'100%'}
                alignItems={'center'}
                justifyContent={'flex-start'}
                gap={'2.5rem'}
                display={{ base: 'flex', md: 'flex', lg: 'none' }}
            >
                <MobileHeader />
            </Flex>
        </Flex>
    );
};

export default Header;