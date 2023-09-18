import { Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';

const HomePageFooter: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100%'}
            justifyContent={'space-evenly'}
            alignItems={'flex-start'}
            flexWrap={'wrap'}
        >

            <Flex 
                width={'100%'}
                justifyContent={'space-evenly'}
                alignItems={'center'}
                paddingTop={'1.5rem'}
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
            >
                <Flex
                    width={'20%'} 
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <Image src={'/images/partners/eias.png'} alt={'eias'} width='180px'/>
                </Flex>

                <Flex
                    width={'20%'} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Image src={'/images/partners/crchum.png'} alt={'crchum'} width='250px'/>
                </Flex>

                <Flex
                    width={'20%'} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Image src={'/images/partners/consortium.png'} alt={'consortium-santé-numérique'} width='180px'/>
                </Flex>

                <Flex
                    width={'20%'} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Image src={'/images/partners/polymtl.png'} alt={'polytechnique-montreal'} width='250px'/>
                </Flex>

                <Flex
                    width={'20%'} 
                    justifyContent={'space-evenly'}
                    alignItems={'center'}
                >
                    <Image src={'/images/partners/ivado.png'} alt={'ivado'} width='250px'/>
                </Flex>

            </Flex>
        </Flex>
    );
};

export default HomePageFooter;
