import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {Formik} from 'formik'
import {View, Text} from 'react-native'
import {Octicons,Ionicons} from '@expo/vector-icons';
import {Colors} from '../constants/styles'
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
                        onSubmit={(values)=>{
                            console.log(values);
                            router.push('/(tabs)/Home')
                            // navigation.navigate("Home")
                        }}
                    >
                        {({handleChange, handleBlur, handleSubmit, values})=>(<StyledFormArea>
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
                                <MsgBox></MsgBox>
                                <StyledButton onPress={handleSubmit}>
                                    <ButtonText>
                                        Log In
                                    </ButtonText>
                                </StyledButton>
                                {/* <Line/> */}
                                <ExtraView>
                                    <ExtraText>
                                        Don't have an account?  
                                    </ExtraText>
                                    <TextLink onPress={()=>navigation.navigate("Signup")}>
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