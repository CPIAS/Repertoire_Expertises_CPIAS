/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadIcon } from '@chakra-ui/icons';
import { Button, Flex, FormLabel, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SkeletonCircle, Tab, TabList, TabPanel, TabPanels, Tabs, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';

const API_HOST = process.env.REACT_APP_SERVER_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

type ModalProps = {
    selectedMember: Member;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    fetchMembers: () => Promise<void>
};

const EditMemberProfileModal: React.FC<ModalProps> = ({
    selectedMember,
    isModalOpen,
    setIsModalOpen,
    fetchMembers
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [editedMember, setEditedMember] = useState<Member | null>(selectedMember);
    const [isWaitingForDeletion, setIsWaitingForDeletion] = useState<boolean>(false);
    const [isWaitingForSave, setIsWaitingForSave] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState<string>('./images/avatar/generic-avatar.png');
    const toast = useToast();
    
    useEffect(()=>{
        setEditedMember(selectedMember);
    }, [selectedMember]);

    const handleFieldChange = (fieldName: string, value: string | number) => {
        if (editedMember) {
            setEditedMember({ ...editedMember, [fieldName]: value });
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        fetchProfilePicture();
    }, [selectedMember]);
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files !== null ? event.target.files[0] : null;
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/') || /\.(jpg)$/.test(selectedFile.name.toLowerCase())) {
                handleUploadPicture(selectedFile);
            } else {
                toast({
                    title: 'Fichier invalide.',
                    description: 'Veuillez ajouter une image en format JPG.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };
    const fetchProfilePicture = async () => {
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
    
    const handleDeleteUser = async () => {
        try {
            setIsWaitingForDeletion(true);
    
            await axios.delete(`${API_HOST}/delete_user/${editedMember?.userId}`, {
                headers: {
                    'Authorization': `${API_KEY}`,
                },
            });
    
            toast({
                title: 'Succès!',
                description: 'Le membre a été supprimé avec succès.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsModalOpen(false);
            fetchMembers();
        } catch (error) {
            console.error('Error while deleting user:', error);
    
            toast({
                title: 'Une erreur est survenue',
                description: 'Veuillez réessayer plus tard.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsWaitingForDeletion(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (editedMember && editedMember.userId) {
                setIsWaitingForSave(true);
    
                const requestData = {
                    last_name: editedMember.lastName,
                    first_name: editedMember.firstName,
                    email: editedMember.email,
                    membership_category: editedMember.membershipCategory,
                    job_position: editedMember.jobPosition,
                    affiliation_organization: editedMember.affiliationOrganization,
                    linkein: editedMember.linkedin
                };
    
                await axios.put(`${API_HOST}/update_user/${editedMember.userId}`, requestData, {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                toast({
                    title: 'Succès!',
                    description: 'Les changements ont été sauvegardés.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
    
                setIsModalOpen(false);
                fetchMembers();
            }
        } catch (error) {
            console.error('Error while updating user:', error);
    
            toast({
                title: 'Une erreur est survenue',
                description: 'Veuillez réessayer plus tard.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsWaitingForSave(false);
        }
    };

    const handleUploadPicture = async (image: File) => {
        try {
            if (image) {
                const formData = new FormData();
                formData.append('user_photo', image);
                await axios.post(`${API_HOST}/upload_user_photo/${selectedMember.userId}`, formData, {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                toast({
                    title: 'Succès!',
                    description: 'La photo a été mise à jour.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });

                fetchProfilePicture();
            }
        } catch (error) {
            console.error('Error while uploading profile picture:', error);

            toast({
                title: 'Une erreur est survenue',
                description: 'Veuillez réessayer plus tard.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size={{base:'full', md:'6xl'}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{'Détails du membre'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody
                    overflowY={'scroll'}
                    height={'70vh'}
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
                                {'Informations'}
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
                                {'Photo de profil'}
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
                            <TabPanel width={'100%'}>
                                {editedMember && (
                                    <>
                                        <FormLabel htmlFor="lastName" paddingTop={'1rem'}>Nom</FormLabel>
                                        <Input
                                            id="lastName"
                                            value={editedMember.lastName}
                                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                        />

                                        <FormLabel htmlFor="firstName" paddingTop={'1rem'}>Prénom</FormLabel>
                                        <Input
                                            id="firstName"
                                            value={editedMember.firstName}
                                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                        />

                                        <FormLabel htmlFor="email" paddingTop={'1rem'}>Courriel</FormLabel>
                                        <Input
                                            id="email"
                                            value={editedMember.email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                        />

                                        <FormLabel htmlFor="membershipCategory" paddingTop={'1rem'}>Type de membre</FormLabel>
                                        <Input
                                            id="membershipCategory"
                                            value={editedMember.membershipCategory}
                                            onChange={(e) => handleFieldChange('membershipCategory', e.target.value)}
                                        />

                                        <FormLabel htmlFor="jobPosition" paddingTop={'1rem'}>Titre d'emploi</FormLabel>
                                        <Input
                                            id="jobPosition"
                                            value={editedMember.jobPosition}
                                            onChange={(e) => handleFieldChange('jobPosition', e.target.value)}
                                        />

                                        <FormLabel htmlFor="affiliationOrganization" paddingTop={'1rem'}>Organisation d'affiliation</FormLabel>
                                        <Input
                                            id="affiliationOrganization"
                                            value={editedMember.affiliationOrganization}
                                            onChange={(e) => handleFieldChange('affiliationOrganization', e.target.value)}
                                        />

                                        <FormLabel htmlFor="linkedin" paddingTop={'1rem'}>Profil LinkedIn</FormLabel>
                                        <Input
                                            id="linkedin"
                                            value={editedMember.linkedin}
                                            onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                                        />

                                    </>
                                )}
                                <Flex 
                                    width={'100%'}
                                    justifyContent={{base:'center', sm:'space-between'}}
                                    flexWrap={{base:'wrap', sm: 'nowrap'}}
                                    gap={'1rem'}
                                    paddingTop={'1.5rem'}
                                >
                                    <Flex
                                        justifyContent={{base:'center', sm:'space-between'}}
                                        width={{base: '100%', md:'none'}}
                                    >
                                        <Button size={'md'}
                                            backgroundColor={colors.red.light}
                                            color={colors.darkAndLight.white}
                                            fontWeight={'normal'}
                                            _hover={{
                                                backgroundColor: colors.red.dark,
                                            }}
                                            _active={{
                                                backgroundColor: colors.red.dark,
                                            }} onClick={() => handleDeleteUser()}
                                            isLoading={isWaitingForDeletion}
                                            isDisabled={isWaitingForSave}
                                        >
                                            {'Supprimer le membre'}
                                        </Button>
                                    </Flex>
                                    <Flex
                                        gap={'1rem'}
                                    >
                                        <Button 
                                            size={'md'}
                                            backgroundColor={colors.darkAndLight.white}
                                            color={colors.blue.main}
                                            border={`2px solid ${colors.blue.light}`}
                                            _hover={{
                                                backgroundColor: colors.blue.lighter,
                                            }}
                                            _active={{
                                                backgroundColor: colors.blue.lighter,
                                            }}
                                            onClick={() => setIsModalOpen(false)}
                                            isDisabled={isWaitingForSave || isWaitingForDeletion}
                                        >
                                            {'Annuler'}
                                        </Button>
                                        <Button 
                                            size={'md'}
                                            backgroundColor={colors.blue.main}
                                            color={colors.darkAndLight.white}
                                            fontWeight={'normal'}
                                            _hover={{
                                                backgroundColor: colors.blue.light,
                                            }}
                                            _active={{
                                                backgroundColor: colors.blue.light,
                                            }}
                                            onClick={handleSaveChanges}
                                            isLoading={isWaitingForSave}
                                            isDisabled={isWaitingForDeletion}
                                        >
                                            {'Enregistrer'}
                                        </Button>
                                    </Flex>
                                </Flex>
                            </TabPanel>
                            <TabPanel width={'100%'}>
                                <Flex
                                    width={'100%'}
                                    justifyContent={'center'}
                                    flexWrap={'wrap'}
                                    gap={'3.5rem'}
                                    paddingTop={'2.5rem'}
                                >
                                    <Flex
                                        width={'350px'}
                                    >
                                        {isLoading ? (
                                            <SkeletonCircle size={'350px'} />
                                        ) : (
                                            <Image src={profilePicture} borderRadius='full' border={`1px solid ${colors.grey.dark}`} width={'350px'}/>
                                        )}
                                    </Flex>
                                    <Flex
                                        width={'100%'}
                                        alignItems={'center'}
                                        justifyContent={'center'}
                                        gap={'1rem'} 
                                    >
                                    
                                        <Button 
                                            size={'md'}
                                            backgroundColor={colors.darkAndLight.white}
                                            color={colors.blue.main}
                                            fontWeight={'normal'}
                                            border={`2px solid ${colors.blue.lighter}`}
                                            _hover={{
                                                backgroundColor: colors.blue.lighter,
                                            }}
                                            _active={{
                                                backgroundColor: colors.blue.lighter,
                                            }}
                                            onClick={handleButtonClick}
                                            leftIcon={<DownloadIcon transform="rotate(180deg)"/>}
                                        >
                                            {'Téléverser une nouvelle photo'}
                                        </Button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                        />
                                    </Flex>
                                </Flex>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditMemberProfileModal;