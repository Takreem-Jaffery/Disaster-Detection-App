import React, {useState, useEffect} from 'react';
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
} from "./../../constants/styles"
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
//uncomment for mobile
// import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const Home = ()=>{
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();


     useEffect(() => {
        (async () => {
        // Ask for permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow location access to view your position on the map.');
            setLoading(false);
            return;
        }

        // Get current location
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        setLoading(false);
        })();
    }, []);

     if (loading) {
        return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
        );
    }

    if (!location) {
        return (
        <View style={styles.centered}>
            <Text>Location not available.</Text>
        </View>
        );
    }
    return (
        <>
            <StatusBar style='light'/>
            <InnerContainer>
                <HomeImage source={require('./../../assets/images/img2.webp')} resizeMode="cover" />
                <HomeContainer>
                    <PageTitle home={true}>Welcome!</PageTitle>
                    <SubTitle home={true}>Notification Page</SubTitle>
                
                        <StyledFormArea>
                            <Avatar source={require('./../../assets/images/app-logo.png')} resizeMode="cover"/>
                            <Line/>
                            <StyledButton onPress={()=>{router.replace("/Login")}}>
                                <ButtonText>
                                    Log Out
                                </ButtonText>
                            </StyledButton>
                            
                        </StyledFormArea>
                </HomeContainer>
            </InnerContainer>
        </>
    );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;