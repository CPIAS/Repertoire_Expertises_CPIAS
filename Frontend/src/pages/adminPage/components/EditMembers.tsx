/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DownloadIcon, EditIcon } from '@chakra-ui/icons';
import { Button, Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import axios from 'axios';
import humps from 'humps';
import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import EditMemberProfileModal from '../../../components/modals/EditMemberProfileModal';
import { Member } from '../../../models/member';
import colors from '../../../utils/theme/colors';
import mockMembers from '../../membersPage/mockMembers.json';

const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const EditMembers: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [noMemberText, setNoMemberText] = useState<string>('Aucun résultat');
    const [members, setMembers] = useState<Member[]>(mockMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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

    const generateRows = () => {
        return members.map((member) => (
            <Tr key={member.userId} width={'100%'}>
                <Td>{member.userId}</Td>
                <Td>{member.lastName}</Td>
                <Td>{member.firstName}</Td>
                <Td>{new Date(member.registrationDate).toLocaleDateString()}</Td>
                <Td>
                    <EditIcon
                        cursor={'pointer'}
                        onClick={() => openModal(member)}
                    />
                </Td>
            </Tr>
        ));
    };

    return (

        <Flex
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            alignContent={'center'}
            flexWrap={'wrap'}
        >
            <EditMemberProfileModal 
                selectedMember={selectedMember!}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            /> 
            <Flex
                width={'60%'}
                flexWrap={'wrap'}
                justifyContent={'center'}
            >
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
                            backgroundColor={colors.blue.main}
                            color={colors.darkAndLight.white}
                            _hover={{
                                backgroundColor: colors.blue.light,
                            }}
                            _active={{
                                backgroundColor: colors.blue.light,
                            }}
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
                        >
                            {'Exporter au format CSV'}
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
                            leftIcon={<FiRefreshCw />}
                        >
                            {'Mettre à jour la base de données'}
                        </Button>
                    </Flex>
                    <Flex
                        backgroundColor={'white'}
                        width={'100%'}
                    >
                        <TableContainer width={'100%'}>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>{'ID'}</Th>
                                        <Th>{'Nom'}</Th>
                                        <Th>{'Prénom'}</Th>
                                        <Th>{'Membre depuis'}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {generateRows()}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Flex>
                </Flex>
            </Flex>
            
        </Flex>
    );
};

export default EditMembers;