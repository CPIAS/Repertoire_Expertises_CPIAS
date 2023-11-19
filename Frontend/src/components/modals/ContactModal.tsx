import { CloseIcon } from '@chakra-ui/icons';
import {
    Button,
    Flex,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useToast
} from '@chakra-ui/react';
import axios from 'axios';
import React, { ChangeEvent, useState } from 'react';
import colors from '../../utils/theme/colors';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const API_HOST = process.env.REACT_APP_SERVER_URL;
const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ContactModal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose 
}) => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isFirstNameFieldDirty, setIsFirstNameFieldDirty] = useState<boolean>(false);
    const [isLastNameFieldDirty, setIsLastNameFieldDirty] = useState<boolean>(false);
    const [isEmailFieldDirty, setIsEmailFieldDirty] = useState<boolean>(false);
    const [isMessageFieldDirty, setIsMessageFieldDirty] = useState<boolean>(false);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
    
    const toast = useToast();
    const checkFormIsValid = () => {
        return (message.trim().length > 0 && firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().length > 0);
    };

    const sendEmail = async () => {
        setIsWaitingForResponse(true);
        const formData = new FormData();
        formData.append('requesterFirstName', firstName);
        formData.append('requesterLastName', lastName);
        formData.append('requesterEmail', email);
        formData.append('message', message);

        axios
            .post(`${API_HOST}/request_contact`, formData, {
                headers: {
                    'Authorization': `${API_KEY}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(() => {
                setIsWaitingForResponse(false);
                toast({
                    title: 'Message envoyé à l\'administrateur du site.',
                    description: 'Nous vous remercions pour votre message. L\'administrateur vous répondra dès que possible.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                onClose();
            })
            .catch(() => {
                toast({
                    title: 'Une erreur est survenue.',
                    description: 'Veuillez réessayer plus tard.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                setIsWaitingForResponse(false);
            });
    };

    const closeModal = () => {
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size={{ base: 'full', lg: '4xl' }}
            isCentered
            
        >
            <ModalOverlay/>
            
            <ModalContent paddingX={'1rem'} height={'75vh'} minHeight={'75vh'}>
                <ModalHeader 
                    textAlign={'center'}
                    fontSize={'xl'}
                    borderBottom={`1px solid ${colors.grey.dark}`}
                >
                    {'Contactez-nous'}
                </ModalHeader>
                <ModalCloseButton margin={'0.5rem'}/>
                <ModalBody
                    overflowY={'scroll'}
                >
                    <Flex 
                        width={'100%'}
                        height={'100%'}
                        justifyContent={'center'}
                        alignContent={'flex-start'}
                        flexWrap={'wrap'}
                        gap={'1.25rem'}
                        overflowY={'scroll'}
                        paddingTop={'1rem'}
                    >
                        <Flex
                            width={'100%'}
                            justifyContent={'center'}
                            flexWrap={'wrap'}
                            paddingX={'0.5rem'}
                            overflowY={'scroll'}
                        >
                            <Flex
                                width={'100%'}
                                justifyContent={'space-between'}
                                alignContent={'center'}
                                alignItems={'center'}
                                flexWrap={'wrap'}
                                gap={'1rem'}
                            >
                                <Flex
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                >
                                    <Flex
                                        width={'100%'}
                                        alignItems={'center'}
                                    >
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Input
                                                placeholder= {'Prénom'}
                                                border={isFirstNameFieldDirty && firstName.trim().length === 0 ? `1px solid ${colors.red.main}` : `1px solid ${colors.grey.light}`}
                                                onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                                                    setFirstName(e.target.value);
                                                    setIsFirstNameFieldDirty(true);
                                                }}
                                            />
                                        </Flex>
                                    </Flex>
                                        
                                    <Flex
                                        width={'100%'}
                                        flexWrap={'wrap'}
                                    >

                                        <Flex
                                            width={'100%'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            gap={'0.5rem'}
                                            style={{ visibility: isFirstNameFieldDirty && firstName.trim().length === 0 ? 'visible' : 'hidden' }}
                                        >
                                            <CloseIcon boxSize={3} color={colors.red.main}/>
                                            <Text
                                                fontSize={'xs'}
                                                color={colors.red.main}
                                            >
                                                {'Ce champ est requis.'}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>
                                <Flex
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                >
                                    <Flex
                                        width={'100%'}
                                        alignItems={'center'}
                                    >

                                        <Flex
                                            width={'100%'}
                                        >
                                            <Input
                                                placeholder= {'Nom'}
                                                border={isLastNameFieldDirty && lastName.trim().length === 0 ? `1px solid ${colors.red.main}` : `1px solid ${colors.grey.light}`}
                                                onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                                                    setLastName(e.target.value);
                                                    setIsLastNameFieldDirty(true);
                                                }}
                                            />
                                        </Flex>
                                    </Flex>
                                        
                                    <Flex
                                        width={'100%'}
                                        flexWrap={'wrap'}
                                    >
                                        <Flex
                                            width={'100%'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            style={{ visibility: isLastNameFieldDirty && lastName.trim().length === 0 ? 'visible' : 'hidden' }}
                                        >
                                            <CloseIcon boxSize={3} color={colors.red.main}/>
                                            <Text
                                                fontSize={'xs'}
                                                color={colors.red.main}
                                            >
                                                {'Ce champ est requis.'}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>
                                <Flex
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                >
                                    <Flex
                                        width={'100%'}
                                        alignItems={'center'}
                                    >
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Input
                                                placeholder= {'Courriel'}
                                                border={isEmailFieldDirty && email.trim().length === 0 ? `1px solid ${colors.red.main}` : `1px solid ${colors.grey.light}`}
                                                onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                                                    setEmail(e.target.value);
                                                    setIsEmailFieldDirty(true);
                                                }}
                                            />
                                        </Flex>
                                    </Flex>
                                        
                                    <Flex
                                        width={'100%'}
                                        flexWrap={'wrap'}
                                    >
                                        <Flex
                                            width={'100%'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            gap={'0.5rem'}
                                            style={{ visibility: isEmailFieldDirty && email.trim().length === 0 ? 'visible' : 'hidden' }}
                                        >
                                            <CloseIcon boxSize={3} color={colors.red.main}/>
                                            <Text
                                                fontSize={'xs'}
                                                color={colors.red.main}
                                            >
                                                {'Ce champ est requis.'}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Flex
                                width={'100%'}
                                alignContent={'center'}
                                alignItems={'center'}
                                paddingY={'1rem'}
                            >
                                <Text textAlign={'justify'}>
                                    {'Nous sommes là pour vous aider. N\'hésitez pas à contacter notre équipe de support pour toute question, préoccupation ou rétroaction. Nous vous répondrons dès que possible.'}
                                </Text>
                            
                            </Flex>
                            <Flex
                                width={'100%'}
                                flexWrap={'wrap'}
                            >
                                <Flex
                                    width={'100%'}
                                    alignItems={'center'}
                                >
                                    <Textarea 
                                        width={'100%'}
                                        height={'120px'}
                                        resize={'none'}
                                        placeholder={'Votre message...'}
                                        border={isMessageFieldDirty && message.trim().length === 0 ? `1px solid ${colors.red.main}` : `1px solid ${colors.grey.light}`}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>)=>{
                                            setMessage(e.target.value);
                                            setIsMessageFieldDirty(true);
                                        }}
                                    />
                                </Flex>
                                        
                                <Flex
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                    justifyContent={'center'}
                                    alignItems={'center'}
                                    gap={'0.5rem'}
                                    paddingTop={'0.25rem'}
                                    style={{ visibility: isMessageFieldDirty && message.trim().length === 0 ? 'visible' : 'hidden' }}
                                >
                                    <CloseIcon boxSize={3} color={colors.red.main}/>
                                    <Text
                                        fontSize={'xs'}
                                        color={colors.red.main}
                                    >
                                        {'Ce champ est requis.'}
                                    </Text>
                                </Flex>
                            </Flex>

                        </Flex>
                        <Flex
                            width={'85%'}
                            justifyContent={{base:'space-between', sm:'space-evenly'}}
                            alignItems={'center'}
                            paddingTop={'1rem'} 
                        >
                            <Button
                                size={{base:'md', md:'lg'}}
                                backgroundColor={colors.darkAndLight.white}
                                color={colors.blue.main}
                                fontWeight={'normal'}
                                _hover={{
                                    backgroundColor: colors.blue.lighter,
                                }}
                                _active={{
                                    backgroundColor: colors.blue.lighter,
                                }}
                                onClick={()=>closeModal()}
                            >
                                {'Annuler'}
                            </Button>
                            <Button
                                size={{base:'md', md:'lg'}}
                                backgroundColor={colors.blue.main}
                                color={colors.darkAndLight.white}
                                fontWeight={'normal'}
                                _hover={{
                                    backgroundColor: colors.blue.light,
                                }}
                                _active={{
                                    backgroundColor: colors.blue.light,
                                }}
                                onClick={()=>sendEmail()}
                                isLoading={isWaitingForResponse}
                                isDisabled={!checkFormIsValid()}
                            >
                                {'Soumettre'}
                            </Button>
                        </Flex>
                        
                    </Flex>

                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ContactModal;
