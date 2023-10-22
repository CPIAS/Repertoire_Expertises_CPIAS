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
    const [firstName, setFirstName] = useState<string>(member.firstName);
    const [lastName, setLastName] = useState<string>(member.lastName);
    const [email, setEmail] = useState<string>(member.email);
    const [message, setMessage] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
    const toast = useToast();

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files !== null ? event.target.files[0] : null;
        if (selectedFile) {
            setSelectedFile(selectedFile);
        }
    };

    const sendEmail = async () => {
        setIsWaitingForResponse(true);
        const formData = new FormData();
        formData.append('id', String(member.userId));
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);
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
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
            })
            .catch(() => {
                toast({
                    title: 'Une erreur est survenue.',
                    description: 'Veuillez réessayer plus tard.',
                    status: 'error',
                    duration: 3000,
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
            size='4xl'
            isCentered
            
        >
            <ModalOverlay/>
            
            <ModalContent paddingX={'1rem'} height={'75vh'} minHeight={'75vh'}>
                <ModalHeader 
                    textAlign={'center'}
                    fontSize={'xl'}
                    borderBottom={`1px solid ${colors.grey.dark}`}
                >
                    {`Demande de modification des informations de ${member.firstName} ${member.lastName}.`}
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
                            >
                                <Flex
                                    width={'48.5%'}
                                    justifyContent={'space-between'}
                                    alignContent={'center'}
                                    alignItems={'center'}
                                    gap={'0.5rem'}
                                >
                                    <Text
                                        width={'15%'}
                                    >
                                        {'Nom : '}
                                    </Text>
                                    <Input
                                        value={member.lastName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                                            setLastName(e.target.value);
                                        }}
                                    />
                                </Flex>
                                <Flex
                                    width={'48.5%'}
                                    justifyContent={'space-between'}
                                    alignContent={'center'}
                                    alignItems={'center'}
                                    gap={'0.5rem'}
                                >
                                    <Text
                                        width={'25%'}
                                    >
                                        {'Prénom : '}
                                    </Text>
                                    <Input
                                        value={member.firstName}
                                        onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                                            setFirstName(e.target.value);
                                        }}
                                    />
                                </Flex>
                                
                            </Flex>
                            <Flex
                                width={'100%'}
                                justifyContent={'flex-start'}
                                alignContent={'center'}
                                alignItems={'center'}
                                gap={'0.5rem'}
                                paddingY={'1rem'}
                            >
 
                                <Text
                                    width={'10%'}
                                >
                                    {'Courriel : '}
                                </Text>
                                <Input
                                    onChange={(e: ChangeEvent<HTMLInputElement>)=>{
                                        setEmail(e.target.value);
                                    }}
                                    value={member.email}
                                />
  
                            </Flex>
                        
                            <Flex
                                width={'100%'}
                                alignContent={'center'}
                                alignItems={'center'}
                                paddingY={'1rem'}
                            >
                                <Text textAlign={'justify'}>
                                    {'Veuillez indiquer les informations que vous souhaitez faire modifier. Votre demande sera ensuite transmise à un administrateur.'}
                                </Text>
                            
                            </Flex>
                            <Flex
                                width={'100%'}
                                height={'40%'}
                                justifyContent={'center'}
                                alignItems={'center'}
                            >
                                <Textarea 
                                    width={'100%'}
                                    height={'100%'}
                                    resize={'none'}
                                    placeholder={'Votre message...'}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>)=>{
                                        setMessage(e.target.value);
                                    }}
                                />
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
                                        
                                    >
                                        <Text
                                            fontWeight={'bold'}
                                        >
                                            {'Changer de photo de profil'}
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
                                            border={`2px solid ${colors.blue.light}`}
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
