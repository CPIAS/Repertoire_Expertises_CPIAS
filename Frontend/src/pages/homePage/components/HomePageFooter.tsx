import { Flex, Image, Link, Text } from '@chakra-ui/react';
import React from 'react';
import colors from '../../../utils/theme/colors';

const HomePageFooter: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            justifyContent={'space-evenly'}
            alignItems={'flex-start'}
            alignContent={'flex-start'}
            gap={'2rem'}
            flexWrap={'wrap'}
            backgroundColor={colors.darkAndLight.white}
        >

            <Flex 
                width={'100%'}
                justifyContent={'space-evenly'}
                alignItems={'center'}
            >
                <Text
                    fontSize='2xl'
                >
                    {'Nos partenaires'}
                </Text>
            </Flex>

            <Flex 
                width={'100%'}
                justifyContent={'space-evenly'}
                alignItems={'center'}
                flexDirection={{ base: 'column', lg: 'row' }}
                gap={{ base: '3.5rem', lg: 'none' }}
            >
                <Flex
                    width={{ base: '100%', lg: '20%' }} 
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <Link href="https://eiaschum.ca/" isExternal>
                        <Image src={'./images/partners/eias.png'} alt={'eias'} width='180px'/>
                    </Link>
                </Flex>

                <Flex
                    width={{ base: '100%', lg: '20%' }} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Link href="https://www.chumontreal.qc.ca/crchum" isExternal>
                        <Image src={'./images/partners/crchum.png'} alt={'crchum'} width='250px'/>
                    </Link>
                </Flex>

                <Flex
                    width={{ base: '100%', lg: '20%' }} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Link href="https://santenumerique.umontreal.ca" isExternal>
                        <Image src={'./images/partners/consortium.png'} alt={'consortium-santé-numérique'} width='180px'/>
                    </Link>
                </Flex>

                <Flex
                    width={{ base: '100%', lg: '20%' }} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Link href="https://polymtl.ca/" isExternal>
                        <Image src={'./images/partners/polymtl.png'} alt={'polytechnique-montreal'} width='250px'/>
                    </Link>
                </Flex>

                <Flex
                    width={{ base: '100%', lg: '20%' }} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Link href="https://ivado.ca/" isExternal>
                        <Image src={'./images/partners/ivado.png'} alt={'ivado'} width='250px'/>
                    </Link>
                    
                </Flex>

            </Flex>
        </Flex>
    );
};

export default HomePageFooter;
