import { CloseIcon, DownloadIcon } from '@chakra-ui/icons';
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
import React, { ChangeEvent, useRef, useState } from 'react';
import { Member } from '../../models/member';
import colors from '../../utils/theme/colors';

type ModalProps = {
    member: Member;
    isOpen: boolean;
    onClose: () => void;
};

const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ProfileCorrectionModal: React.FC<ModalProps> = ({ 
    member,
    isOpen, 
    onClose 
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isFirstNameFieldDirty, setIsFirstNameFieldDirty] = useState<boolean>(false);
    const [isLastNameFieldDirty, setIsLastNameFieldDirty] = useState<boolean>(false);
    const [isEmailFieldDirty, setIsEmailFieldDirty] = useState<boolean>(false);
    const [isMessageFieldDirty, setIsMessageFieldDirty] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
    const toast = useToast();

    const checkFormIsValid = () => {
        return (message.trim().length > 0 && firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().length > 0);
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files !== null ? event.target.files[0] : null;
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|tiff)$/.test(selectedFile.name.toLowerCase())) {
                setSelectedFile(selectedFile);
                
            } else {
                setSelectedFile(null);
                toast({
                    title: 'Fichier invalide.',
                    description: 'Veuillez ajouter une image.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const sendEmail = async () => {
        setIsWaitingForResponse(true);
        const formData = new FormData();
        formData.append('id', String(member.userId));
        formData.append('memberLastName', String(member.lastName));
        formData.append('memberFirstName', String(member.firstName));
        formData.append('requesterFirstName', firstName);
        formData.append('requesterLastName', lastName);
        formData.append('requesterEmail', email);
        formData.append('message', message);
        if (selectedFile) 
            formData.append('profilePicture', selectedFile);

        axios
            .post(`${API_HOST}/request_profile_correction`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(() => {
                setIsWaitingForResponse(false);
                toast({
                    title: 'Demande de modification transmise à l\'administrateur.',
                    description: 'Nous vous tiendrons informé de l\'état de votre demande.',
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
        setSelectedFile(null);
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
            
            <ModalContent paddingX={{ base: 'none', md:'1rem', lg: '1rem' }} height={'75vh'} minHeight={'75vh'}>
                <ModalHeader 
                    textAlign={'center'}
                    fontSize={'xl'}
                    borderBottom={`1px solid ${colors.grey.dark}`}
                >
                    {`Demande de modification des informations de ${member.firstName} ${member.lastName}`}
                </ModalHeader>
                <ModalCloseButton margin={'0.5rem'}/>
                <ModalBody
                    overflowY={'scroll'}
                >
                    <Flex 
                        width={'100%'}
                        height={'100%'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        alignContent={'center'}
                        flexWrap={'wrap'}
                        gap={'1.25rem'}
                        overflowY={'scroll'}
                        
                    >
                        <Flex
                            width={'100%'}
                            height={'80%'}
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
                            >
                                <Flex
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                >
                                    <Flex
                                        width={'100%'}
                                        alignItems={'center'}
                                        flexWrap={'wrap'}
                                    >
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Text>
                                                {'Prénom'}
                                            </Text>
                                        </Flex>
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Input
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
                                            width={'10%'}
                                        >
                                        </Flex>
                                   
                                        <Flex
                                            width={'90%'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            gap={'0.5rem'}
                                            paddingTop={'0.25rem'}
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
                                        flexWrap={'wrap'}
                                    >
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Text>
                                                {'Nom'}
                                            </Text>
                                        </Flex>
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Input
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
                                            width={'10%'}
                                        >
                                        </Flex>
                                   
                                        <Flex
                                            width={'90%'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            gap={'0.5rem'}
                                            paddingTop={'0.25rem'}
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
                                        flexWrap={'wrap'}
                                    >
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Text>
                                                {'Courriel'}
                                            </Text>
                                        </Flex>
                                        <Flex
                                            width={'100%'}
                                        >
                                            <Input
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
                                            width={'10%'}
                                        >
                                        </Flex>
                                   
                                        <Flex
                                            width={'90%'}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                            gap={'0.5rem'}
                                            paddingTop={'0.25rem'}
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
                                    {'Veuillez indiquer les informations que vous souhaitez faire modifier. Votre demande sera ensuite transmise à un administrateur de la plateforme.'}
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
                                        height={'100%'}
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
                            <Flex
                                width={'100%'}
                                justifyContent={'center'}
                                alignItems={'flex-start'}
                                flexWrap={'wrap'}
                                gap={'1rem'}
                                paddingTop={'1rem'}
                            >
                                <Flex
                                    width={'100%'}
                                    flexWrap={'wrap'}
                                    gap={'0.5rem'}
                                >
                                
                                    <Flex 
                                        width={'100%'}
                                        alignItems={'center'}
                                        gap={'0.25rem'}
                                    >
                                        <Text
                                            fontWeight={'bold'}
                                        >
                                            {'Changer de photo de profil'}
                                        </Text>
                                        <Text
                                            fontSize={'sm'}
                                            fontStyle={'italic'}
                                        >
                                            {'(optionnel)'}
                                        </Text>
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
                                            {'Téléverser une photo de profil'}
                                        </Button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                        />
                                        {selectedFile && 
                                            <Flex
                                                maxWidth={'30%'}
                                                backgroundColor={colors.grey.main}
                                                padding={'1rem'}
                                                alignItems={'center'}
                                                justifyContent={'space-between'}
                                                gap={'1rem'}
                                            >
                                                <CloseIcon 
                                                    cursor={'pointer'}
                                                    onClick={()=>{
                                                        setSelectedFile(null);
                                                    }}
                                                    _hover={{
                                                        color:colors.grey.dark 
                                                    }}
                                                />
                                                <Text
                                                    noOfLines={1}
                                                >
                                                    {selectedFile?.name}
                                                </Text>
                                            </Flex>
                                        }
                                    </Flex>
                                </Flex>
                                
                            </Flex>
                        </Flex>
                        <Flex
                            width={'60%'}
                            justifyContent={'space-evenly'}
                            alignItems={'center'}
                            paddingTop={'1rem'} 
                        >
                            <Button
                                size={'lg'}
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
                                size={'lg'}
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

export default ProfileCorrectionModal;
