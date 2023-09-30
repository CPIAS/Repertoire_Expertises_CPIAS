import {
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
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
            size='3xl'
            isCentered
            
        >
            <ModalOverlay/>
            <ModalContent paddingX={'1rem'} height={'55vh'}>
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
                        alignItems={'center'}
                    >
                        {'TODO'}
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default UserGuideModal;
