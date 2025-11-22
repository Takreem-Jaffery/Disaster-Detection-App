import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as Location from 'expo-location';
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "./../../src/api/api";
import {
  StyledContainer,
  PageTitle,
  StyledButton,
  ButtonText,
  StyledTextInputSafe,
  SubTitle,
} from "./../../constants/styles";

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

  const openInMaps = () => {
    if (!form.lat || !form.lng) {
      return Alert.alert("Missing coords", "Set lat/lng first.");
    }
    Linking.openURL(`https://www.google.com/maps?q=${form.lat},${form.lng}`);
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
        // Update existing
        await API.put(`/safePlaces/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert("Success", "Safe zone updated!");
      } else {
        // Create new
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
    setForm({
      name: item.name || "",
      description: item.description || "",
      address: item.address || "",
      contact: item.contact || "",
      capacity: item.capacity?.toString() || "",
      lat: item.lat?.toString() || "",
      lng: item.lng?.toString() || "",
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

  const toggleActive = async (item) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await API.put(`/safePlaces/update/${item._id}`, 
        { ...item, isActive: !item.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchSafeZones();
    } catch (err) {
      Alert.alert("Error", "Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View>
      <PageTitle style={{ fontSize: 26 }}>Safe Zones</PageTitle>
      <SubTitle style={{ fontSize: 20, marginBottom: 15 }}>
        Manage Safe Locations
      </SubTitle>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

      {!showForm ? (
        <StyledButton onPress={() => setShowForm(true)} disabled={loading}>
          <ButtonText>Add New Safe Zone</ButtonText>
        </StyledButton>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Name</Text>
          <StyledTextInputSafe
            placeholder="Safe Zone Name"
            placeholderTextColor="#888"
            value={form.name}
            onChangeText={(t) => handleChange("name", t)}
          />

          <Text style={styles.label}>Description</Text>
          <StyledTextInputSafe
            placeholder="Description"
            placeholderTextColor="#888"
            value={form.description}
            onChangeText={(t) => handleChange("description", t)}
            multiline
            style={{ height: 80, textAlignVertical: "top" }}
          />

          <Text style={styles.label}>Address</Text>
          <StyledTextInputSafe
            placeholder="Address"
            placeholderTextColor="#888"
            value={form.address}
            onChangeText={(t) => handleChange("address", t)}
          />

          <Text style={styles.label}>Contact</Text>
          <StyledTextInputSafe
            placeholder="Contact Number"
            placeholderTextColor="#888"
            value={form.contact}
            onChangeText={(t) => handleChange("contact", t)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Capacity</Text>
          <StyledTextInputSafe
            placeholder="Max Capacity"
            placeholderTextColor="#888"
            value={form.capacity}
            onChangeText={(t) => handleChange("capacity", t)}
            keyboardType="numeric"
          />

          <View style={styles.coordRow}>
            <View style={styles.coordInput}>
              <Text style={styles.label}>Latitude *</Text>
              <StyledTextInputSafe
                placeholder="Latitude"
                placeholderTextColor="#888"
                value={form.lat}
                onChangeText={(t) => handleChange("lat", t)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.coordInput}>
              <Text style={styles.label}>Longitude *</Text>
              <StyledTextInputSafe
                placeholder="Longitude"
                placeholderTextColor="#888"
                value={form.lng}
                onChangeText={(t) => handleChange("lng", t)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.locationBtn} onPress={getCoordinates}>
            <Icon name="my-location" size={18} color="#fff" />
            <Text style={styles.locationBtnText}>Use My Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapBtn} onPress={openInMaps}>
            <Icon name="map" size={18} color="#333" />
            <Text style={styles.mapBtnText}>Preview in Google Maps</Text>
          </TouchableOpacity>

          <StyledButton onPress={saveSafeZone} disabled={loading}>
            <ButtonText>{editingId ? "Update Safe Zone" : "Save Safe Zone"}</ButtonText>
          </StyledButton>

          <StyledButton onPress={resetForm} disabled={loading}>
            <ButtonText>Cancel</ButtonText>
          </StyledButton>
        </View>
      )}

      <Text style={styles.listHeader}>
        Existing Safe Zones ({safeZones.length})
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.address && <Text style={styles.cardSub}>📍 {item.address}</Text>}
        {item.contact && <Text style={styles.cardSub}>📞 {item.contact}</Text>}
        <Text style={styles.cardSub}>
          🧭 {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}
        </Text>
        {item.capacity > 0 && (
          <Text style={styles.cardSub}>👥 Capacity: {item.capacity}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => editSafeZone(item)} disabled={loading}>
          <Icon name="edit" size={22} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} disabled={loading}>
          <Icon name="delete" size={22} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <StyledContainer>
      <FlatList
        data={safeZones}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() =>
          !loading && (
            <Text style={styles.empty}>No safe zones found. Add your first one!</Text>
          )
        }
      />
    </StyledContainer>
  );
}

const styles = {
  label: { fontWeight: "bold", marginTop: 10, marginBottom: 4 },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  locationBtnText: { color: "#fff", fontWeight: "600" },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    gap: 8,
  },
  mapBtnText: { color: "#333", fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  listHeader: { fontWeight: "bold", fontSize: 20, marginVertical: 15 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#555", marginTop: 2 },
  status: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  empty: { textAlign: "center", marginTop: 30, color: "gray", fontSize: 14 },
};