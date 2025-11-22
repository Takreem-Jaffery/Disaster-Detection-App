import React, {useState, useEffect, useContext} from 'react';
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
} from "../../constants/styles"
import { View, StyleSheet, ActivityIndicator, Alert, Text, ScrollView, Dimensions } from 'react-native';
// Uncomment for mobile
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import API from "../../src/api/api"
import { AuthContext } from './../../src/context/authContext';

const Home = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [areaRiskData, setAreaRiskData] = useState([]);
    const [forecastData, setForecastData] = useState([]);
    const [currentRisk, setCurrentRisk] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);
    const router = useRouter();
    const { logout } = useContext(AuthContext);
    
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

            // Fetch flood risk data
            await fetchFloodData(currentLocation.coords.latitude, currentLocation.coords.longitude);
        })();
    }, []);

    const fetchFloodData = async (lat, lon) => {
        setDataLoading(true);
        try {
            // Fetch area risk (9 grid points)
            const areaResponse = await API.get(`/prediction/area?lat=${lat}&lon=${lon}`);
            setAreaRiskData(areaResponse.data.areas);

            // Fetch 3-day forecast
            const forecastResponse = await API.get(`/prediction/forecast?lat=${lat}&lon=${lon}`);
            setForecastData(forecastResponse.data.forecast);

            // Fetch current risk
            const currentResponse = await API.get(`/prediction/current?lat=${lat}&lon=${lon}`);
            setCurrentRisk(currentResponse.data);

        } catch (error) {
            console.error('Error fetching flood data:', error);
            Alert.alert('Error', 'Failed to fetch flood risk data. Please try again.');
        } finally {
            setDataLoading(false);
        }
    };

    // Helper function to get risk color
    const getRiskColor = (riskLevel) => {
        switch(riskLevel) {
            case 'high':
                return 'rgba(220, 38, 38, 0.3)'; // Red with opacity
            case 'medium':
                return 'rgba(251, 191, 36, 0.3)'; // Yellow/Orange with opacity
            case 'low':
            default:
                return 'rgba(34, 197, 94, 0.3)'; // Green with opacity
        }
    };

    const getRiskBorderColor = (riskLevel) => {
        switch(riskLevel) {
            case 'high':
                return '#DC2626';
            case 'medium':
                return '#F59E0B';
            case 'low':
            default:
                return '#22C55E';
        }
    };

    // Get circle radius in meters (for MapView)
    const getCircleRadius = () => {
        // 0.05 degree ≈ 5.5 km, so radius should be about 2750 meters
        return 2750;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Getting your location...</Text>
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
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <PageTitle home={true}>Flood Risk Monitor</PageTitle>
                    <SubTitle home={true}>
                        📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </SubTitle>
                </View>

                {/* Current Risk Summary - Compact */}
                {currentRisk && (
                    <View style={styles.compactRiskCard}>
                        <View style={styles.compactRiskHeader}>
                            <Text style={styles.compactRiskLabel}>Current Risk:</Text>
                            <View style={[styles.compactRiskBadge, { backgroundColor: getRiskColor(currentRisk.risk), borderColor: getRiskBorderColor(currentRisk.risk) }]}>
                                <Text style={[styles.compactRiskText, { color: getRiskBorderColor(currentRisk.risk) }]}>
                                    {currentRisk.risk.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.compactStats}>
                            <Text style={styles.compactStatText}>
                                🌧️ {currentRisk.rainfall24h}mm
                            </Text>
                            <Text style={styles.compactStatText}>
                                💧 {(currentRisk.soilMoisture * 100).toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                )}

                {/* Map View with Circle Overlays */}
                <View style={styles.mapContainer}>
                    <Text style={styles.sectionTitle}>Risk Map</Text>
                    {dataLoading ? (
                        <View style={styles.mapPlaceholder}>
                            <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    ) : (
                        <>
                            {/* FOR WEB: Show grid visualization */}
                            {/* <View style={styles.webMapPlaceholder}>
                                <Text style={styles.webMapText}>📍 Map View</Text>
                                <Text style={styles.webMapSubtext}>
                                    (Enable for mobile with MapView)
                                </Text>
                                
                                <View style={styles.gridMap}>
                                    {areaRiskData.map((area, index) => (
                                        <View 
                                            key={index}
                                            style={[
                                                styles.gridCell,
                                                {
                                                    backgroundColor: getRiskColor(area.riskLevel),
                                                    borderColor: getRiskBorderColor(area.riskLevel),
                                                }
                                            ]}
                                        >
                                            <Text style={styles.gridCellText}>
                                                {area.riskLevel === 'high' ? '🔴' : area.riskLevel === 'medium' ? '🟡' : '🟢'}
                                            </Text>
                                            <Text style={styles.gridCellSubtext}>
                                                {area.rainfall24h.toFixed(1)}mm
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View> */}

                            {/* FOR MOBILE: Uncomment this section when deploying to mobile */}
                            
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: 0.15,
                                    longitudeDelta: 0.15,
                                }}
                                showsUserLocation={true}
                            >
                                {areaRiskData.map((area, index) => (
                                    <Circle
                                        key={index}
                                        center={{
                                            latitude: area.lat,
                                            longitude: area.lon,
                                        }}
                                        radius={getCircleRadius()}
                                        fillColor={getRiskColor(area.riskLevel)}
                                        strokeColor={getRiskBorderColor(area.riskLevel)}
                                        strokeWidth={2}
                                    />
                                ))}
                                <Marker
                                    coordinate={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                    }}
                                    title="Your Location"
                                    pinColor="blue"
                                />
                            </MapView>
                           
                        </>
                    )}
                    
                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: getRiskColor('low'), borderColor: getRiskBorderColor('low') }]} />
                            <Text style={styles.legendText}>Low</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: getRiskColor('medium'), borderColor: getRiskBorderColor('medium') }]} />
                            <Text style={styles.legendText}>Medium</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: getRiskColor('high'), borderColor: getRiskBorderColor('high') }]} />
                            <Text style={styles.legendText}>High</Text>
                        </View>
                    </View>
                </View>

                {/* 3-Day Forecast Timeline */}
                <View style={styles.timelineContainer}>
                    <Text style={styles.sectionTitle}>3-Day Forecast</Text>
                    {dataLoading ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        forecastData.map((day, index) => (
                            <View key={index} style={styles.timelineDay}>
                                <View style={styles.timelineDayHeader}>
                                    <Text style={styles.dayText}>
                                        {new Date(day.day).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </Text>
                                    <View style={[styles.riskPill, { 
                                        backgroundColor: getRiskColor(day.risk),
                                        borderColor: getRiskBorderColor(day.risk)
                                    }]}>
                                        <Text style={[styles.riskPillText, { color: getRiskBorderColor(day.risk) }]}>
                                            {day.risk}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.timelineDayStats}>
                                    <Text style={styles.dayStatText}>
                                        🌧️ Rainfall: {day.rainfall} mm
                                    </Text>
                                    <Text style={styles.dayStatText}>
                                        💧 Soil: {(day.soilMoisture * 100).toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Logout Section */}
                <View style={styles.footerContainer}>
                    <Avatar source={require('./../../assets/images/app-logo.png')} resizeMode="cover"/>
                    <Line/>
                    <StyledButton onPress={async()=>{
                        await logout();
                        router.replace("/Login")
                    }}>
                        <ButtonText>
                            Log Out
                        </ButtonText>
                    </StyledButton>
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: '#bedeffff',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    compactRiskCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    compactRiskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    compactRiskLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    compactRiskBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 2,
    },
    compactRiskText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    compactStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    compactStatText: {
        fontSize: 13,
        color: '#666',
    },
    mapContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    map: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginBottom: 12,
    },
    mapPlaceholder: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    webMapPlaceholder: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    webMapText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
    webMapSubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 16,
    },
    gridMap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    gridCell: {
        width: '30%',
        aspectRatio: 1,
        margin: '1.5%',
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCellText: {
        fontSize: 24,
    },
    gridCellSubtext: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    timelineContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timelineDay: {
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
        paddingLeft: 12,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    timelineDayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    riskPill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    riskPillText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    timelineDayStats: {
        gap: 4,
    },
    dayStatText: {
        fontSize: 13,
        color: '#666',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
});

export default Home;