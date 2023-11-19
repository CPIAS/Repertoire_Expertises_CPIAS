/* eslint-disable @typescript-eslint/no-explicit-any */
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Image, Link, SkeletonCircle, Tag, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaLinkedin, FaRegEnvelope } from 'react-icons/fa';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';
import ProfileCorrectionModal from '../modals/ProfileCorrectionModal';

const API_HOST = process.env.REACT_APP_SERVER_URL;
const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface MemberCardProps {
    member: Member;
    isReadOnly?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isReadOnly = false }) => {
    const [profileCorrectionModalState, setProfileCorrectionModalState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState<string>('');

    // Fetch profile picture from the server
    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const response = await axios.get(`${API_HOST}/download_user_photo/${member.userId}`, {
                    headers: {
                        'Authorization': `${API_KEY}`
                    },
                    responseType: 'arraybuffer',
                });
                const imageData = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                const imageUrl = `data:image/png;base64,${imageData}`;
            
                setProfilePicture(imageUrl);
            } catch (error: any) {        
                if (error?.response?.status === 404) {
                    console.clear();
                    setProfilePicture('./images/avatar/generic-avatar.png');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfilePicture();
    }, []);

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
                                width={{ base: '100px', md:'125px' }}

                            >
                                {isLoading ? (
                                    <SkeletonCircle size={{ base: '100px', md:'125px' }} />
                                ) : (
                                    <Image src={profilePicture} borderRadius='full' border={`1px solid ${colors.grey.dark}`} />
                                )}
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
                        gap={'0.75rem'}
                        flexWrap={'wrap'}
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
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'0.5rem'}
                        >
                            <Text
                                fontSize={'lg'}
                                fontWeight={'bold'}
                                width={'100%'}
                            >
                                {'Type de membre'}
                            </Text>
                            <Text width={'100%'}>
                                {member.membershipCategory}
                            </Text>
                        </Flex>

                        <Flex
                            width={'100%'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                        >
                            <Text
                                fontSize={'lg'}
                                fontWeight={'bold'}
                                width={'100%'}
                                paddingBottom={'0.5rem'}
                            >
                                {'Organisation(s) d\'affiliation'}
                            </Text>
                            {member.affiliationOrganization.split(',').map((org: string, index: number) => (
                                <Text key={index} width={'100%'}>
                                    {org}
                                </Text>
                            ))}
                        </Flex>
                        <Flex
                            width={'100%'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                        >
                            <Text
                                fontSize={'lg'}
                                fontWeight={'bold'}
                                width={'100%'}
                                paddingBottom={'0.5rem'}
                            >
                                {'Titre d\'emploi'}
                            </Text>
                            <Text width={'100%'}>
                                {member.jobPosition}
                            </Text>

                        </Flex>
                        <Flex
                            width={'100%'}
                            justifyContent={'flex-start'}
                            flexWrap={'wrap'}
                            gap={'0.5rem'}
                        >
                            <Text
                                fontSize={'lg'}
                                fontWeight={'bold'}
                                width={'100%'}
                            >
                                {'Informations de contact'}
                            </Text>
                            <Flex
                                width={'100%'}
                                alignItems={'center'}
                            >
                                <FaRegEnvelope size={'32'} /> 
                                <Link 
                                    href={`mailto:${member.email}`} 
                                    isExternal 
                                    color="blue.500" 
                                    textDecoration="underline"
                                    paddingLeft={'0.75rem'}
                                >
                                    {member.email}
                                </Link>
                            </Flex>
                            {member.linkedin && (
                                <Flex
                                    width={'100%'}
                                    alignItems={'center'}
                                >
                                    <FaLinkedin size={'32'} color={'#0077B5'}/> 
                                    <Link 
                                        href={member.linkedin}
                                        isExternal 
                                        color="blue.500" 
                                        textDecoration="underline"
                                        paddingLeft={'0.75rem'}
                                    >
                                        {`Retrouver ${member.firstName} sur LinkedIn`} 
                                    </Link>
                                </Flex>
                            )}
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
                    </Flex>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

export default MemberCard;
