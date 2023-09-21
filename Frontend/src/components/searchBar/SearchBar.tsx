
import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import React, { useState } from 'react';
import colors from '../../utils/theme/colors';

const ENTER_KEY = 'Enter';

const SearchBar: React.FC = () => {
    const [searchBarContent, setSearchBarContent] = useState<string>('');

    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ENTER_KEY && searchBarContent.trim().length !== 0) {
            submitSearch();
        }
    };

    const submitSearch = () => {
        // TODO: Change endpoint
        // axiosInstance.post('/endpoint/', { data: searchBarContent })
        //     .then((response) => {
        //         // TODO: handle response
        //     })
        //     .catch((error) => {
        //         console.error('Error POST request:', error);
        //     });

    };

    return (
        <Flex 
            width={'100%'}
            justifyContent={'center'}   
            flexWrap={'wrap'} 
        >
            <InputGroup 
                width={'65%'}
                height={'4rem'}
                size={'lg'}
                
            >
                <Input 
                    placeholder={'Rechercher un mot-clé, un nom, une phrase...'} 
                    fontSize={'xl'}
                    height={'inherit'}
                    backgroundColor={colors.darkAndLight.white}
                    paddingRight={'4.5rem'}
                    borderRadius={'1rem'}
                    border={'1px solid darkgrey'}
                    onChange={(event) => setSearchBarContent(event.target.value.trim())}
                    onKeyDown={handleEnterKeyPress}
                    defaultValue={searchBarContent}
                    boxShadow={`0px 0px 7.5px 0px ${colors.grey.dark}`}
                />
                <InputRightElement 
                    width={'4rem'} 
                    height={'inherit'}
                    backgroundColor={colors.blue.main}
                    borderRightRadius={'1rem'}
                    border={'1px solid transparent'}
                    borderLeft={'none'}
                    cursor={'pointer'}
                    onClick={submitSearch}
                    _hover={{ backgroundColor: colors.orange.main }}
                >
                    <SearchIcon 
                        color={colors.darkAndLight.white}
                        boxSize={'8'}
                    />

                </InputRightElement>
            </InputGroup>
        </Flex>
    );
};

export default SearchBar;