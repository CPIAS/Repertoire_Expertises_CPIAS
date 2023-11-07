import { Button, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Member } from '../../models/member';

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
    
    useEffect(()=>{
        setEditedMember(selectedMember);
    }, [selectedMember]);

    const handleFieldChange = (fieldName: string, value: string | number) => {
        if (editedMember) {
            setEditedMember({ ...editedMember, [fieldName]: value });
        }
    };

    const handleSaveChanges = () => {
        if (editedMember) {
            // Envoyez les données mises à jour au serveur (par exemple, via une requête axios).
            // Une fois que les modifications sont enregistrées, fermez la modale.
            // Vous pouvez également gérer la logique de mise à jour de l'objet Member sur le serveur ici.
            console.log(editedMember);
            setIsModalOpen(false);
        }
    };

    return (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size='3xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{'Détails du membre'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {editedMember && (
                        <>
                            <FormLabel htmlFor="userId" paddingTop={'1rem'}>ID</FormLabel>
                            <Input
                                id="userId"
                                value={editedMember.userId}
                                onChange={(e) => handleFieldChange('userId', e.target.value)}
                                
                            />

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
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" onClick={() => setIsModalOpen(false)}>
                        Fermer
                    </Button>
                    <Button colorScheme="green" onClick={handleSaveChanges}>
                        Enregistrer
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditMemberProfileModal;