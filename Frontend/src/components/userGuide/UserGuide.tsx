import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

type UserGuideSteps = {
    activeStep: number;
};

const UserGuide: React.FC<UserGuideSteps> = ({ 
    activeStep
}) => {

    const getActiveStepPage = () => {
        switch (activeStep){
        case 1: {
            return (
                <Text>
                    {'This is a test on page 1'}
                </Text>
            );
        }
        case 2: {
            return (
                <Text>
                    {'This is a test on page 2'}
                </Text>
            );
        }
        case 3: {
            return (
                <Text>
                    {'Vous êtes prêt à utiliser l\'outil !'}
                </Text>
            );
        }
        default: {
            return (
                <Text textAlign={'justify'}>
                    {'Le répertoire des expertises de la Communauté de pratique IA en santé (CPIAS) est un outil permettant de découvrir les experts en évoquant une problématique. '}
                    {'La plateforme présente les profils des membres et cartographie les expertises selon le domaine de pratique de chaque membre.'}
                </Text>
            );
        }

        }
    };

    return (
        <Flex
            width={'100%'}
            height={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
        >
            {getActiveStepPage()}
        </Flex>
    );
};

export default UserGuide;