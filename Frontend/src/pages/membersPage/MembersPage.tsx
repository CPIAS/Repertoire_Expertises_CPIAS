import { Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import Loader from '../../components/loader/Loader';
import MemberCard from '../../components/memberCard/MemberCard';
import { Member } from '../../models/member';
// import mockMembers from './mockMembers.json';
import axios from 'axios';
import humps from 'humps';
const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const MembersPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [noMemberText, setNoMemberText] = useState<string>('Aucun résultat');
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${API_HOST}/users`);
                setMembers(humps.camelizeKeys(response.data) as Member[]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error while fetching members: ', error);
                setNoMemberText('Une erreur est survenue.');
                setIsLoading(false);
            }
        };

        fetchMembers();
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
                overflowY={'scroll'}
                height={'90vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                {isLoading ? 
                    <Loader /> 
                    :
                    <Flex
                        width={'80%'}
                        paddingTop={'5vh'}
                        height={'100%'}
                        justifyContent={'center'}
                        alignContent={'flex-start'}
                        flexWrap={'wrap'}
                    >
                        <Flex 
                            width={'100%'}
                            alignItems={'center'}
                            justifyContent={'flex-start'}
                        >
                            <Text fontSize={'3xl'} fontWeight={'bold'}>
                                {'Membres de la CPIAS'}
                            </Text>
                        </Flex>
                        <Flex
                            width={'100%'}
                            justifyContent={'space-between'}
                            paddingBottom={'1.5rem'}
                        >
                        </Flex>
                        <Flex 
                            width={'100%'} 
                        >
                            {members.length > 0 ?
                                <MemberCard members={members} />
                                :
                                <Flex
                                    width={'100%'}
                                    
                                    fontSize={'2xl'}
                                    fontWeight={'bold'}
                                >
                                    {noMemberText}
                                </Flex>
                            }
                        
                        </Flex>
                    </Flex>
                }
            </Flex>
            
        </Flex>
    );
};

export default MembersPage;