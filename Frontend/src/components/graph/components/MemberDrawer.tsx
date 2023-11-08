import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerOverlay, Flex, Image, Link, Tag, Text } from '@chakra-ui/react';
import React from 'react';
import { FaLinkedin, FaRegEnvelope } from 'react-icons/fa';
import { Member } from '../../../models/member';
import colors from '../../../utils/theme/colors';

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
                            {/* <Flex
                                width={'200px'}
                                height={'200px'}
                                borderRadius={'full'}
                                border={'2px solid black'}
                            > */}
                            {/* PROFILE PICTURE HERE */}
                            {/* </Flex> */}

                            <Image
                                src={selectedMember.profilePicture ? `https://drive.google.com/uc?export=view&id=${selectedMember.profilePicture}` : './images/avatar/generic-avatar.png'}
                                borderRadius='full'
                                border={`1px solid ${colors.darkAndLight.black}`}
                                boxSize='200px'
                            />
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
                                    {`${selectedMember.firstName} ${selectedMember.lastName}`}
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
                                    fontSize={'lg'}
                                    fontWeight={'bold'}
                                    width={'100%'}
                                >
                                    {'Type de membre'}
                                </Text>
                                <Text width={'100%'}>
                                    {selectedMember.membershipCategory}
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
                                {selectedMember.affiliationOrganization.split(',').map(org => (
                                    <Text width={'100%'}>
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
                                        href={`mailto:${selectedMember.email}`} 
                                        isExternal 
                                        color="blue.500" 
                                        textDecoration="underline"
                                        paddingLeft={'0.75rem'}
                                    >
                                        {selectedMember.email}
                                    </Link>
                                </Flex>
                                <Flex
                                    width={'100%'}
                                    alignItems={'center'}
                                >
                                    <FaLinkedin size={'32'} color={'#0077B5'}/> 
                                    <Link 
                                        href={'http://linkedin.com'} //TODO : Add profile URL
                                        isExternal 
                                        color="blue.500" 
                                        textDecoration="underline"
                                        paddingLeft={'0.75rem'}
                                    >
                                        {/* //TODO : Add profile URL */}
                                        {'TODO: Add LinkedIn URL'} 
                                    </Link>
                                </Flex>
                            </Flex>
                            
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </DrawerOverlay>
        </Drawer>
    );
};

export default MemberDrawer;