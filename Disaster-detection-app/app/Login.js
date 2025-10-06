import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {Formik} from 'formik'
import {View, Text} from 'react-native'
import {Octicons,Ionicons} from '@expo/vector-icons';
import {Colors} from '../constants/styles'
import { useContext } from 'react';
import { AuthContext } from '../src/context/authContext'; // exact match


import {
    StyledContainer,
    InnerContainer,
    PageLogo,
    PageTitle,
    SubTitle,
    StyledFormArea,
    LeftIcon,
    RightIcon,
    ButtonText,
    StyledButton,
    StyledInputLabel,
    StyledTextInput,
    MsgBox,
    Line,
    ExtraText,
    ExtraView,
    TextLink,
    TextLinkContent,
} from '../constants/styles'

const {brand, darkLight} = Colors;


const Login = ()=>{
    const [hidePassword,setHidePassword] =useState(true);
    const navigation = useNavigation(); 
    const router = useRouter();

    //meku changes
     const [msg, setMsg] = useState(''); 
     const { login } = useContext(AuthContext);

    return (
        <StyledContainer>
            <StatusBar style='dark'/>
            <InnerContainer>
                <PageLogo source={require('../assets/images/app-logo.png')}
                    resizeMode="cover"/>
                    <PageTitle>Disaster Detection App</PageTitle>
                    <SubTitle>Account Login</SubTitle>

                    <Formik
                        initialValues={{email:'',password:''}}
                        onSubmit={async (values, {setSubmitting})=>{
                           setMsg('');
                            setSubmitting(true);
                            try {
                            // call login from AuthContext (this will save token and set user)
                            await login({ email: values.email, password: values.password });
                            // navigate to home on success
                            router.push('/(tabs)/Home');
                            } catch (err) {
                            // handle error from backend / network
                            const serverMsg =
                                err?.response?.data?.message ||
                                (err?.response?.data?.errors ? err.response.data.errors.map(e => e.msg).join(', ') : null) ||
                                err.message;
                            setMsg(serverMsg || 'Login failed. Please try again.');
                            // optional: show alert as well
                            // Alert.alert('Login error', serverMsg || 'Login failed');
                            } finally {
                            setSubmitting(false);
                            }
                        }}
                    >
                        {({handleChange, handleBlur, handleSubmit, values, isSubmitting})=>(<StyledFormArea>
                                <MyTextInput
                                    label="Email Address"
                                    icon="mail"
                                    placeholder="anyone@gmail.com"
                                    placeholderTextColor={darkLight}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                    keyboardType="email-address"
                                />
                                <MyTextInput
                                    label="Password"
                                    icon="lock"
                                    placeholder="**********"
                                    placeholderTextColor={darkLight}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    secureTextEntry={hidePassword}
                                    isPassword={true}
                                    hidePassword={hidePassword}
                                    setHidePassword={setHidePassword}
                                />
                                <MsgBox>{msg}</MsgBox>
                                <StyledButton onPress={handleSubmit} disabled={isSubmitting}>
                                    <ButtonText>{isSubmitting ? 'Logging in...' : 'Log In'}</ButtonText>
                                </StyledButton>
                                {/* <Line/> */}
                                <ExtraView>
                                   <ExtraText>Dont have an account? </ExtraText>
                                    <TextLink onPress={() => navigation.navigate('Signup')}>
                                    <TextLinkContent>Sign Up</TextLinkContent>
                                    </TextLink>
                                </ExtraView>
                            </StyledFormArea>)}
                    </Formik>
            </InnerContainer>
        </StyledContainer>
    );
}
const MyTextInput=({label,icon,isPassword,hidePassword,setHidePassword,...props})=>{
    return (
        <View>
            <LeftIcon>
                <Octicons name={icon} size={30} color={brand}/>
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props}/>
            {isPassword && (
                <RightIcon onPress={()=> setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword?'eye-off':'eye'} size={30} color={darkLight}/>
                </RightIcon>
            )}
        </View>
    )
}
export default Login;