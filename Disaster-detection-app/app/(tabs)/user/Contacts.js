import React, {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {Octicons,Ionicons} from '@expo/vector-icons';
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
    Avatar,
    LeftIcon,
    RightIcon
} from "./../../../constants/styles"
import { Platform, PermissionsAndroid, View, StyleSheet, ActivityIndicator, Alert,ScrollView, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/styles';
const {brand, darkLight, tertiary,primary} = Colors;

const requestCallPermission = async ()=>{ //only for android
    try{
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err){
        console.warn(err);
        return false;
    }
}
const makeCall = async (number)=>{
    const url = `tel:${number}`;

    //ask for permission
    if (Platform.OS === "android"){
        const allowed = await requestCallPermission();
        if (!allowed){
            Alert.alert("Permission denied","Couldn't make a call without permission.");
            return;
        }
    }
    Linking.openURL(url);
}
const sendSMS = (number)=>{
    const url = `sms:${number}`;
    Linking.openURL(url);
}
const Home = ()=>{
    const router = useRouter();
    return (
        <>
            <StatusBar style='light'/>
            <InnerContainer>
                <HomeContainer>
                    <PageTitle style={styles.title}>Contacts Page</PageTitle>
                    <ScrollView style={styles.scroll}>
                        <MyContactView
                            title={"Emergency Rescue"}
                            call={"1122"}
                        />
                        <MyContactView
                            title={"NDMA - National Disaster Management Authority"}
                            call={["051-9214295","051-9087812"]}
                        />
                        <MyContactView
                            title={"MoHR Helpline - Women & Children Protection"}
                            call={"1099"}
                            sms={"1099"}
                        />
                        <MyContactView
                            title={"Weather Early Warning - Pak Meteorological Dept"}
                            call={"051-111-638-638"}
                        />
                        <MyContactView
                            title={"Edhi Foundation - Ambulance"}
                            call={"115"}
                        />
                        <MyContactView
                            title={"Fire Brigade"}
                            call={"16"}
                        />
                    </ScrollView>
                </HomeContainer>
            </InnerContainer>
        </>
    );
}
const MyContactView = ({title, call = [], sms})=>{
    const callNumbers = Array.isArray(call) ? call : [call];

    return (
        <View style={styles.container}>
            <SubTitle style={styles.subtitle}>{title}</SubTitle>
            {callNumbers.map((number, idx) => (
                <View style={styles.row} key={idx}>
                    <Text style={styles.text}>{number}</Text>
                    <TouchableOpacity onPress={() => { makeCall(number) }}>
                        <Ionicons name={"call"} size={30} color={brand}/>    
                    </TouchableOpacity>
                </View>
            ))}
            {sms&&<View style={styles.row} >
            <Text style={styles.text}>{sms}</Text>
            <TouchableOpacity style={styles.icon} onPress={()=>{ sendSMS(sms) }}>
                <Ionicons name={"chatbubble"} size={30} color={brand}/>    
            </TouchableOpacity>
            </View>}
            
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        width:"100%",
        backgroundColor: tertiary,
        borderRadius: 10,
        padding:15,
        marginTop:10,
        marginBottom:10,
    },
    title:{
        padding:10
    },
    row:{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius:7,
        backgroundColor:primary,
        padding:3,
        marginBottom:8,
    },
    subtitle:{
        marginBottom:10
    },  
    scroll:{
        paddingHorizontal:8
    },  
    text:{
        fontSize:20,
        // marginTop:-10
    },
    icon:{
        right:0,
        zIndex:1
    }
    
});

export default Home;