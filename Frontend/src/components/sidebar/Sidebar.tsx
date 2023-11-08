import { Box, Flex, Link, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import colors from '../../utils/theme/colors';

interface SidebarProps {
  items: SidebarItem[];
}

interface SidebarItem {
  label: string;
//   setCurrentComponent: (value: React.ReactNode) => void;
    onClick: () => void
  icon?: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
    return (
        <Flex 
            height={'100vh'}
            align="start"
            width={'350px'}
            flexWrap={'wrap'}
            alignContent={'flex-start'}
            backgroundColor={colors.blue.main}
        >
            {items.map((item, index) => (
                <Link
                    width={'100%'}
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent={'flex-start'}
                    p={2}
                    onClick={item.onClick}
                    borderRadius="md"
                    _hover={{ backgroundColor: colors.blue.light }}
                    textColor={colors.darkAndLight.white}
                >
                    <Box>{item.icon}</Box>
                    <Text ml={2}>{item.label}</Text>
                </Link>
            ))}
        </Flex>
    );
};

export default Sidebar;
