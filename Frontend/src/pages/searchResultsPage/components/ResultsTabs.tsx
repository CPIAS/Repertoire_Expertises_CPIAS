import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';
import NetworkGraph from '../../../components/graph/Graph';
import Loader from '../../../components/loader/Loader';
import MemberCard from '../../../components/memberCard/MemberCard';
import { Member } from '../../../models/member';
import colors from '../../../utils/theme/colors';

interface SearchResultsProps {
    members: Member[];
    isLoading: boolean;
    noResultsText: string;
}

const ResultsTabs: React.FC<SearchResultsProps> = ({ 
    members,
    isLoading,
    noResultsText,
}) => {

    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
        >
            {
                isLoading ?
                    <Loader/> 
                    :
                    <Flex
                        width={'90%'}
                        height={'100%'}
                        flexWrap={'wrap'}
                        alignContent={'flex-start'}
                        gap={'1rem'}
                    >
                    
                        <Flex
                            width={'100%'}
                            fontSize={'3xl'}
                            fontWeight={'bold'}
                        >
                            {members.length > 0 ? 
                                members.length > 1 ? `${members.length} experts identifiés` : `${members.length} expert identifié`
                                : noResultsText
                            }
                        </Flex>
                    
                        {members.length > 0 &&
                            <Flex
                                width={'100%'}
                                borderRadius={'0.5rem'}
                                border={`1px solid ${colors.grey.dark}`}
                                justifyContent={'center'}
                                flexWrap={'wrap'}
                            >
                                <Tabs 
                                    size='lg' 
                                    width={'100%'}
                                    height={'100%'}
                                    backgroundColor={'white'}
                                    borderRadius={'0.5rem'}
                                    variant='enclosed'
                                    justifyContent={'center'}
                                    alignContent={'center'}
                                    alignItems={'center'}
                                >
                                    <TabList 
                                        paddingX={'1rem'}
                                        border={'none'}
                                    >
                                        <Tab 
                                            paddingX={'5rem'}
                                            _active={{
                                                backgroundColor: colors.grey.main,
                                            }}
                                            _selected={{ 
                                                borderBottom: `3.5px solid ${colors.orange.main}`,
                                            }}
                                        >
                                            {'Cartographie'}
                                        </Tab>
                                        <Tab
                                            paddingX={'5rem'}
                                            _active={{
                                                backgroundColor: colors.grey.main,
                                            }}
                                            _selected={{ 
                                                borderBottom: `3.5px solid ${colors.orange.main}`,
                                            }}
                                        >
                                            {'Liste des experts'}
                                        </Tab>
                                    </TabList>

                                    <TabPanels 
                                        borderRadius={'0.5rem'}
                                        width={'90%'} 
                                        height={'auto' || '100%'}
                                        paddingX={'1rem'}
                                        backgroundColor={'white'}
                                        justifyContent={'center'}
                                        alignContent={'center'}
                                        alignItems={'center'}
                                    >

                                        <TabPanel
                                            width={'100%'} 
                                            height={'auto' || '100%'}   
                                            justifyContent={'center'}
                                            alignContent={'center'}
                                            alignItems={'center'}
                                        >
                                            <NetworkGraph members={members}/>
                                        </TabPanel>
                                        <TabPanel width={'100%'}>
                                            <MemberCard members={members} />
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </Flex>
                        }
                    </Flex>
            }
        </Flex>   
    );
};

export default ResultsTabs;
