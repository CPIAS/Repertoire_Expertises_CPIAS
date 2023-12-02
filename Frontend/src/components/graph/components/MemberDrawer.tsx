/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerOverlay, Flex, Image, Link, SkeletonCircle, Tag, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaLinkedin, FaRegEnvelope } from 'react-icons/fa';
import { Member } from '../../../models/member';
import { formatName } from '../../../utils/formatName';
import colors from '../../../utils/theme/colors';

const API_HOST = process.env.REACT_APP_SERVER_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

interface MemberDrawer {
    selectedMember: Member;
    isOpen: boolean;
    setDrawerOpen: (isDrawerOpen: boolean) => void;
}

const MemberDrawer: React.FC<MemberDrawer> = ({
    selectedMember,
    isOpen,
    setDrawerOpen
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState<string>('./images/avatar/generic-avatar.png');

    /**
     * Fetch the profile picture from the server based on the selected member's userId,
     * or display a generic image in case of an error or absence of a profile picture.
     */
    useEffect(() => {
        const fetchProfilePicture = async () => {
            setIsLoading(true);
            setProfilePicture('./images/avatar/generic-avatar.png');
            try {
                const response = await axios.get(`${API_HOST}/download_user_photo/${selectedMember.userId}`, {
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

        fetchProfilePicture();
    }, [selectedMember]);

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={() => setDrawerOpen(false)}
            size={'lg'}
        >
            <DrawerOverlay>
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody>
                        <Flex
                            width={'100%'}
                            justifyContent={'center'}
                            alignContent={'center'}
                            flexWrap={'wrap'}
                            gap={'0.75rem'}
                            paddingTop={'2rem'}
                        >
                            <Flex
                                width={'200px'}
                                justifyContent={'center'}
                            >
                                {isLoading ? (
                                    <SkeletonCircle size={'200px'} />
                                ) : (
                                    <Image src={profilePicture} borderRadius='full' border={`1px solid ${colors.grey.dark}`} width={'200px'}/>
                                )}
                            </Flex>
                            <Flex
                                width={'100%'}
                                justifyContent={'center'}
                                alignItems={'center'}
                            >
                                <Text
                                    textAlign={'center'}
                                    fontSize={'2xl'}
                                    fontWeight={'bold'}
                                >
                                    {formatName(`${selectedMember.firstName} ${selectedMember.lastName}`)}
                                </Text>
                            </Flex>
                            <Flex
                                width={'100%'}
                                gap={'0.5rem'}
                                flexWrap={'wrap'}
                                justifyContent={'center'}
                                overflowX={'scroll'}
                            >
                                {selectedMember.tags.length > 0 
                                        && selectedMember.tags.split(/,| et /).map((tag, index) => (
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
                        <Flex
                            width={'100%'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            flexWrap={'wrap'}
                            gap={'1.75rem'}
                            paddingTop={'1rem'}
                        >
                            <Flex
                                width={'100%'}
                                justifyContent={'flex-start'}
                                flexWrap={'wrap'}
                                gap={'0.5rem'}
                            >
                                <Text
                                    fontSize={{base: 'sm', md:'lg'}}
                                    fontWeight={'bold'}
                                    width={'100%'}
                                >
                                    {'Type de membre'}
                                </Text>
                                <Text width={'100%'} fontSize={{base: 'sm', md:'lg'}}>
                                    {selectedMember.membershipCategory}
                                </Text>
                            </Flex>

                            <Flex
                                width={'100%'}
                                justifyContent={'flex-start'}
                                flexWrap={'wrap'}
                            >
                                <Text
                                    fontSize={{base: 'sm', md:'lg'}}
                                    fontWeight={'bold'}
                                    width={'100%'}
                                    paddingBottom={'0.5rem'}
                                >
                                    {'Organisation(s) d\'affiliation'}
                                </Text>
                                {selectedMember.affiliationOrganization.split(',').map((org: string, index: number) => (
                                    <Text key={index} width={'100%'} fontSize={{base: 'sm', md:'lg'}}>
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
                                    fontSize={{base: 'sm', md:'lg'}}
                                    fontWeight={'bold'}
                                    width={'100%'}
                                    paddingBottom={'0.5rem'}
                                >
                                    {'Titre d\'emploi'}
                                </Text>
                                <Text width={'100%'} fontSize={{base: 'sm', md:'lg'}}>
                                    {selectedMember.jobPosition}
                                </Text>

                            </Flex>
                            <Flex
                                width={'100%'}
                                justifyContent={'flex-start'}
                                flexWrap={'wrap'}
                                gap={'0.5rem'}
                            >
                                <Text
                                    fontSize={{base: 'sm', md:'lg'}}
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
                                        href={`mailto:${selectedMember.email}`} 
                                        isExternal 
                                        color="blue.500" 
                                        textDecoration="underline"
                                        paddingLeft={'0.75rem'}
                                    >
                                        {selectedMember.email}
                                    </Link>
                                </Flex>
                                {selectedMember.linkedin && (
                                    <Flex
                                        width={'100%'}
                                        alignItems={'center'}
                                    >
                                        <FaLinkedin size={'32'} color={'#0077B5'}/> 
                                        <Link 
                                            href={selectedMember.linkedin}
                                            isExternal 
                                            color="blue.500" 
                                            textDecoration="underline"
                                            paddingLeft={'0.75rem'}
                                        >
                                            {`Retrouver ${selectedMember.firstName} sur LinkedIn`} 
                                        </Link>
                                    </Flex>
                                )}
                            </Flex>
                            
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </DrawerOverlay>
        </Drawer>
    );
};

export default MemberDrawer;