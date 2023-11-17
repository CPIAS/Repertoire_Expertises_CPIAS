
import { SearchIcon } from '@chakra-ui/icons';
import { Flex, InputGroup, InputRightElement } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../../utils/theme/colors';
import { AutoResizeTextarea } from './AutoResizeTextarea';

const ENTER_KEY = 'Enter';

interface SearchBarProps {
    defaultValue?: string;
    isAutoFocus?: boolean;
    isReadOnly?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    defaultValue,
    isAutoFocus = false,
    isReadOnly = false
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const navigate = useNavigate ();

    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === ENTER_KEY && searchQuery.trim().length !== 0) {
            submitSearch();
        }
    };

    useEffect(() => {
        if (isReadOnly && defaultValue){
            setSearchQuery(defaultValue); 
        }
    }, []);

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
                height={'100%'}
                size={'lg'}
            >
                <AutoResizeTextarea 
                    placeholder={'Rechercher...'} 
                    fontSize={{ base: 'sm', md: 'lg', lg: 'xl' }}
                    backgroundColor={colors.darkAndLight.white}
                    paddingRight={'4.5rem'}
                    paddingY={'1rem'}
                    borderRadius={'1rem'}
                    cursor={isReadOnly ? 'default' : 'auto'}
                    border={'1px solid darkgrey !important'}
                    onChange={(event) => {
                        setSearchQuery(event.target.value.trim());
                    }}
                    onKeyDown={handleEnterKeyPress}
                    defaultValue={defaultValue ?? searchQuery}
                    boxShadow={`0px 0px 7.5px 0px ${colors.grey.dark}`}
                    autoFocus={isAutoFocus}
                    isReadOnly={isReadOnly}
                    verticalAlign={'center'}
                    resize={'none'}
                    overflowY={'scroll'}
                    _hover={{ boxShadow: isReadOnly ? `0px 0px 7.5px 0px ${colors.grey.dark}` : `0px 0px 7.5px 0px ${colors.grey.light}` }}
                    _active={{ border: isReadOnly ? '1px solid darkgrey' : '1px solid darkblue' }}
                />
                <InputRightElement 
                    className="input-right-element"
                    width={'4rem'}
                    height={'100%'}
                    maxHeight={'153px'}
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