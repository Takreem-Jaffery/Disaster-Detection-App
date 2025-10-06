import React, {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
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
} from './../../constants/styles'
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { Colors } from './../../constants/styles';
const {brand, darkLight, tertiary,primary} = Colors;

const Home = ()=>{
    const router = useRouter();
    return (
        <>
            <StatusBar style='light'/>
            <InnerContainer>
                <HomeContainer>
                    <PageTitle>Contacts Page</PageTitle>
                    <MyContactView
                        title={"PDMA"}
                        call={"1129"}
                        sms={"111"}
                    />
                </HomeContainer>
            </InnerContainer>
        </>
    );
}
const MyContactView = ({title, call, sms})=>{
    return (
        <View style={styles.container}>
            <SubTitle style={styles.subtitle}>{title}</SubTitle>
            <View style={styles.row}>
            <Text style={styles.text}>{call}</Text>
                <TouchableOpacity style={styles.icon} onPress={()=>{/*it will perform a call function*/ }}>
                    <Ionicons name={"call"} size={30} color={brand}/>    
                </TouchableOpacity>
            </View>
            {sms&&<View style={styles.row}>
            <Text style={styles.text}>{sms}</Text>
            <TouchableOpacity style={styles.icon} onPress={()=>{/*it will perform a call function*/ }}>
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
    },
    row:{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // backgroundColor:primary,
    },
    subtitle:{
        marginBottom:0
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