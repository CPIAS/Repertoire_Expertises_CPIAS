import { ArrowBackIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/header/Header';
import SearchBar from '../../components/searchBar/SearchBar';
import { ResultsMembers } from '../../models/member';
import colors from '../../utils/theme/colors';
// import mockMembers from '../membersPage/mockMembers.json';
import axios from 'axios';
import ResultsTabs from './components/ResultsTabs';
import mockResults from './mockResults.json';

const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SearchResultsPage: React.FC = () => {
    const navigate = useNavigate ();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [results, setResults] = useState<ResultsMembers[]>([]);
    const [noResultsText, setNoResultsText] = useState<string>('Aucun résultat');
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') as string;

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.post(`${API_HOST}/search`, query);
                const resultsTemp: ResultsMembers[] = [];
                response.data.experts.map((res: ResultsMembers) => {
                    resultsTemp.push({category: res.category, recommendation: res.recommendation});
                });
                setResults(resultsTemp);
                setIsLoading(false);
            } catch (error) {
                console.error('Error while fetching members: ', error);
                setNoResultsText('Une erreur est survenue.');
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [query]);

    //TODO: REMOVE BEFORE DEPLOYMENT
    useEffect(() => {
        const resultsTemp: ResultsMembers[] = [];
        mockResults.experts.map((res) => {
            resultsTemp.push({category: res.category, recommendation: res.recommendation});
        });

        setResults(resultsTemp);
        setIsLoading(false); //TODO: Remove
    }, []);

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
                            width={'100%'}
                        >
                            <SearchBar defaultValue={query}/>
                        </Flex>
                    </Flex>

                    <Flex 
                        width={'100%'} 
                        height={'85%'}
                        justifyContent={'center'}
                        alignItems={'flex-start'}
                    >
                        <ResultsTabs results={results} isLoading={isLoading} noResultsText={noResultsText}/>
                    </Flex>                    
                </Flex>
            </Flex>
        </Flex>
    );
};

export default SearchResultsPage;
