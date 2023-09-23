
import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../../utils/theme/colors';

const ENTER_KEY = 'Enter';

interface SearchBarProps {
    defaultValue?: string;
    isAutoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    defaultValue,
    isAutoFocus = false
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const navigate = useNavigate ();

    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ENTER_KEY && searchQuery.trim().length !== 0) {
            submitSearch();
        }
    };

    const submitSearch = () => {
        if (searchQuery.trim().length !== 0)
            navigate(`/recherche?q=${searchQuery}`);
    };

    return (
        <Flex 
            width={'100%'}
            justifyContent={'center'}   
            flexWrap={'wrap'} 
        >
            <InputGroup 
                width={'100%'}
                height={'4rem'}
                size={'lg'}
                
            >
                <Input 
                    placeholder={'Rechercher un nom, un mot-clé, une phrase...'} 
                    fontSize={'xl'}
                    height={'inherit'}
                    backgroundColor={colors.darkAndLight.white}
                    paddingRight={'4.5rem'}
                    borderRadius={'1rem'}
                    border={'1px solid darkgrey'}
                    onChange={(event) => setSearchQuery(event.target.value.trim())}
                    onKeyDown={handleEnterKeyPress}
                    defaultValue={defaultValue ?? searchQuery}
                    boxShadow={`0px 0px 7.5px 0px ${colors.grey.dark}`}
                    autoFocus={isAutoFocus}
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