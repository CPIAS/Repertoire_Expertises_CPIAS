import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Step,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps
} from '@chakra-ui/react';
import React from 'react';
import colors from '../../utils/theme/colors';
import UserGuide from '../userGuide/UserGuide';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const steps = [
    { title: 'Description de l\'outil' },
    { title: 'Moteur de recherche' },
    { title: 'Profil des membres' },
];

const UserGuideModal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose 
}) => {
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const closeModal = () => {
        setActiveStep(0);
        onClose();
    };
      
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={closeModal}
            size='6xl'
            isCentered
            
        >
            <ModalOverlay/>
            <ModalContent paddingX={'1rem'} height={'67.5vh'}>
                <ModalBody
                    overflow={'scroll'}
                >
                    <Flex 
                        width={'100%'}
                        height={'100%'}
                        justifyContent={'center'}
                        alignContent={'flex-start'}
                        alignItems={'flex-start'}
                        flexWrap={'wrap'}
                    >
                        <Flex
                            width={'100%'}
                            height={'15%'}
                            paddingTop={'1rem'}
                            justifyContent={'center'}
                            alignItems={'center'}
                        >
                        
                            <Stepper size='md' index={activeStep} colorScheme='facebook' width={'100%'}>
                                {steps.map((step, index) => (
                                    <Step key={index} onClick={() => setActiveStep(index)}>
                                        <StepIndicator>
                                            <StepStatus
                                                complete={<StepIcon />}
                                                incomplete={<StepNumber />}
                                                active={<StepNumber />}
                                            />
                                        </StepIndicator>

                                        <Box flexShrink='0'>
                                            <StepTitle>{step.title}</StepTitle>
                                        </Box>

                                        <StepSeparator />
                                    </Step>
                                ))}
                            </Stepper>
                        </Flex>
                        <Flex
                            width={'100%'}
                            height={'70%'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            alignContent={'center'}
                            paddingX={'1rem'}
                        >
                            <UserGuide activeStep={activeStep} />
                        </Flex>
                        <Flex
                            width={'100%'}
                            height={'15%'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            gap={'7.5rem'}
                        >
                            <Button
                                size={'lg'}
                                backgroundColor={colors.darkAndLight.white}
                                color={colors.blue.main}
                                border={`2px solid ${colors.blue.light}`}
                                _hover={{
                                    backgroundColor: colors.blue.lighter,
                                }}
                                _active={{
                                    backgroundColor: colors.blue.lighter,
                                }}
                                onClick={()=>{
                                    if (activeStep > 0){
                                        setActiveStep(activeStep-1);
                                    }
                                }}
                                isDisabled={activeStep === 0}
                                leftIcon={<ArrowBackIcon />}
                            >
                                {'Précédent'}
                            </Button>
                            {
                                activeStep === steps.length ? (
                                    <Button
                                        size={'lg'}
                                        backgroundColor={colors.darkAndLight.white}
                                        color={colors.blue.main}
                                        border={`2px solid ${colors.blue.light}`}
                                        _hover={{
                                            backgroundColor: colors.blue.lighter,
                                        }}
                                        _active={{
                                            backgroundColor: colors.blue.lighter,
                                        }}
                                        onClick={() => {
                                            closeModal();
                                        }}
                                    >
                                        {'Fermer'}
                                    </Button>
                                ) : (
                                    <Button
                                        size={'lg'}
                                        backgroundColor={colors.darkAndLight.white}
                                        color={colors.blue.main}
                                        border={`2px solid ${colors.blue.light}`}
                                        _hover={{
                                            backgroundColor: colors.blue.lighter,
                                        }}
                                        _active={{
                                            backgroundColor: colors.blue.lighter,
                                        }}
                                        onClick={() => {
                                            if (activeStep < steps.length) {
                                                setActiveStep(activeStep + 1);
                                            }
                                        }}
                                        rightIcon={<ArrowForwardIcon />}
                                    >
                                        {'Suivant'}
                                    </Button>
                                )
                            }
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default UserGuideModal;
