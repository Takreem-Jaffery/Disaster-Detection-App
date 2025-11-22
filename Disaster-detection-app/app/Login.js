import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {Formik} from 'formik'
import {View, Text, Alert, StyleSheet} from 'react-native'
import {Octicons,Ionicons} from '@expo/vector-icons';
import {Colors} from '../constants/styles'
import { useContext } from 'react';
import { AuthContext } from '../src/context/authContext'; // exact match
import API from "./../src/api/api"
import AsyncStorage from '@react-native-async-storage/async-storage';
 import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
            colors={['#f8f7fc', '#ebe8f5', '#ddd8ee']}
            style={styles.linearGradient}
        >
        <StyledContainer style={styles.background}>
            
            <StatusBar style='dark'/>
            <InnerContainer>
                <PageLogo source={require('../assets/images/app-logo.png')}
                    resizeMode="cover"/>
                    <PageTitle>Disaster Detection App</PageTitle>
                    <SubTitle>Account Login</SubTitle>

                    <View style={styles.view}>
                    <Formik
                        initialValues={{email:'',password:''}}
                        // onSubmit={({ email, password },{setSubmitting}) => handleLogin(email, password,setSubmitting)}
                        onSubmit={async ({email,password}, {setSubmitting})=>{
                        setMsg('');
                        try {
                            setSubmitting(true);
                            
                            const data = await login({ email, password }); 
                            // Alert.alert("Debug", JSON.stringify(data, null, 2));
                            // console.log("Login response:", data);
                            // console.log("User role:", data.role);
                            // const response = await API.post('/auth/login', { email, password });

                            // const data = response.data;

                            // // Save token and role
                            // await AsyncStorage.setItem('token', data.token);
                            // await AsyncStorage.setItem('userRole', data.user.role);

                            // Navigate based on role
                            if (data.role === 'rescue-authority') {
                                router.push('/(admin-tabs)/Home');
                            } else {
                                router.push('/(user-tabs)/Home');
                            }
                        } catch (error) {
                            setMsg(error.message);
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
                </View>
            </InnerContainer>
        </StyledContainer>
        </LinearGradient>
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
const styles = StyleSheet.create({
    view:{
        display:"flex",
        flex:0,
        minWidth:"auto",
        minHeight:"auto",
        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#ddd",
        justifyContent:"center",
        backgroundColor: '#ffffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingHorizontal:12,
        paddingVertical:30,

    },
    background:{
        backgroundColor:"none"
    },  
    linearGradient: {
        flex:1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default Login;