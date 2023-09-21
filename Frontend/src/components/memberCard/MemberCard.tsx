import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { MemberModel } from '../../models/MemberModel';

const MemberCard: React.FC<MemberModel> = (
    member
) => {
    return (
        <Flex width={'100%'}>
            <Text fontSize={'xl'} key={member.lastName} width={'100%'}>
                {`${member.lastName}, ${member.firstName}`}
            </Text>
        </Flex>
    );
};

export default MemberCard;