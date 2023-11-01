import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import Header from '../../components/header/Header';

const AboutPage: React.FC = () => {
    return (
        <Flex 
            width={'100%'}
            height={'100vh'}
            minHeight={'100vh'}
            maxHeight={'100vh'}
            justifyContent={'center'}
            alignItems={'flex-start'}
            flexWrap={'wrap'}
            overflowY={'hidden'}
        >
            <Flex 
                width={'100%'}
                height={'10vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>

            <Text textAlign={'justify'} fontWeight={'semibold'}>
                {'Le répertoire des expertises de la Communauté de pratique IA en santé (CPIAS) représente une solution innovante pour identifier et collaborer avec des experts dans le domaine de l\'IA appliquée à la santé. '}
                {'Il offre un moteur de recherche avancé qui permet aux utilisateurs de découvrir les membres de la CPIAS en se basant sur leurs compétences spécifiques en IA et en santé. '}
            </Text>
            <Text textAlign={'justify'} fontWeight={'semibold'}>
                {'Cet outil va au-delà de la simple recherche, puisqu\'il propose également un système de recommandation d\'expertise. '}
                {'Grâce à cette fonctionnalité, il devient possible de former des équipes multidisciplinaires en toute simplicité, en connectant des professionnels dont les compétences se complètent. '}
                {'L\'objectif premier de cette application est de stimuler l\'intégration de l\'IA dans le domaine de la santé, en consolidant un répertoire dynamique d\'experts et en facilitant les interactions entre les acteurs clés.'}
            </Text>
            
        </Flex>
    );
};

export default AboutPage;