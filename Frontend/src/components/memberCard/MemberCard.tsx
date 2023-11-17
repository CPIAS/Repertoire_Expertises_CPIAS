import { EmailIcon } from '@chakra-ui/icons';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Image, Link, Tag, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';
import ProfileCorrectionModal from '../modals/ProfileCorrectionModal';

interface MemberCardProps {
    member: Member;
    isReadOnly?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isReadOnly = false }) => {
    const [profileCorrectionModalState, setProfileCorrectionModalState] = useState(false);

    const openProfileCorrectionModal = () => {
        if (isReadOnly) return;
        setProfileCorrectionModalState(true);
    };

    const closeProfileCorrectionModal = () => {
        setProfileCorrectionModalState(false);
    };

    const getDescription = (member: Member) => {
        const filteredOrganization = member.affiliationOrganization.split(',').map((organization) => organization.trim());
        return (
            <>
                {filteredOrganization.map((org, index) => (
                    <React.Fragment key={index}>
                        <Text>
                            {org.split('-')[0]}
                        </Text>
                        {index < filteredOrganization.length - 1 && ','}
                    </React.Fragment>
                ))}
            </>
        );
    };

    const formatName = (name: string) => {
        return name
            .split(/\s+/)
            .map((word) => {
                const hyphenIndex = word.indexOf('-');
                if (hyphenIndex !== -1) {
                    const firstPart = word.slice(0, hyphenIndex + 1);
                    const restOfWord = word.slice(hyphenIndex + 1).charAt(0).toUpperCase() + word.slice(hyphenIndex + 2).toLowerCase();
                    return `${firstPart}${restOfWord}`;
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
            })
            .join(' ');
    };

    const getTags = () => {
        return member.tags.length > 0 
            && member.tags.split(/,| et /).slice(0, 5).map((tag, index) => (
                <Flex
                    key={`${index}_flex`}
                    alignItems={'center'}
                    textOverflow={'ellipsis'}
                    whiteSpace={'nowrap'}
                >
                    <Tag 
                        colorScheme='orange'
                        borderRadius='full'
                        size={{ base: 'sm', md:'md', lg: 'md' }}
                        border={'1px solid'}
                        borderColor={colors.orange.main}
                    >
                        {tag.trim().length <= 3 ? tag.trim().toUpperCase() : `${tag.trim().charAt(0).toUpperCase()}${tag.trim().slice(1).toLowerCase()}`}
                    </Tag>
                </Flex>
            ));
    };

    return (
        <Accordion 
            width={'100%'} 
            allowToggle
            border={'none'}
            borderRadius={'0.5rem'}
        >
            <AccordionItem
                width={'100%'}
                marginY={'0.5rem'}
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
                        alignItems={'center'}
                       
                    >
                    
                        <Flex
                            width={'90%'}
                            flexWrap={'nowrap'}
                            gap={'1rem'}
                        >
                            <Flex
                                marginRight={{ base: 'none', md:'0.5rem', lg: '0.5rem' }}
                                width={{ base: '100px', md:'125px', lg: '125px' }}

                            >
                                <Image 
                                    src={member.profilePicture ? `https://drive.google.com/uc?export=view&id=${member.profilePicture}` : './images/avatar/generic-avatar.png'}
                                    borderRadius='full'
                                    border={`1px solid ${colors.grey.dark}`}

                                />
                            </Flex>
                            <Flex
                                width={'90%'}
                                flexWrap={'wrap'}
                                alignItems={'center'}
                                gap={'0.5rem'}
                            >
                                <Flex 
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                    alignItems={'center'}
                                >
                                    <Flex width={'100%'} fontSize={{ base: 'sm', md:'lg', lg: 'xl' }} fontWeight={'bold'} alignItems={'center'}>
                                        {formatName(`${member.firstName} ${member.lastName}`)}
                                    </Flex>
                                    <Flex 
                                        maxWidth={'100%'} 
                                        alignItems={'center'} 
                                        overflowX={'auto'} 
                                        display={{ base: 'none', md:'flex', lg: 'flex' }}
                                    >
                                        {getDescription(member)}
                                    </Flex>
                                </Flex>
                                <Flex
                                    maxWidth={'95%'}
                                    gap={'0.5rem'}
                                    paddingY={'0.25rem'}
                                    overflowX={'auto'}
                                    display={{ base: 'none', md:'flex', lg: 'flex' }}
                                >
                                    {getTags()}
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex
                            width={'10%'}
                            justifyContent={'center'}
                        >
                            <AccordionIcon 
                                boxSize={{base: 8, sm: 12, md: 16}}
                                color={colors.grey.dark}
                                _hover={{color: colors.orange.main}}
                            />
                        </Flex>
                    </Flex>
                    
                </AccordionButton>
                <AccordionPanel 
                    padding={{ base: 'none', md:'1.5rem', lg: '1.5rem' }}  
                >
                    <Flex
                        width={'100%'}
                        gap={'0.5rem'}
                        paddingBottom={'1.5rem'}
                        display={{ base: 'flex', md:'none', lg: 'none' }}
                        overflowX={'scroll'}
                    >
                        {getTags()}
                    </Flex>

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
                        display={isReadOnly ? 'none':'flex'}
                    >
                        <Link 
                            fontWeight={'medium'}
                            color={colors.grey.dark}
                            onClick={()=>openProfileCorrectionModal()}
                        >
                            {'Corriger les informations'}
                            {profileCorrectionModalState && (
                                <ProfileCorrectionModal 
                                    member={member}
                                    isOpen={profileCorrectionModalState}
                                    onClose={() => closeProfileCorrectionModal()} 
                                />
                            )}
                        </Link>
                    </Flex>
                        
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

export default MemberCard;
