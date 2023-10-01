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
const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const MembersPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${API_HOST}/users`, {
                    headers: {
                        'Authorization': API_KEY,
                    },
                });
                setMembers(humps.camelizeKeys(response.data) as Member[]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error while fetching members: ', error);
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
                        alignItems={'center'}
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
                            alignItems={'center'}
                            justifyContent={'space-between'}
                            paddingBottom={'1.5rem'}
                        >
                        </Flex>
                        <Flex 
                            width={'100%'} 
                        >
                            <MemberCard members={members} />
                        </Flex>
                   
                    </Flex>
                }
            </Flex>
            
        </Flex>
    );
};

export default MembersPage;