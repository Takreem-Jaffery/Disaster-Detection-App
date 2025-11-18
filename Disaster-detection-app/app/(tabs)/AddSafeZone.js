import React, { useState } from 'react';
import {Linking, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import {
  StyledContainer,
  PageTitle,
} from './../../constants/styles'; 

export default function AddSafeLocationScreen({ navigation }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        contact: "",
        capacity: "",
        lat: "",
        lng: ""
    });

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
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


    const handleSubmit = async () => {
        const token = "YOUR_JWT_TOKEN"; // Replace with stored token (AsyncStorage etc.)

        if (!form.name || !form.lat || !form.lng) {
            return Alert.alert("Missing fields", "Name, lat, and lng are required.");
        }

        try {
            const res = await axios.post("/api/safePlace/create",
                {
                    name: form.name,
                    description: form.description,
                    address: form.address,
                    contact: form.contact,
                    capacity: parseInt(form.capacity) || 0,
                    lat: parseFloat(form.lat),
                    lng: parseFloat(form.lng)
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            Alert.alert("Success", "Safe location added!");
            navigation.goBack();

        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || err.message);
        }
    };

    //preview in google maps
    const openInMaps = () => {
        if (!form.lat || !form.lng) {
            return Alert.alert("Missing coords", "Set lat/lng first.");
        }
        const url = `https://www.google.com/maps?q=${form.lat},${form.lng}`;
        Linking.openURL(url);
    };

    return (
        <StyledContainer>
            <PageTitle>Add Safe Zone</PageTitle>
            <ScrollView style={{ padding: 20 }}>

                <TextInput
                    placeholder="Name"
                    value={form.name}
                    onChangeText={(t) => handleChange("name", t)}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Description"
                    value={form.description}
                    onChangeText={(t) => handleChange("description", t)}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Address"
                    value={form.address}
                    onChangeText={(t) => handleChange("address", t)}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Contact Number"
                    value={form.contact}
                    onChangeText={(t) => handleChange("contact", t)}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Capacity"
                    keyboardType="numeric"
                    value={form.capacity}
                    onChangeText={(t) => handleChange("capacity", t)}
                    style={styles.input}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                    placeholder="Latitude"
                    keyboardType="numeric"
                    value={form.lat}
                    onChangeText={(t) => handleChange("lat", t)}
                    style={[styles.input, { flex: 1 }]}
                    />
                    <TextInput
                    placeholder="Longitude"
                    keyboardType="numeric"
                    value={form.lng}
                    onChangeText={(t) => handleChange("lng", t)}
                    style={[styles.input, { flex: 1 }]}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={getCoordinates}>
                    <Text style={styles.buttonText}>Use My Current Location</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
                    <Text style={styles.mapButtonText}>Preview in Google Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: "#28a745" }]} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Add Safe Location</Text>
                </TouchableOpacity>
            </ScrollView>
        </StyledContainer>
    );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    color:"#333",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600"
  },
  mapButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc"
  },
  mapButtonText: {
    fontWeight: "600",
    color: "#333"
  }
};
