import React, { useState } from 'react';
import { Flex, Text, Link } from '@chakra-ui/react';
import Header from '../../components/header/Header';
import ContactModal from '../../components/modals/ContactModal';

const AboutPage: React.FC = () => {
    const [contactModalState, setContactModalState] = useState(false);

    const openContactModal = () => {
        setContactModalState(true);
    };

    const closeContactModal = () => {
        setContactModalState(false);
    };

    return (
        <Flex
            width={'100%'}
            height={'100vh'}
            minHeight={'100vh'}
            maxHeight={'100vh'}
            justifyContent={'center'}
            alignItems={'flex-center'}
            flexWrap={'wrap'}
            overflowY={'hidden'}
            padding={'2rem'}
        >
            <Flex
                width={'100%'}
                height={'10vh'}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Header />
            </Flex>

            <Flex
                width={'100%'}
                flexWrap={'wrap'}
                alignItems={'center'} 
                textAlign={'center'}
                gap={'1rem'}
            >
                <Text textAlign={'justify'} fontWeight={'semibold'} fontSize={'xl'}>
                Bienvenue sur notre plateforme de la Communauté de pratique IA en santé (CPIAS) !
                </Text>

                <Text textAlign={'justify'} marginBottom={'1rem'}>
                Notre mission est de faciliter la collaboration et l'échange d'expertise dans le domaine de l'intelligence artificielle appliquée à la santé. La CPIAS est une communauté dynamique composée de professionnels de divers horizons, tous passionnés par l'intégration de l'IA dans le secteur de la santé.
                </Text>

                <Text textAlign={'justify'} marginBottom={'1rem'}>
                Que vous soyez un chercheur, un professionnel de la santé, un étudiant ou tout simplement curieux, notre plateforme offre un répertoire complet d'experts, un moteur de recherche avancé et des fonctionnalités de recommandation pour vous aider à trouver les partenaires de collaboration idéaux.
                </Text>

                <Text textAlign={'justify'} marginBottom={'1rem'}>
                N'hésitez pas à explorer les différentes fonctionnalités de notre site, de la recherche d'experts à la consultation des profils des membres. Si vous avez des questions ou des commentaires, n'hésitez pas à nous contacter.
                </Text>

                <Text textAlign={'justify'} fontWeight={'semibold'} fontSize={'xl'}>
                L'équipe de la CPIAS
                </Text>

                <Link 
                    fontWeight={'medium'}
                    color={'blue.500'}
                    onClick={() => openContactModal()}
                >
                    {'Contactez le créateur du site'}
                </Link>

                {contactModalState && (
                    <ContactModal
                        isOpen={contactModalState}
                        onClose={() => closeContactModal()} 
                    />
                )}

            </Flex>
        </Flex>
    );
};

export default AboutPage;