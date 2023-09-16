
import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/colors';

const SearchBar: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            justifyContent={'center'}    
        >
            <InputGroup 
                width={'50%'}
                size={'lg'}
                backgroundColor={'white'}
                borderRadius={'5px'}
            >
                <Input 
                    placeholder={'Rechercher un mot-clé, un nom, une phrase...'} 
                    fontSize={'xl'}

                />
                <InputRightElement
                    backgroundColor={colors.blue.main}
                    borderRightRadius={'5px'}
                >
                    <SearchIcon 
                        color={'white'}
                        boxSize={7}
                    />
                </InputRightElement>
            </InputGroup>
        </Flex>
    );
};

export default SearchBar;