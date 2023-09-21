import { Flex } from '@chakra-ui/react';
import * as humps from 'humps';
import React, { useState } from 'react';
import Header from '../../components/header/Header';
import Loader from '../../components/loader/Loader';
import MemberCard from '../../components/memberCard/MemberCard';
import { MemberModel } from '../../models/MemberModel';
import axiosInstance from '../../utils/http-requests';

const MembersPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true); //TODO: REMOVE
    const [members, setMembers] = useState<MemberModel[]>([]);
    
    axiosInstance.get<unknown, MemberModel[]>('/users')
        .then((response) => {
            setMembers(humps.camelizeKeys(response) as MemberModel[]);
            setIsLoading(false);
        })
        .catch((error) => {
            console.error(error);
        });

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
                height={'8.5vh'}
                
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>
            <Flex
                overflowY={'scroll'}
                height={'91.5vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                {isLoading ? 
                    <Loader /> 
                    :
                    <>
                        <Flex 
                            width={'100%'} 
                            flexWrap={'wrap'}
                        >
                            {members.map((member) => (
                                <MemberCard key={member.userId} {...member} />
                            
                            ))}
                        </Flex>
                   
                    </>
                }
            </Flex>
            
        </Flex>
    );
};

export default MembersPage;