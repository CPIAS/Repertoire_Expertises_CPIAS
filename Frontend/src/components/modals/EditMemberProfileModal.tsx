import { Button, Flex, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';

const API_HOST = process.env.REACT_APP_SERVER_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

type ModalProps = {
    selectedMember: Member;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
};

const EditMemberProfileModal: React.FC<ModalProps> = ({
    selectedMember,
    isModalOpen,
    setIsModalOpen
}) => {
    const [editedMember, setEditedMember] = useState<Member | null>(selectedMember);
    const [isWaitingForDeletion, setIsWaitingForDeletion] = useState<boolean>(false);
    const [isWaitingForSave, setIsWaitingForSave] = useState<boolean>(false);
    const toast = useToast();
    
    useEffect(()=>{
        setEditedMember(selectedMember);
    }, [selectedMember]);

    const handleFieldChange = (fieldName: string, value: string | number) => {
        if (editedMember) {
            setEditedMember({ ...editedMember, [fieldName]: value });
        }
    };
    
    const handleDeleteUser = async () => {
        try {
            if (editedMember && editedMember.userId) {
                setIsWaitingForDeletion(true);
                await axios.delete(`${API_HOST}/delete_user/${editedMember.userId}`, {
                    headers: {
                        'Authorization': `${API_KEY}`
                    }
                });
                toast({
                    title: 'Succès!',
                    description: 'Le membre a été supprimé avec succès.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                setIsModalOpen(false);
                setIsWaitingForDeletion(false);
            }
        } catch (error) {
            toast({
                title: 'Une erreur est survenue',
                description: 'Veuillez réessayer plus tard.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsWaitingForDeletion(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (editedMember && editedMember.userId) {
                setIsWaitingForSave(true);
        
                await axios.put(`${API_HOST}/update_user/${editedMember.userId}`, editedMember, {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                toast({
                    title: 'Succès!',
                    description: 'Les changements ont été sauvegardés avec succès.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
    
                setIsModalOpen(false);
                setIsWaitingForSave(false);
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
    
            setIsWaitingForSave(false);
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
                    maxHeight={'70vh'}
                >
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
                                onChange={(e) => handleFieldChange('email', e.target.value)}
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

                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Flex 
                        width={'100%'}
                        justifyContent={{base:'center', sm:'space-between'}}
                        flexWrap={{base:'wrap', sm: 'nowrap'}}
                        gap={'1rem'}
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
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditMemberProfileModal;