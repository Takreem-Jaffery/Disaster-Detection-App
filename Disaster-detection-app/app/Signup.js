import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { View, Text, TouchableOpacity } from 'react-native';
import { Octicons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/styles';
import {
  StyledContainer,
  InnerContainer,
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
  ExtraText,
  ExtraView,
  TextLink,
  TextLinkContent,
  RadioOuter,
  RadioInner,
} from '../constants/styles';

import { AuthContext } from '../src/context/authContext'; // adjust path if your context is elsewhere
import { useRouter } from 'expo-router';

const { brand, darkLight } = Colors;

const Signup = () => {
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideComfirmPassword] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();
  const { register } = useContext(AuthContext);
  const [msg, setMsg] = useState('');

  return (
    <StyledContainer>
      <StatusBar style="dark" />
      <InnerContainer>
        <PageTitle>Disaster Detection App</PageTitle>
        <SubTitle>Account Signup</SubTitle>

        <Formik
          initialValues={{
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setMsg('');
            setSubmitting(true);

            // client-side password match check
            if (values.password !== values.confirmPassword) {
              setMsg('Passwords do not match');
              setSubmitting(false);
              return;
            }

            try {
              // map fullName -> name as backend expects "name"
              const payload = {
                name: values.fullName,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword, // backend validator may expect this
                role: values.role || 'user',
              };

              await register(payload); // AuthContext.register saves token and sets user
              // navigate to home on success
              router.push('/(tabs)/Home');
            } catch (err) {
              // derive message from server or fallback to error.message
              const serverMsg =
                err?.response?.data?.message ||
                (err?.response?.data?.errors ? err.response.data.errors.map(e => e.msg).join(', ') : null) ||
                err.message;
              setMsg(serverMsg || 'Registration failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, isSubmitting }) => (
            <StyledFormArea>
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
                autoCapitalize="none"
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <RadioButton
                  label="User"
                  value="user"
                  selected={values.role === 'user'}
                  onPress={val => setFieldValue('role', val)}
                />
                <RadioButton
                  label="Rescue Authority"
                  value="rescue-authority"
                  selected={values.role === 'rescue-authority'}
                  onPress={val => setFieldValue('role', val)}
                />
              </View>

              <MsgBox>{msg}</MsgBox>

              <StyledButton onPress={handleSubmit} disabled={isSubmitting}>
                <ButtonText>{isSubmitting ? 'Signing up...' : 'Sign Up'}</ButtonText>
              </StyledButton>

              <ExtraView>
                <ExtraText>Already have an account? </ExtraText>
                <TextLink onPress={() => navigation.navigate('Login')}>
                  <TextLinkContent>Log In</TextLinkContent>
                </TextLink>
              </ExtraView>
            </StyledFormArea>
          )}
        </Formik>
      </InnerContainer>
    </StyledContainer>
  );
};

const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
  return (
    <View>
      <LeftIcon>
        <Octicons name={icon} size={30} color={brand} />
      </LeftIcon>
      <StyledInputLabel>{label}</StyledInputLabel>
      <StyledTextInput {...props} />
      {isPassword && (
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darkLight} />
        </RightIcon>
      )}
    </View>
  );
};

const RadioButton = ({ label, value, selected, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(value)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
      <RadioOuter>{selected ? <RadioInner /> : null}</RadioOuter>
      <Text style={{ marginLeft: 8 }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default Signup;
