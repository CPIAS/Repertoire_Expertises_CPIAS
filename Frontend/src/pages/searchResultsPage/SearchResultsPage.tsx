import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import axios, { AxiosResponse } from 'axios';
import humps from 'humps';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import SearchBar from '../../components/searchBar/SearchBar';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';
import mockMembers from '../membersPage/mockMembers.json';
import ResultsTabs from './components/ResultsTabs';

const API_HOST = process.env.REACT_APP_SERVER_URL;

const SearchResultsPage: React.FC = () => {
    const navigate = useNavigate ();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [members, setMembers] = useState<Member[]>(mockMembers);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') as string;

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response: AxiosResponse<Member[]> = await axios.get(`${API_HOST}/users`);
                setMembers(humps.camelizeKeys(response.data) as Member[]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error while fetching members: ', error);
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [query]);

    return (
        <Flex 
            width={'100%'}
            height={'100vh'}
            minHeight={'100vh'}
            maxHeight={'100vh'}
            justifyContent={'center'}
            alignItems={'flex-start'}
            flexWrap={'wrap'}
            overflowY={'hidden'}
        >
            <Flex 
                width={'100%'}
                height={'10vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>
            <Flex 
                width={'100%'}
                height={'90vh'}
                paddingTop={'5vh'}
                justifyContent={'center'}
                alignItems={'flex-start'}
                overflowY={'scroll'}
            >
                <Flex
                    width={'90%'}
                    height={'100%'}
                    flexWrap={'wrap'}
                    gap={'2rem'}
                    justifyContent={'center'}
                    alignContent={'flex-start'}
                >
                    <Flex 
                        width={'90%'}
                        height={'10%'}
                        alignItems={'center'}
                    >
                        <ArrowBackIcon 
                            border={`3px solid ${colors.blue.main}`}
                            color={colors.blue.main}
                            borderRadius={'full'}
                            boxSize={12}
                            cursor={'pointer'}
                            onClick={()=>{
                                navigate(-1);
                            }}
                            _hover={{
                                backgroundColor: colors.blue.main,
                                color: colors.darkAndLight.white
                            }}

                        />
                        <Flex
                            marginLeft={'2rem'}
                            width={'50%'}
                        >
                            <SearchBar defaultValue={query}/>
                        </Flex>
                    </Flex>

                    <Flex 
                        width={'100%'} 
                        height={'85%'}
                        justifyContent={'center'}
                    >
                        <ResultsTabs members={members} isLoading={isLoading}/>
                    </Flex>                    
                </Flex>
            </Flex>
        </Flex>
    );
};

export default SearchResultsPage;
