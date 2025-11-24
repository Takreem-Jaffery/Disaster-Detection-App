import React, { useEffect, useState } from "react";
import { 
  ScrollView, 
  Linking, 
  Alert, 
  Text, 
  StyleSheet, 
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Platform,
  PermissionsAndroid
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";
import API from './../../src/api/api';
import {
  PageTitle,
  SubTitle,
} from "./../../constants/styles";
import { Colors } from "./../../constants/styles";

const { brand } = Colors;

const requestCallPermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const makeCall = async (number) => {
  const url = `tel:${number}`;
  if (Platform.OS === "android") {
    const allowed = await requestCallPermission();
    if (!allowed) {
      Alert.alert("Permission denied", "Couldn't make a call without permission.");
      return;
    }
  }
  Linking.openURL(url);
};

export default function SafeLocationsScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [safePlaces, setSafePlaces] = useState([]);
  const [sortedLocations, setSortedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Request GPS permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission is required to find nearby safe places.");
        setLoading(false);
        return;
      }

      let position = await Location.getCurrentPositionAsync({});
      setUserLocation(position.coords);
    })();
  }, []);

  // Fetch safe places
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
        console.error("Error fetching safe places:", err);
        Alert.alert("Error", "Failed to load safe places");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [userLocation]);

  // Sort locations by distance
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

  const openInMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const extractLat = (loc) => loc.location.coordinates[1];
  const extractLng = (loc) => loc.location.coordinates[0];

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
    <>
      <StatusBar style='light' />
      
      {/* Header */}
      <View style={styles.headerWrapper}>
        <ImageBackground
          source={require('./../../assets/images/img2.webp')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View style={styles.headerText}>
                <PageTitle home={true}>Safe Locations</PageTitle>
                <SubTitle home={true}>
                  📍 Find nearby emergency shelters
                </SubTitle>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Content */}
      <LinearGradient
        colors={['#f8f7fc', '#ebe8f5', '#ddd8ee']}
        style={styles.linearGradient}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={brand} />
              <Text style={styles.loadingText}>Finding safe places near you...</Text>
            </View>
          ) : sortedLocations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>No safe places found nearby</Text>
              <Text style={styles.emptySubtext}>Try increasing the search radius</Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultsHeader}>
                {sortedLocations.length} location{sortedLocations.length !== 1 ? 's' : ''} found
              </Text>

              {sortedLocations.map((loc) => (
                <View key={loc.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="shield-checkmark" size={24} color={brand} />
                    </View>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle}>{loc.name}</Text>
                      <View style={styles.distanceBadge}>
                        <Ionicons name="navigate" size={14} color="#fff" />
                        <Text style={styles.distanceText}>
                          {loc.distance ? loc.distance.toFixed(2) : "N/A"} km
                        </Text>
                      </View>
                    </View>
                  </View>

                  {loc.description && (
                    <Text style={styles.description}>{loc.description}</Text>
                  )}

                  <View style={styles.detailsContainer}>
                    {loc.address && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.detailText}>{loc.address}</Text>
                      </View>
                    )}

                    {loc.capacity !== undefined && loc.capacity > 0 && (
                      <View style={styles.detailRow}>
                        <Ionicons name="people" size={16} color="#666" />
                        <Text style={styles.detailText}>Capacity: {loc.capacity}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.mapButton]}
                      onPress={() => openInMaps(loc.lat, loc.lon)}
                    >
                      <Ionicons name="map" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Directions</Text>
                    </TouchableOpacity>

                    {loc.number && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.callButton]}
                        onPress={() => makeCall(loc.number)}
                      >
                        <Ionicons name="call" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerWrapper: {
    backgroundColor: '#796AC6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  headerBackground: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerImage: {
    opacity: 0.8,
    resizeMode: 'cover',
  },
  headerOverlay: {
    backgroundColor: 'rgba(121, 106, 198, 0.7)',
    marginTop: -60,
    marginBottom: -20,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },

  // Content Styles
  linearGradient: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },

  // Results Header
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(121, 106, 198, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  detailsContainer: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  mapButton: {
    backgroundColor: brand,
  },
  callButton: {
    backgroundColor: '#22C55E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});