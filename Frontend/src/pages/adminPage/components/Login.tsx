import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Button, Flex, Image, Input, InputGroup, InputRightElement, Text, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import colors from '../../../utils/theme/colors';

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;
const ENTER_KEY = 'Enter';

interface LoginProps {
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({
    setIsLoggedIn
}) => {
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);
    const [typedPassword, setTypedPassword] = useState<string>('');
    const toast = useToast();

    /**
     * Handles the key press event for the Enter key in the password input.
     * Logs in when the Enter key is pressed and the password is not empty.
     * @param {React.KeyboardEvent<HTMLInputElement>} event - The keyboard event.
     */
    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ENTER_KEY && typedPassword.length !== 0) {
            login();
        }
    };

    /**
     * Logs in based on the typed password.
     * Sets `isLoggedIn` to true if the password matches the admin password, otherwise shows an error toast.
     */
    const login = () => {
        if (typedPassword === ADMIN_PASSWORD){
            setIsLoggedIn(true);
        }
        else {
            toast({
                title: 'Mot de passe incorrect',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex 
            width={'100%'} 
            height={'100vh'}
            justifyContent={'center'}
            alignItems={'center'}
            alignContent={'flex-start'}
            flexWrap={'wrap'}
            gap={'5rem'}
        >
            <Flex
                width={'100%'}
                justifyContent={'center'}
                alignItems={'flex-end'}
                height={'30%'}
            >
                <Image src={'./images/cpias-logo-white.png'} alt={'cpias'} width={{base:'300px', md:'400px'}}/>
            </Flex>
            <Flex
                width={{base:'85%', lg:'75%', xl: '50%'}}
                height={{base:'45%', sm: '25%'}}
            >
                <Flex 
                    width={'100%'}
                    // height={'100%'}
                    justifyContent={'center'}
                    alignItems={'flex-start'}
                    alignContent={'center'}
                    backgroundColor={colors.darkAndLight.white}
                    boxShadow={`0px 0px 5px 0px ${colors.grey.dark}`}
                    borderRadius={'0.25rem'}
                    flexWrap={'wrap'}
                    gap={'1.5rem'}
                    padding={{base: '1rem', md:'2rem'}}
                >
                    <Flex
                        width={'100%'}
                        justifyContent={'center'}
                        flexWrap={'wrap'}
                        gap={'2.5rem'}
                    >
                        <Flex 
                            width={'100%'}
                            justifyContent={'flex-start'} 
                            flexWrap={'wrap'}
                            gap={'0.5rem'}
                        >
                            <Text fontSize={{base: 'sm', md:'md'}} fontWeight={'bold'} width={'100%'} textAlign={'center'}>
                                {'Veuillez saisir le mot de passe pour accéder aux fonctionnalités d\'administrateur.'}
                            </Text>
                        </Flex>
                        <Flex
                            width={'100%'}
                            alignItems={'center'}
                            justifyContent={'center'}
                            flexDirection={{base:'column', md:'row'}}
                            flexWrap={'wrap'}
                            gap={'1rem'}
                        >
                            <Flex
                                width={{base:'90%', sm: '75%', md:'50%'}}
                                alignItems={'center'}
                            >
                    
                                <InputGroup size='lg'>
                                    <Input
                                        fontSize={{ base: 'sm', md: 'lg', lg: 'xl' }}
                                        type={isPasswordShown ? 'text' : 'password'}
                                        placeholder='Entrer le mot de passe'
                                        onChange={(event) => {
                                            setTypedPassword(event.target.value);
                                        }}
                                        onKeyDown={handleEnterKeyPress}
                                    />
                                    <InputRightElement width='4.5rem'>
                                        {isPasswordShown ?
                                            <ViewOffIcon 
                                                boxSize={'24px'} 
                                                onClick={()=>setIsPasswordShown(false)} 
                                                cursor={'pointer'}
                                            />
                                            :
                                            <ViewIcon 
                                                boxSize={'24px'} 
                                                onClick={()=>setIsPasswordShown(true)} 
                                                cursor={'pointer'}
                                            />
                                        }
                                    </InputRightElement>
                                </InputGroup>
                            </Flex>
                            <Flex
                                alignItems={'center'}
                                justifyContent={'center'}
                            >
                                <Button
                                    size={'lg'}
                                    backgroundColor={colors.blue.main}
                                    color={colors.darkAndLight.white}
                                    fontWeight={'normal'}
                                    isDisabled={typedPassword.length === 0}
                                    _hover={{
                                        backgroundColor: colors.blue.light,
                                    }}
                                    _active={{
                                        backgroundColor: colors.blue.light,
                                    }}
                                    onClick={()=>login()}
                                >
                                    {'Se connecter'}
                                </Button>
                            </Flex>
                        </Flex>
                
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Login;