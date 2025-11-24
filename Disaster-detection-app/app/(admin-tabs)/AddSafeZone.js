import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  ImageBackground,
  ScrollView
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "./../../src/api/api";
import {
  PageTitle,
  SubTitle,
  StyledButton,
  ButtonText,
  StyledTextInputSafe,
} from "./../../constants/styles";
import { Colors } from "./../../constants/styles";

const { brand } = Colors;

export default function AddSafeZone() {
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    contact: "",
    capacity: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    fetchSafeZones();
  }, []);

  const fetchSafeZones = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/safePlaces/listSafePlace", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSafeZones(res.data.data || res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Error", "Failed to fetch safe zones");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      address: "",
      contact: "",
      capacity: "",
      lat: "",
      lng: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCoordinates = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Permission denied", "Location permission is required.");
      }
      let location = await Location.getCurrentPositionAsync({});
      setForm((prev) => ({
        ...prev,
        lat: location.coords.latitude.toString(),
        lng: location.coords.longitude.toString()
      }));
      Alert.alert("Success", "Coordinates captured!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const openInMaps = (lat, lng) => {
    // Handle both GeoJSON format and direct lat/lng
    let latitude, longitude;
    
    if (typeof lat === 'object' && lat.coordinates) {
      // GeoJSON format: coordinates are [lng, lat]
      longitude = lat.coordinates[0];
      latitude = lat.coordinates[1];
    } else {
      latitude = lat;
      longitude = lng;
    }
    
    Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
  };

  const saveSafeZone = async () => {
    if (!form.name || !form.lat || !form.lng) {
      return Alert.alert("Validation Error", "Name, Latitude, and Longitude are required!");
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        name: form.name,
        description: form.description,
        address: form.address,
        contact: form.contact,
        capacity: parseInt(form.capacity) || 0,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        isActive: form.isActive,
      };

      if (editingId) {
        await API.put(`/safePlaces/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert("Success", "Safe zone updated!");
      } else {
        await API.post("/safePlaces/create", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert("Success", "Safe zone added!");
      }
      await fetchSafeZones();
      resetForm();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const editSafeZone = (item) => {
    // Extract lat/lng from GeoJSON coordinates [lng, lat]
    const lng = item.location?.coordinates?.[0] || "";
    const lat = item.location?.coordinates?.[1] || "";
    
    setForm({
      name: item.name || "",
      description: item.description || "",
      address: item.address || "",
      contact: item.contact || "",
      capacity: item.capacity?.toString() || "",
      lat: lat.toString(),
      lng: lng.toString(),
      isActive: item.isActive !== false,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this safe zone?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem("token");
              await API.delete(`/safePlaces/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert("Success", "Safe zone deleted");
              await fetchSafeZones();
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Failed to delete");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
                <PageTitle home={true}>Safe Zones</PageTitle>
                <SubTitle home={true}>
                  🏥 Manage Emergency Locations
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
          {/* Add Button */}
          {!showForm && (
            <View style={styles.addButtonContainer}>
              <StyledButton onPress={() => setShowForm(true)} disabled={loading}>
                <ButtonText>+ Add New Safe Zone</ButtonText>
              </StyledButton>
            </View>
          )}

          {/* Form */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingId ? "Edit Safe Zone" : "New Safe Zone"}
              </Text>

              <Text style={styles.label}>Name *</Text>
              <StyledTextInputSafe
                placeholder="Safe Zone Name"
                value={form.name}
                onChangeText={(t) => handleChange("name", t)}
              />

              <Text style={styles.label}>Description</Text>
              <StyledTextInputSafe
                placeholder="Description"
                value={form.description}
                onChangeText={(t) => handleChange("description", t)}
                multiline
                style={{ height: 80, textAlignVertical: "top" }}
              />

              <Text style={styles.label}>Address</Text>
              <StyledTextInputSafe
                placeholder="Full Address"
                value={form.address}
                onChangeText={(t) => handleChange("address", t)}
              />

              <Text style={styles.label}>Contact Number</Text>
              <StyledTextInputSafe
                placeholder="Contact Number"
                value={form.contact}
                onChangeText={(t) => handleChange("contact", t)}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Capacity</Text>
              <StyledTextInputSafe
                placeholder="Maximum Capacity"
                value={form.capacity}
                onChangeText={(t) => handleChange("capacity", t)}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Coordinates *</Text>
              <View style={styles.coordRow}>
                <View style={styles.coordInput}>
                  <StyledTextInputSafe
                    placeholder="Latitude"
                    value={form.lat}
                    onChangeText={(t) => handleChange("lat", t)}
                    keyboardType="numeric"
                    style={styles.coordTextInput}
                  />
                </View>
                <View style={styles.coordInput}>
                  <StyledTextInputSafe
                    placeholder="Longitude"
                    value={form.lng}
                    onChangeText={(t) => handleChange("lng", t)}
                    keyboardType="numeric"
                    style={styles.coordTextInput}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.locationBtn} onPress={getCoordinates}>
                <Ionicons name="location" size={18} color="#fff" />
                <Text style={styles.locationBtnText}>Use My Current Location</Text>
              </TouchableOpacity>

              {form.lat && form.lng && (
                <TouchableOpacity 
                  style={styles.mapBtn} 
                  onPress={() => openInMaps(form.lat, form.lng)}
                >
                  <Ionicons name="map" size={18} color={brand} />
                  <Text style={styles.mapBtnText}>Preview in Google Maps</Text>
                </TouchableOpacity>
              )}

              <View style={styles.formActions}>
                <StyledButton onPress={saveSafeZone} disabled={loading}>
                  <ButtonText>{editingId ? "Update" : "Save"}</ButtonText>
                </StyledButton>

                <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Safe Zones List */}
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>
              Safe Zones ({safeZones.length})
            </Text>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={brand} />
              </View>
            )}

            {!loading && safeZones.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No safe zones yet</Text>
                <Text style={styles.emptySubtext}>Add your first safe zone to get started</Text>
              </View>
            )}

            {safeZones.map((item) => (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark" size={24} color={brand} />
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.cardDescription}>{item.description}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  {item.address && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.detailText}>{item.address}</Text>
                    </View>
                  )}
                  
                  {item.contact && (
                    <View style={styles.detailRow}>
                      <Ionicons name="call" size={16} color="#666" />
                      <Text style={styles.detailText}>{item.contact}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="navigate" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {item.location?.coordinates?.[1]?.toFixed(4)}, {item.location?.coordinates?.[0]?.toFixed(4)}
                    </Text>
                  </View>

                  {item.capacity > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name="people" size={16} color="#666" />
                      <Text style={styles.detailText}>Capacity: {item.capacity}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.mapActionBtn]}
                    onPress={() => openInMaps(item.location)}
                  >
                    <Ionicons name="map" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>View on Map</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editBtn]}
                    onPress={() => editSafeZone(item)}
                  >
                    <Ionicons name="create" size={18} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteBtn]}
                    onPress={() => handleDelete(item._id)}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

// Move styles OUTSIDE the component
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

  // Add Button
  addButtonContainer: {
    marginBottom: 16,
  },

  // Form Styles
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coordInput: {
    flex: 1,
  },
  coordTextInput: {
    width: '100%',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  locationBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f7fc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: brand,
    gap: 8,
  },
  mapBtnText: {
    color: brand,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  formActions: {
    marginTop: 16,
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },

  // List Styles
  listContainer: {
    marginTop: 8,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
    fontFamily: 'Poppins-SemiBold',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  cardDetails: {
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  mapActionBtn: {
    flex: 1,
    backgroundColor: brand,
  },
  editBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});