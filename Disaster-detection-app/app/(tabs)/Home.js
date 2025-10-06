import React, {useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
    InnerContainer,
    PageTitle,
    SubTitle,
    StyledFormArea,
    ButtonText,
    StyledButton,
    Line,
    HomeContainer,
    HomeImage,
    Avatar
} from './../../constants/styles'





const Home = ()=>{
    const [hidePassword,setHidePassword] =useState(true);
    const router = useRouter();

    return (
        <>
            <StatusBar style='light'/>
            <InnerContainer>
                <HomeImage source={require('./../../assets/images/img2.webp')} resizeMode="cover" />
                <HomeContainer>
                    <PageTitle home={true}>Welcome!</PageTitle>
                    <SubTitle home={true}>Home Page</SubTitle>
                
                        <StyledFormArea>
                            <Avatar source={require('./../../assets/images/app-logo.png')} resizeMode="cover"/>
                            <Line/>
                            <StyledButton onPress={()=>{router.replace("/Login")}}>
                                <ButtonText>
                                    Log Out
                                </ButtonText>
                            </StyledButton>
                            <StyledButton onPress={() => router.push('/ViewPrecautions')}>
                                <ButtonText>View Precautions</ButtonText>
                            </StyledButton>

                            <StyledButton onPress={() => router.push('/CreatePrecautions')}>
                                <ButtonText>Create Precautions</ButtonText>
                            </StyledButton>
                            
                        </StyledFormArea>
                </HomeContainer>
            </InnerContainer>
        </>
    );
}

export default Home;