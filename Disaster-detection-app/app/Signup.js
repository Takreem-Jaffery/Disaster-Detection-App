import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar';
import {Formik} from 'formik'
import {View, Text, TouchableOpacity} from 'react-native'
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
    RadioOuter,
    RadioInner,
} from '../constants/styles'

const {brand, darkLight} = Colors;




const Signup = ()=>{
    const [hidePassword,setHidePassword] =useState(true);
    const [hideConfirmPassword,setHideComfirmPassword] =useState(true);
    const navigation = useNavigation();

    return (
        <StyledContainer>
            <StatusBar style='dark'/>
            <InnerContainer>
                {/* <PageLogo source={require('../assets/images/app-logo.png')}
                    resizeMode="cover"/> */}
                    <PageTitle>Disaster Detection App</PageTitle>
                    <SubTitle>Account Signup</SubTitle>

                    <Formik
                        initialValues={{fullName:'',email:'',password:'', confirmPassword:'', role: '',}}
                        onSubmit={(values)=>{
                            console.log(values);
                        }}
                    >
                        {({handleChange, handleBlur, handleSubmit, values, setFieldValue})=>(<StyledFormArea>
                                <MyTextInput
                                    label="Full Name"
                                    icon="person"
                                    placeholder="Nichole Waterson"
                                    placeholderTextColor={darkLight}
                                    onChangeText={handleChange('fullName')}
                                    onBlur={handleBlur('fullName')}
                                    value={values.fullName}
                                />
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
                                <MyTextInput
                                    label="Confirm Password"
                                    icon="lock"
                                    placeholder="**********"
                                    placeholderTextColor={darkLight}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={handleBlur('confirmPassword')}
                                    value={values.confirmPassword}
                                    secureTextEntry={hideConfirmPassword}
                                    isPassword={true}
                                    hidePassword={hideConfirmPassword}
                                    setHidePassword={setHideComfirmPassword}
                                />
                                <StyledInputLabel>Role</StyledInputLabel>
                                <View style={{flexDirection:"row", justifyContent:"space-evenly"}}>
                                    <RadioButton
                                        label="User"
                                        value="user"
                                        selected={values.role === "user"}
                                        onPress={(val)=>setFieldValue("role",val)}
                                    />
                                    <RadioButton
                                        label="Rescue Authority"
                                        value="rescue-authority"
                                        selected={values.role === "rescue-authority"}
                                        onPress={(val)=>setFieldValue("role",val)}
                                    />
                                </View>
                                <MsgBox></MsgBox>
                                <StyledButton onPress={handleSubmit}>
                                    <ButtonText>
                                        Sign Up
                                    </ButtonText>
                                </StyledButton>
                                <ExtraView>
                                    <ExtraText>
                                        Already have an account?  
                                    </ExtraText>
                                    <TextLink onPress={()=>navigation.navigate("Login")}>
                                        <TextLinkContent>Log In</TextLinkContent>
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
const RadioButton = ({label, value, selected, onPress})=>{
    return (
        <TouchableOpacity
            onPress={()=>onPress(value)}
            style={{flexDirection: "row", alignItems:"center",marginVertical:5}}
        >
            <RadioOuter>{selected?<RadioInner/>:null}</RadioOuter>
            <Text>{label}</Text>
        </TouchableOpacity>
    )
}
export default Signup;