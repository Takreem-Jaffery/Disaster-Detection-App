import React, { useEffect, useState } from "react";
import { ScrollView, Linking, Alert, Text } from "react-native";
import * as Location from "expo-location";
import API from '../../src/api/api';

import {
  StyledContainer,
  PageTitle,
  LocationCard,
  LocationTitle,
  LocationDistance,
  LocationNumber,
} from './../../constants/styles'; 

// Example data
const SAFE_LOCATIONS = [
  {
    id: 1,
    name: "Community Shelter A",
    lat: 31.5204,
    lon: 74.3587,
    number: "042-1234567",
    description: "A safe place for community members during disasters.",
    address: "123 Main St, Lahore",
    capacity: 150
  },
  {
    id: 2,
    name: "Rescue Point B",
    lat: 31.5090,
    lon: 74.3400,
    description: "Rescue point equipped with first aid.",
    address: "45 Rescue Rd, Lahore",
    capacity: 80
  },
  {
    id: 3,
    name: "Hospital XYZ",
    lat: 31.4980,
    lon: 74.3600,
    number: "042-9876543",
    description: "Emergency hospital with 24/7 services.",
    address: "789 Health Ave, Lahore",
    capacity: 300
  },
];


export default function SafeLocationsScreen() {
    const [userLocation, setUserLocation] = useState(null);
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
                `/safePlace/listSafePlace?lat=${latitude}&lng=${longitude}&radius=6000`
                );

                setSafePlaces(res.data);
            } catch (err) {
                console.log("Error fetching safe places:", err);
            }
        };

        fetchPlaces();
    }, [userLocation]);

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
        <StyledContainer>
            <PageTitle>Safe Locations Nearby</PageTitle>

            <ScrollView style={{ width: "100%", marginTop: 10 }}>
                {SAFE_LOCATIONS.map((loc) => (
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
    );
}
