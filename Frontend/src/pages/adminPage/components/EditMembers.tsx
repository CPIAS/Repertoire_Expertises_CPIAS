/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DownloadIcon, EditIcon } from '@chakra-ui/icons';
import { Button, Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useToast } from '@chakra-ui/react';
import axios from 'axios';
import humps from 'humps';
import React, { useEffect, useRef, useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router';
import Loader from '../../../components/loader/Loader';
import EditMemberProfileModal from '../../../components/modals/EditMemberProfileModal';
import { Member } from '../../../models/member';
import { formatDate } from '../../../utils/formatDate';
import colors from '../../../utils/theme/colors';
import mockMembers from '../../membersPage/mockMembers.json';
const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const EditMembers: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isWaitingForFile, setIsWaitingForFile] = useState<boolean>(false);
    const [noMemberText, setNoMemberText] = useState<string>('Aucun résultat');
    const [members, setMembers] = useState<Member[]>(mockMembers); //TODO: Change to '[]' for deployment
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const toast = useToast();

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const formData = new FormData();
            formData.append('csvFile', files[0]);
            try {
            // Perform your upload logic here, for example using fetch or axios
            // Example using fetch:
                // const response = await fetch('/upload-endpoint', {
                //     method: 'POST',
                //     body: formData,
                // });
    
                // Handle the response as needed
                console.log(formData);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };
    
    const openModal = (member: Member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${API_HOST}/users`);
                setMembers(humps.camelizeKeys(response.data) as Member[]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error while fetching members: ', error);
                setNoMemberText('Une erreur est survenue.');
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const downloadDatabaseFile = async () => {
        try {
            setIsWaitingForFile(true);
            const response = await axios.get(`${API_HOST}/download_csv`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'text/csv' });

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'database_cpias.csv';
            link.click();
            window.URL.revokeObjectURL(link.href);
            setIsWaitingForFile(false);
        } catch (error) {
            toast({
                title: 'Le fichier ne peut être téléchargé.',
                description: 'Veuillez réessayé plus tard',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setIsWaitingForFile(false);
        }
    };

    const uploadDatabaseFile = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('csvFile', selectedFile);
    
            try {
            // Perform your upload logic here, for example using fetch or axios
            // Example using fetch:
                // const response = await fetch('/upload-endpoint', {
                //     method: 'POST',
                //     body: formData,
                // });
    
                // Handle the response as needed
                console.log(formData);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            console.error('No file selected');
        }
    };

    const generateRows = () => {
        return members.map((member) => (
            <Tr key={member.userId} width={'100%'}>
                <Td textAlign={'center'}>{member.userId}</Td>
                <Td textAlign={'center'}>{member.lastName}</Td>
                <Td textAlign={'center'}>{member.firstName}</Td>
                <Td textAlign={'center'}>{formatDate(member.registrationDate)}</Td>
                <Td textAlign={'center'}>
                    <EditIcon
                        boxSize={'24px'}
                        cursor={'pointer'}
                        onClick={() => openModal(member)}
                        _hover={{color: colors.grey.dark}}
                    />                  
                </Td>
            </Tr>
        ));
    };

    return (
        <Flex
            width={'100%'}
            height={members.length === 0 ? '100vh' : '100%'}
            justifyContent={'center'}
            alignContent={'center'}
            flexWrap={'wrap'}
            backgroundColor={colors.grey.light}
        >
            <EditMemberProfileModal 
                selectedMember={selectedMember!}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            /> 
            {isLoading ? 
                <Loader /> 
                :
                <Flex
                    width={'70%'}
                    height={'100%'}
                    flexWrap={'wrap'}
                    justifyContent={'center'}
                    alignContent={'flex-start'}
                    paddingX={'3rem'}
                    backgroundColor={colors.darkAndLight.white}
                    paddingY={'1rem'}
                >
                    {members.length > 0 ? ( 
                        <Flex
                            width={'100%'}
                            paddingTop={'2rem'}
                            flexWrap={'wrap'}
                            justifyContent={'center'}
                        >
                            <Flex
                                width={'100%'}
                                justifyContent={'space-between'}
                                paddingBottom={'2rem'}
                            >
                                <Text
                                    fontWeight={'bold'}
                                    fontSize={'xl'}
                                >
                                    {'Gérer les membres'}
                                </Text>
                                <Button
                                    fontWeight={'normal'}
                                    backgroundColor={colors.blue.main}
                                    color={colors.darkAndLight.white}
                                    _hover={{
                                        backgroundColor: colors.blue.light,
                                    }}
                                    _active={{
                                        backgroundColor: colors.blue.light,
                                    }}
                                    rightIcon={<FaSignOutAlt />}
                                    onClick={()=>navigate('/accueil')}
                                >
                                    {'Déconnexion'}
                                </Button>
                            </Flex>
                            <Flex 
                                width={'100%'}
                                justifyContent={'flex-end'}
                                gap={'1rem'}
                                paddingBottom={'1rem'}
                            >
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    onChange={handleFileChange} 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    backgroundColor={colors.darkAndLight.white}
                                    color={colors.blue.main}
                                    border={`2px solid ${colors.blue.light}`}
                                    _hover={{
                                        backgroundColor: colors.blue.lighter,
                                    }}
                                    _active={{
                                        backgroundColor: colors.blue.lighter,
                                    }}
                                    leftIcon={<MdRefresh />}
                                    onClick={handleButtonClick}
                                    // isLoading={isWaitingForFile}
                                >
                                    {'Mettre à jour la base de données'}
                                </Button>
                                <Button
                                    backgroundColor={colors.darkAndLight.white}
                                    color={colors.blue.main}
                                    border={`2px solid ${colors.blue.light}`}
                                    _hover={{
                                        backgroundColor: colors.blue.lighter,
                                    }}
                                    _active={{
                                        backgroundColor: colors.blue.lighter,
                                    }}
                                    leftIcon={<DownloadIcon />}
                                    onClick={()=>downloadDatabaseFile()}
                                    isLoading={isWaitingForFile}
                                >
                                    {'Exporter au format CSV'}
                                </Button>
                            </Flex>
                            <Flex
                                backgroundColor={'white'}
                                width={'100%'}
                                border={`2.5px solid ${colors.grey.dark}`}
                                borderRadius={'0.25rem'}
                            >
                                <TableContainer width={'100%'}>
                                    <Table variant={'striped'}>
                                        <Thead >
                                            <Tr>
                                                <Th textAlign={'center'}>{'ID'}</Th>
                                                <Th textAlign={'center'}>{'Nom'}</Th>
                                                <Th textAlign={'center'}>{'Prénom'}</Th>
                                                <Th textAlign={'center'}>{'Membre depuis'}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {generateRows()}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </Flex>
                        </Flex>
                    )
                        :
                        (
                            <Flex
                                width={'100%'}
                                height={'100%'}
                                justifyContent={'center'}
                                alignItems={'center'}
                                fontSize={'3xl'}
                            >
                                {noMemberText}
                            </Flex>
                        )
                    }
                </Flex>
            }
        </Flex>
    );
};

export default EditMembers;