import { Button, Flex, Tag, TagLabel, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import Filters from '../../components/filters/Filters';
import Header from '../../components/header/Header';
import Loader from '../../components/loader/Loader';
import MemberCard from '../../components/memberCard/MemberCard';
import { IFilters } from '../../models/filters';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';
import mockMembers from './mockMembers.json';
const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const MembersPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFilterSectionShown, setIsFilterSectionShown] = useState<boolean>(false);
    const [noMemberText, setNoMemberText] = useState<string>('Aucun résultat');
    const [members, setMembers] = useState<Member[]>(mockMembers);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>(mockMembers);
    const [appliedFilters, setAppliedFilters] = useState<IFilters | undefined>(undefined);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${API_HOST}/users`);
                // setMembers(humps.camelizeKeys(response.data) as Member[]);
                // setFilteredMembers(humps.camelizeKeys(response.data) as Member[]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error while fetching members: ', error);
                setNoMemberText('Une erreur est survenue.');
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, []);

    useEffect(() => {
        let filtered = members;
        if (appliedFilters) {
            filtered = members.filter((member) => {
                let includeMember = true;
                if (appliedFilters.organisation && appliedFilters.organisation.length > 0) {
                    if (!appliedFilters.organisation.includes(member.affiliationOrganization)) {
                        includeMember = false;
                    }
                }
    
                if (appliedFilters.memberType && appliedFilters.memberType.length > 0) {
                    if (!appliedFilters.memberType.includes(member.membershipCategory)) {
                        includeMember = false;
                    }
                }
    
                if (appliedFilters.expertise && appliedFilters.expertise.length > 0) {
                    if (!appliedFilters.expertise.includes(member.skills)) {
                        includeMember = false;
                    }
                }

                if (appliedFilters.aiExperience && appliedFilters.aiExperience.length > 0) {
                    if (member.yearsExperienceIa < appliedFilters.aiExperience[0] || member.yearsExperienceIa > appliedFilters.aiExperience[1]) {
                        includeMember = false;
                    }
                }

                if (appliedFilters.healthExperience && appliedFilters.healthExperience.length > 0) {
                    if (member.yearsExperienceHealthcare < appliedFilters.healthExperience[0] || member.yearsExperienceHealthcare > appliedFilters.healthExperience[1]) {
                        includeMember = false;
                    }
                }
    
                return includeMember;
            });
        }
        
        setFilteredMembers(filtered);
    }, [appliedFilters]);

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
                        gap={'1rem'}
                    >
                        <Flex 
                            width={'100%'}
                            alignItems={'center'}
                            justifyContent={'space-between'}
                        >
                            <Text fontSize={'3xl'} fontWeight={'bold'}>
                                {'Membres de la CPIAS'}
                            </Text>
                            <Button
                                size={'lg'}
                                backgroundColor={colors.blue.main}
                                color={colors.darkAndLight.white}
                                leftIcon={<FaFilter/>}
                                fontWeight={'normal'}
                                _hover={{
                                    backgroundColor: colors.blue.light,
                                }}
                                _active={{
                                    backgroundColor: colors.blue.light,
                                }}
                                onClick={()=>{
                                    setIsFilterSectionShown(!isFilterSectionShown);
                                }}
                            >
                                {'Appliquer des filtres'}
                            </Button>
                        </Flex>
                        <Filters 
                            isOpen={isFilterSectionShown} 
                            setIsFilterSectionShown={setIsFilterSectionShown}
                            setAppliedFilters={setAppliedFilters}
                        />
                        <Flex
                            width={'100%'}
                            gap={'0.5rem'}
                            alignItems={'flex-start'}
                        >
                            {appliedFilters && 
                                <Flex
                                    alignItems={'center'}
                                    alignContent={'center'}
                                    paddingTop={'0.1rem'}
                                >
                                    {'Filtre appliqués :'}
                                </Flex>
                            }
                            <Flex
                                gap={'0.5rem'}
                                maxWidth={'90%'}
                                flexWrap={'wrap'}
                            >

                                {appliedFilters?.organisation?.map((filter, index) => (
                                    <Tag
                                        key={`organisation-${filter}-${index}`}
                                        size={'lg'}
                                        colorScheme='orange'
                                        borderRadius='full'
                                        border={'1px solid'}
                                        borderColor={colors.orange.main}

                                    >
                                        <TagLabel>{filter}</TagLabel>
                                    </Tag>
                                ))}
                                {appliedFilters?.expertise?.map((filter, index) => (
                                    <Tag
                                        key={`expertise-${filter}-${index}`}
                                        size={'lg'}
                                        colorScheme='orange'
                                        borderRadius='full'
                                        border={'1px solid'}
                                        borderColor={colors.orange.main}

                                    >
                                        <TagLabel>{filter}</TagLabel>
                                    </Tag>
                                ))}
                                {appliedFilters?.memberType?.map((filter, index) => (
                                    <Tag
                                        key={`memberType-${filter}-${index}`}
                                        size={'lg'}
                                        colorScheme='orange'
                                        borderRadius='full'
                                        border={'1px solid'}
                                        borderColor={colors.orange.main}

                                    >
                                        <TagLabel>{filter}</TagLabel>
                                    </Tag>
                                ))}
                                {appliedFilters?.aiExperience && appliedFilters?.aiExperience.length > 0 && (
                                    <Tag
                                        size={'lg'}
                                        colorScheme='orange'
                                        borderRadius='full'
                                        border={'1px solid'}
                                        borderColor={colors.orange.main}

                                    >
                                        <TagLabel>{`Expérience en IA : ${appliedFilters?.aiExperience[0]} à ${appliedFilters?.aiExperience[1]} ans`}</TagLabel>
                                    </Tag>
                                )}
                                {appliedFilters?.healthExperience && appliedFilters?.healthExperience.length > 0 && (
                                    <Tag
                                        size={'lg'}
                                        colorScheme='orange'
                                        borderRadius='full'
                                        border={'1px solid'}
                                        borderColor={colors.orange.main}

                                    >
                                        <TagLabel>{`Expérience en santé : ${appliedFilters?.healthExperience[0]} à ${appliedFilters?.healthExperience[1]} ans`}</TagLabel>
                                    </Tag>
                                )}
                            </Flex>
                        </Flex>
                        <Flex 
                            width={'100%'} 
                        >
                            {members.length > 0 ?
                                <MemberCard members={filteredMembers} />
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