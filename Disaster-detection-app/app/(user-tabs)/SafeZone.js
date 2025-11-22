import React, { useEffect, useState } from "react";
import { ScrollView, Linking, Alert, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import API from './../../src/api/api';

import {
  StyledContainer,
  PageTitle,
  LocationCard,
  LocationTitle,
  LocationDistance,
  LocationNumber,
} from "./../../constants/styles" 
import { LinearGradient } from 'expo-linear-gradient';


export default function SafeLocationsScreen() {
    const [userLocation, setUserLocation] = useState(null);
    const [safePlaces, setSafePlaces] = useState([]);
    const [sortedLocations, setSortedLocations] = useState([]);
    
    // request GPS permissions
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Location permission is required.");
                return;
            }

            let position = await Location.getCurrentPositionAsync({});
            setUserLocation(position.coords);
        })();
    }, []);

    //fetch users coordinates
    useEffect(() => {
        if (!userLocation) return;

        const fetchPlaces = async () => {
            try {
                const { latitude, longitude } = userLocation;

                const res = await API.get(
                `/safePlaces/listSafePlace?lat=${latitude}&lng=${longitude}&radius=6000`
                );

                setSafePlaces(res.data);
            } catch (err) {
                console.log("Error fetching safe places:", err);
            }
        };

        fetchPlaces();
    }, [userLocation]);

    //sort locations by distance
    useEffect(() => {
        if (!userLocation || safePlaces.length === 0) return;

        const { latitude, longitude } = userLocation;

        const sorted = safePlaces.map(place => {
            const lat = extractLat(place);
            const lng = extractLng(place);

            const distance = getDistance(latitude, longitude, lat, lng);

            return {
                id: place._id,
                name: place.name,
                lat,
                lon: lng,
                number: place.contact,
                description: place.description,
                address: place.address,
                capacity: place.capacity,
                distance
            };
        }).sort((a, b) => a.distance - b.distance);

        setSortedLocations(sorted);
    }, [userLocation, safePlaces]);

    //open maps
    const openInMaps = (lat, lng) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url);
    };

    const extractLat = (loc) => loc.location.coordinates[1];
    const extractLng = (loc) => loc.location.coordinates[0];
  
    //calculate distance as a fallback
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    return (
        <LinearGradient
            colors={['#f8f7fc', '#ebe8f5', '#ddd8ee']}
            style={styles.linearGradient}
        >
        <StyledContainer>
            <PageTitle>Safe Locations Nearby</PageTitle>

            <ScrollView style={{ width: "100%", marginTop: 10 }}>
                {sortedLocations.map((loc) => (
                    <LocationCard key={loc.id} onPress={() => openInMaps(loc.lat, loc.lon)}>
                        <LocationTitle>{loc.name}</LocationTitle>
                        <LocationDistance>{loc.distance ? loc.distance.toFixed(2) : "N/A"} km away</LocationDistance>

                        {loc.number && <LocationNumber>📞 {loc.number}</LocationNumber>}
                        
                        {loc.description && <Text style={{marginTop: 4}}>{loc.description}</Text>}
                        {loc.address && <Text style={{marginTop: 2, fontStyle: "italic"}}>{loc.address}</Text>}
                        {loc.capacity !== undefined && (
                            <Text style={{marginTop: 2}}>Capacity: {loc.capacity}</Text>
                        )}
                    </LocationCard>

                ))}
            </ScrollView>
        </StyledContainer>
        </LinearGradient>
    );
}
const styles = StyleSheet.create({
    linearGradient: {
        flex:1,
        width: '100%',
    },
});
