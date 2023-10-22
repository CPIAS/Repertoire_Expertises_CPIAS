import { EmailIcon } from '@chakra-ui/icons';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Button, Flex, Link, Tag } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';
import ProfileCorrectionModal from '../modals/ProfileCorrectionModal';

const MemberCard: React.FC<{ members: Member[] }> = ({ members }) => {
    const [profileCorrectionModalStates, setProfileCorrectionModalStates] = useState(
        members.map(() => false)
    );

    const openProfileCorrectionModal = (member: Member, index: number) => {
        const updatedStates = [...profileCorrectionModalStates];
        updatedStates[index] = true;
        setProfileCorrectionModalStates(updatedStates);
    };

    const closeProfileCorrectionModal = (index: number) => {
        const updatedStates = [...profileCorrectionModalStates];
        updatedStates[index] = false;
        setProfileCorrectionModalStates(updatedStates);
    };

    return (
        <Accordion 
            width={'100%'} 
            allowToggle
            border={'none'}
            borderRadius={'0.5rem'}
            
        >
            {members.map((member, index) => (
                <AccordionItem
                    key={member.userId}
                    width={'100%'}
                    marginY={'1rem'}
                    backgroundColor={colors.darkAndLight.white}
                    border={`1px solid ${colors.grey.dark}`}
                    borderRadius={'inherit'}
                    boxShadow={`0px 0px 2.5px 0px ${colors.grey.dark}`}

                >
                    <AccordionButton
                        width={'100%'}
                        padding={'1.5rem'}    
                        _hover={{backgroundColor:'none'}}
                    >
                        <Flex
                            width={'100%'}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex 
                                width={'100%'}
                                flexWrap={'wrap'}
                            >
                                <Flex width={'100%'} fontSize={'xl'} fontWeight={'bold'}>
                                    {`${member.firstName} ${member.lastName}`}
                                </Flex>
                                <Flex width={'100%'}>
                                    {`${member.membershipCategory} - ${member.affiliationOrganization}`}
                                </Flex>
                            </Flex>
                            {member.skills.length > 0 &&
                                <Flex
                                    width={'100%'}
                                    alignItems={'center'}
                                >
                                    <Tag 
                                        colorScheme='orange'
                                        borderRadius='full'
                                        size={'md'}
                                        border={'1px solid'}
                                        borderColor={colors.orange.main}
                                    >
                                        {`${member.skills}`}
                                    </Tag>
                                </Flex>
                            }
                        </Flex>
                        <AccordionIcon 
                            boxSize={16}
                            color={colors.grey.dark}
                            _hover={{color: colors.orange.main}}
                        />
                    </AccordionButton>
                    <AccordionPanel 
                        padding={'1.5rem'}  
                    >
                        <Flex
                            width={'100%'}
                            alignItems={'center'}
                        >
                            <EmailIcon boxSize={8} paddingRight={'0.5rem'}/> 
                            <Link 
                                href={`mailto:${member.email}`} 
                                isExternal 
                                color="blue.500" 
                                textDecoration="underline"
                            >
                                {member.email}
                            </Link>
                        </Flex>
                        <Button
                            onClick={()=>openProfileCorrectionModal(member, index)}
                        >
                            {'Send email'}
                            <ProfileCorrectionModal 
                                member={member}
                                isOpen={profileCorrectionModalStates[index]}
                                onClose={() => closeProfileCorrectionModal(index)} 
                            />
                        </Button>
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default MemberCard;
