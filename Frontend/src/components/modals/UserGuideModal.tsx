import {
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
} from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const UserGuideModal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose 
}) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size='5xl'
            isCentered
            
        >
            <ModalOverlay/>
            <ModalContent paddingX={'1rem'} height={'85vh'}>
                <ModalHeader 
                    textAlign={'center'}
                    fontSize={'2xl'}
                    borderBottom={`1px solid ${colors.grey.dark}`}
                >
                    {'Guide d\'utilisation'}
                </ModalHeader>
                <ModalCloseButton margin={'0.5rem'}/>
                <ModalBody>
                    <Flex 
                        width={'100%'}
                        height={'100%'}
                        justifyContent={'center'}
                        alignContent={'flex-start'}
                    >
                        <Flex>
                            <Text textAlign={'justify'}>
                                {'Le répertoire des expertises de la Communauté de pratique IA en santé est un outil permettant de découvrir les experts en évoquant une problématique. La plateforme présente les profils des membres et cartographie les expertises selon le domaine de pratique de chaque membre.'}
                            </Text>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default UserGuideModal;
