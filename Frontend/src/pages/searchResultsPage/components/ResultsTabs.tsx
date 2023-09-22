import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';
import Loader from '../../../components/loader/Loader';
import MemberCard from '../../../components/memberCard/MemberCard';
import { Member } from '../../../models/member';
import colors from '../../../utils/theme/colors';

interface SearchResultsProps {
    members: Member[];
    isLoading: boolean;
}

const ResultsTabs: React.FC<SearchResultsProps> = ({ 
    members,
    isLoading
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
                    <Tabs 
                        size='lg' 
                        width={'90%'}
                        
                        backgroundColor={'white'}
                        borderTopRadius={'0.5rem'}
                        variant='enclosed'
                    >
                        <TabList 
                            paddingX={'1rem'}
                            border={'none'}
                            borderTopRadius={'0.5rem'}
                            borderX={`1px solid ${colors.grey.dark}`}
                            borderTop={`1px solid ${colors.grey.dark}`}
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
                                {'Expertises'}
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
                                {'Collaborations'}
                            </Tab>
                        </TabList>

                        <TabPanels 
                            borderX={`1px solid ${colors.grey.dark}`}
                            borderBottomRadius={'0.15rem'}
                            width={'90%'} 
                            height={'auto' || '100%'}
                            paddingX={'1rem'}
                            backgroundColor={'white'}
                        >
                            <TabPanel width={'100%'}>
                                <MemberCard members={members} />
                            </TabPanel>
                            <TabPanel
                                width={'90%'} 
                            >
                                <p>TODO</p>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
            }
        </Flex>   
    );
};

export default ResultsTabs;