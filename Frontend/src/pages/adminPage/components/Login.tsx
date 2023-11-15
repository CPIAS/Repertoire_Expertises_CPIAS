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

    console.log(ADMIN_PASSWORD);
    
    const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ENTER_KEY && typedPassword.length !== 0) {
            login();
        }
    };

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
                <Image src={'./images/cpias-logo-white.png'} alt={'cpias'} width='400px'/>
            </Flex>
            <Flex
                width={'40%'}
                height={'25%'}
            >
                <Flex 
                    width={'100%'}
                    height={'100%'}
                    justifyContent={'center'}
                    alignItems={'flex-start'}
                    alignContent={'flex-start'}
                    backgroundColor={colors.darkAndLight.white}
                    boxShadow={`0px 0px 5px 0px ${colors.grey.dark}`}
                    borderRadius={'0.25rem'}
                    flexWrap={'wrap'}
                    gap={'1.5rem'}
                    padding={'3rem'}
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
                            <Text fontSize={'md'} fontWeight={'bold'} width={'100%'} textAlign={'center'}>
                                {'Veuillez saisir le mot de passe pour accéder aux fonctionnalités d\'administrateur.'}
                            </Text>
                        </Flex>
                        <Flex
                            width={'100%'}
                            alignItems={'center'}
                            flexWrap={'wrap'}
                        >
                            <Flex
                                width={'100%'}
                                gap={'1rem'}
                                alignItems={'center'}
                            >
                    
                                <InputGroup size='lg'>
                                    <Input
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