/* eslint-disable @typescript-eslint/no-explicit-any */
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Image, Link, SkeletonCircle, Tag, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaLinkedin, FaRegEnvelope } from 'react-icons/fa';
import { Member } from '../../models/member';
import { formatName } from '../../utils/formatName';
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
    const [profilePicture, setProfilePicture] = useState<string>('./images/avatar/generic-avatar.png');

    /**
     * Fetch the profile picture from the server based on the member's userId,
     * or display a generic image in case of an error or absence of a profile picture.
     */
    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const response = await axios.get(`${API_HOST}/download_user_photo/${member.userId}`, {
                    headers: {
                        'Authorization': `${API_KEY}`
                    },
                    responseType: 'arraybuffer',
                });
                if (response.status !== 204) {
                    const imageData = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                    const imageUrl = `data:image/png;base64,${imageData}`;
                    setProfilePicture(imageUrl);
                }

            } catch (error: any) {        
                setProfilePicture('./images/avatar/generic-avatar.png');
            } finally {
                setIsLoading(false);
            }
        };
        if (!isReadOnly)
            fetchProfilePicture();
        else {
            setProfilePicture('./images/avatar/generic-avatar.png');
        }
    }, []);

    /**
     * Open the profile correction modal
     */
    const openProfileCorrectionModal = () => {
        if (isReadOnly) return;
        setProfileCorrectionModalState(true);
    };

    /**
     * Close the profile correction modal
     */
    const closeProfileCorrectionModal = () => {
        setProfileCorrectionModalState(false);
    };

    /**
     * Generate a formatted description for a member based on their affiliation organizations.
     *
     * @param {Member} member - The member object for which to generate the description.
     * @returns {React.ReactNode} The formatted description as a React node.
     */
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

    /**
     * Generate Tag components based on the tags of a member.
     *
     * @returns {React.ReactNode | null} The rendered Tag components or null if there are no tags.
     */
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
                        {member.membershipCategory.length > 0 && 
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
                        }
                        {member.affiliationOrganization.length > 0 && 
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
                        }
                        {member.jobPosition.length > 0 && 
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
                        }
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
