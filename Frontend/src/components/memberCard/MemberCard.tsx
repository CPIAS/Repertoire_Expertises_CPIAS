import { EmailIcon } from '@chakra-ui/icons';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Image, Link, Tag } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';
import ProfileCorrectionModal from '../modals/ProfileCorrectionModal';

const MemberCard: React.FC<{ members: Member[], isReadOnly?: boolean }> = ({ members, isReadOnly = false }) => {
    const [profileCorrectionModalStates, setProfileCorrectionModalStates] = useState(
        members.map(() => false)
    );

    const openProfileCorrectionModal = (member: Member, index: number) => {
        if (isReadOnly) return;
        const updatedStates = [...profileCorrectionModalStates];
        updatedStates[index] = true;
        setProfileCorrectionModalStates(updatedStates);
    };

    const closeProfileCorrectionModal = (index: number) => {
        const updatedStates = [...profileCorrectionModalStates];
        updatedStates[index] = false;
        setProfileCorrectionModalStates(updatedStates);
    };

    const getDescription = (member: Member) => {
        const filteredCategory = member.membershipCategory.trim() === 'Autre' ? '' : member.membershipCategory;
        const filteredOrganization = member.affiliationOrganization.split(',').filter(organization => organization.trim() !== 'Autre');
        const organizationsAbreviations = filteredOrganization.map((org) => org.split('- ')[0]);
        const organizations = filteredOrganization.map((org) => org.split('- ')[1]);
        const shouldIncludeParentheses = (filteredCategory && filteredOrganization.length > 0);
      
        return (
            <>
                {filteredCategory}
                {shouldIncludeParentheses ? ' (' : ''}
                {organizationsAbreviations.map((org, index) => (
                    <Tooltip hasArrow placement={'bottom'} label={organizations[index]} key={index}>
                        <Text>
                            {org}{index < organizationsAbreviations.length-1 && (',')}
                        </Text>
                        
                    </Tooltip>
                ))}
                {shouldIncludeParentheses ? ')' : ''}
            </>
        );
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
                            flexWrap={'nowrap'}
                            gap={'1rem'}
                        >
                            <Flex
                                marginRight={'0.5rem'}
                            >
                                <Image 
                                    // src={member.profilePicture ?? './images/avatar/generic-avatar.png'}
                                    src={member.profilePicture ? `https://drive.google.com/uc?export=view&id=${member.profilePicture}` : './images/avatar/generic-avatar.png'}
                                    borderRadius='full'
                                    border={`1px solid ${colors.grey.dark}`}
                                    boxSize='125px'
                                />
                            </Flex>
                            <Flex
                                flexWrap={'wrap'}
                                alignItems={'center'}
                                gap={'0.5rem'}
                            >
                                <Flex 
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                    alignItems={'center'}
                                >
                                    <Flex width={'100%'} fontSize={'xl'} fontWeight={'bold'} alignItems={'center'}>
                                        {`${member.firstName} ${member.lastName}`}
                                    </Flex>
                                    <Flex maxWidth={'80%'} alignItems={'center'}>
                                        {`${member.membershipCategory} - ${member.affiliationOrganization.split(',')}`}
                                    </Flex>
                                </Flex>
                                <Flex
                                    width={'100%'}
                                    gap={'0.5rem'}
                                >
                                    {member.tags.length > 0 
                                        && member.tags.split(/,| et /).map((tag, index) => (
                                            <Flex
                                                key={`${index}_flex`}
                                                alignItems={'center'}
                                            >
                                                <Tag 
                                                    colorScheme='orange'
                                                    borderRadius='full'
                                                    size={'md'}
                                                    border={'1px solid'}
                                                    borderColor={colors.orange.main}
                                                >
                                                    {tag.trim().length <= 3 ? tag.trim().toUpperCase() : `${tag.trim().charAt(0).toUpperCase()}${tag.trim().slice(1).toLowerCase()}`}
                                                </Tag>
                                            </Flex>
                                        ))
                                    }

                                </Flex>
                            </Flex>
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
                        <Flex
                            width={'100%'}
                            justifyContent={'flex-end'}
                        >
                            <Link 
                                fontWeight={'medium'}
                                color={colors.grey.dark}
                                onClick={()=>openProfileCorrectionModal(member, index)}
                            >
                                {'Corriger les informations'}
                                {profileCorrectionModalStates[index] && (
                                    <ProfileCorrectionModal 
                                        member={member}
                                        isOpen={profileCorrectionModalStates[index]}
                                        onClose={() => closeProfileCorrectionModal(index)} 
                                    />
                                )}
                            </Link>
                        </Flex>
                        
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default MemberCard;
