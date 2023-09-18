import { Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/colors';

const Header: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            alignItems={'center'}
            backgroundColor={colors.blue.main}
        >
            <Flex 
                paddingLeft={'0.5rem'}
                paddingRight={'2.5rem'}
            >
                <Image src='/images/cpias-logo.png' alt='cpias' alignSelf="center" height={'9vh'}/>
            </Flex>
            <Text
                color={'white'}
                fontSize={'xl'}
            >
                {'[Header]'}
            </Text>
        </Flex>
    );
};

export default Header;