import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import React from 'react';
import NetworkGraph from '../../../components/graph/Graph';
import Loader from '../../../components/loader/Loader';
import MemberCard from '../../../components/memberCard/MemberCard';
import { ResultsMembers } from '../../../models/member';
import colors from '../../../utils/theme/colors';

interface SearchResultsProps {
    results: ResultsMembers[];
    isLoading: boolean;
    noResultsText: string;
}

const ResultsTabs: React.FC<SearchResultsProps> = ({ 
    results,
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
                        width={{base: '100%', lg:'90%'}}
                        height={'100%'}
                        flexWrap={'wrap'}
                        alignContent={'flex-start'}
                        gap={'1rem'}
                    >
                    
                        <Flex
                            width={'100%'}
                            flexWrap={'wrap'}
                        >
                            <Flex
                                width={'100%'}
                                fontSize={'3xl'}
                                fontWeight={'bold'}
                                flexWrap={'wrap'}
                            >
                                {noResultsText}
                            </Flex>
                            
                        </Flex>
                        
                        {results.length > 0 &&
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
                                            paddingX={{base: '1rem', md:'5rem'}}
                                            _active={{
                                                backgroundColor: colors.grey.main,
                                            }}
                                            _selected={{ 
                                                borderBottom: `3.5px solid ${colors.orange.main}`,
                                            }}
                                            fontSize={{base: 'sm', sm: 'md', lg: 'lg'}}
                                        >
                                            {'Cartographie'}
                                        </Tab>
                                        <Tab
                                            paddingX={{base: '1rem', md:'5rem'}}
                                            _active={{
                                                backgroundColor: colors.grey.main,
                                            }}
                                            _selected={{ 
                                                borderBottom: `3.5px solid ${colors.orange.main}`,
                                            }}
                                            fontSize={{base: 'sm', sm: 'md', lg: 'lg'}}
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
                                            { <NetworkGraph results={results}/> }
                                        </TabPanel>

                                        <TabPanel width={'100%'}>
                                            <Text
                                                width={'100%'}
                                                fontWeight={'bold'}
                                                fontSize={{base: 'lg', md:'xl', lg:'2xl'}}
                                                paddingBottom={'1rem'}
                                            >
                                                {'Pour réaliser ce type de projet, vous avez besoin de...'}
                                            </Text>
                                            {results.map((res) => (
                                                <Flex width={'100%'}>
                                                    <Accordion
                                                        width={'100%'}
                                                        allowToggle
                                                    >
                                                        <AccordionItem
                                                            border={`1px solid ${colors.grey.dark}`}
                                                            backgroundColor={colors.grey.main}
                                                            borderRadius={'0.25rem'}
                                                            marginY={'0.25rem'}
                                                        >
                                                            <AccordionButton
                                                                _hover={{backgroundColor:'none'}}
                                                            >
                                                                <Flex
                                                                    width={'100%'}
                                                                    justifyContent={'space-between'}
                                                                    alignItems={'center'}
                                                                >
                                                                    <Flex
                                                                        fontSize={{base:'sm', md:'lg', lg:'xl'}}
                                                                        textAlign={'start'}

                                                                    >
                                                                        {`${res.category.charAt(0).toUpperCase()}${res.category.slice(1)}`}
                                                                    </Flex>
                                                                    <AccordionIcon 
                                                                        boxSize={{base: 8, sm: 12, md: 16}}
                                                                        color={colors.grey.dark}
                                                                        _hover={{color: colors.orange.main}}
                                                                    />
                                                                </Flex>
                                                               
                                                            </AccordionButton>
                                                            <AccordionPanel>
                                                                <Flex
                                                                    width={'100%'}
                                                                    flexWrap={'wrap'}
                                                                    paddingX={{ base: '0rem', md: '2.5rem' }}
                                                                    paddingBottom={'1rem'}
                                                                >
                                                                    {res.recommendation.length > 0 ? (
                                                                        res.recommendation.map((expert, index) => (
                                                                            <MemberCard member={expert.expert} key={`${index}_${expert.expert.userId}`} />
                                                                        ))
                                                                    ) : (
                                                                        <Text
                                                                            fontSize={{ base: 'sm', md: 'lg', lg: 'xl' }}
                                                                            textAlign={'start'}
                                                                            fontStyle={'italic'}
                                                                        >{'Aucun expert trouvé dans cette catégorie'}</Text>
                                                                    )}
                                                                </Flex>
                                                            </AccordionPanel>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </Flex>
                                            ))}
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
