import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import React, { useState } from 'react';

const SuccessModal: React.FC = () => {
    const [isOpen, setIsWaitingForResponse] = useState<boolean>(false);
    const [isSuccessScreenShown, setIsSuccessScreenShown] = useState<boolean>(true);

    const closeProfileCorrectionModal = () => {
        console.log('salut');
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={closeProfileCorrectionModal}
            size='4xl'
            isCentered
        
        >
            <ModalOverlay/>
        
            <ModalContent paddingX={'1rem'} height={'75vh'} minHeight={'75vh'}>
                <ModalCloseButton margin={'0.5rem'}/>
                <ModalBody
                    overflowY={'scroll'}
                >
                    <Flex>
                        {'salut'}
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SuccessModal;