/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EditIcon } from '@chakra-ui/icons';
import { Flex, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import axios from 'axios';
import humps from 'humps';
import React, { useEffect, useState } from 'react';
import EditMemberProfileModal from '../../../components/modals/EditMemberProfileModal';
import { Member } from '../../../models/member';

const API_HOST = process.env.REACT_APP_SERVER_URL;
// const API_KEY = process.env.REACT_APP_API_KEY;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const EditMembers: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [noMemberText, setNoMemberText] = useState<string>('Aucun résultat');
    const [members, setMembers] = useState<Member[]>([]);
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
                <Td isNumeric>{member.userId}</Td>
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
                width={'100%'}
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
                        fontWeight={'bold'}
                        fontSize={'xl'}
                        paddingBottom={'2rem'}
                    >
                        {'Gérer les membres'}
                    </Flex>
                
                    <Flex
                        backgroundColor={'white'}
                        // width={'65%'}
                    >
                        <TableContainer width={'100%'}>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th isNumeric>{'ID'}</Th>
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