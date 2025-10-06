import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  StyledContainer,
  PageTitle,
  StyledButton,
  ButtonText,
  StyledTextInput,
  SubTitle,
} from "../constants/styles";

export default function CreatePrecautions() {
  const [precautions, setPrecautions] = useState([
    {
      id: 1,
      disasterType: "Flood",
      severity: "High",
      title: "Flash Flood Warning",
      precautionText: "Move to higher ground, avoid walking in water",
      isActive: true,
      createdAt: "2025-10-01",
      updatedAt: "",
    },
    {
      id: 2,
      disasterType: "Rainfall",
      severity: "Medium",
      title: "Heavy Rain Alert",
      precautionText: "Secure outdoor items, avoid unnecessary travel",
      isActive: false,
      createdAt: "2025-09-28",
      updatedAt: "2025-09-29",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    disasterType: "Flood",
    severity: "Medium",
    title: "",
    precautionText: "",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  });

  const resetForm = () => {
    setFormData({
      disasterType: "Flood",
      severity: "Medium",
      title: "",
      precautionText: "",
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const savePrecaution = () => {
    if (!formData.disasterType || !formData.severity || !formData.title || !formData.precautionText) {
      Alert.alert("Validation Error", "All fields are required!");
      return;
    }

    if (editingId) {
      // Update existing
      setPrecautions((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...formData,
                id: editingId,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : p
        )
      );
    } else {
      // Add new
      setPrecautions((prev) => [
        ...prev,
        {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    resetForm();
  };

  const editPrecaution = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const deletePrecaution = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this precaution?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setPrecautions((prev) => prev.filter((p) => p.id !== id)),
      },
    ]);
  };

  const toggleActive = (id) => {
    setPrecautions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isActive: !p.isActive,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
  };

  return (
    <StyledContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle style={{ fontSize: 26 }}>Admin Panel</PageTitle>
        <SubTitle style={{ fontSize: 20, marginBottom: 15 }}>
          Create & Manage Precautions
        </SubTitle>

        {!showForm ? (
          <StyledButton onPress={() => setShowForm(true)}>
            <ButtonText>Add New Precaution</ButtonText>
          </StyledButton>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Disaster Type</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                marginVertical: 6,
              }}
            >
              <Picker
                selectedValue={formData.disasterType}
                onValueChange={(val) =>
                  setFormData({ ...formData, disasterType: val })
                }
              >
                <Picker.Item label="Flood" value="Flood" />
                <Picker.Item label="Rainfall" value="Rainfall" />
                <Picker.Item label="Earthquake" value="Earthquake" />
                <Picker.Item label="Heatwave" value="Heatwave" />
              </Picker>
            </View>

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Severity</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                marginVertical: 6,
              }}
            >
              <Picker
                selectedValue={formData.severity}
                onValueChange={(val) => setFormData({ ...formData, severity: val })}
              >
                <Picker.Item label="High" value="High" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Low" value="Low" />
              </Picker>
            </View>

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Title</Text>
            <StyledTextInput
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter Title"
            />

            <Text style={{ fontWeight: "bold", marginTop: 10 }}>Precautions</Text>
            <StyledTextInput
              value={formData.precautionText}
              onChangeText={(text) =>
                setFormData({ ...formData, precautionText: text })
              }
              placeholder="Enter Safety Measures"
              multiline
              style={{
                height: 120,
                textAlignVertical: "top",
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <Text>Status (Active): </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(val) => setFormData({ ...formData, isActive: val })}
              />
            </View>

            <StyledButton onPress={savePrecaution}>
              <ButtonText>{editingId ? "Update Precaution" : "Save Precaution"}</ButtonText>
            </StyledButton>

            <StyledButton onPress={resetForm}>
              <ButtonText>Cancel</ButtonText>
            </StyledButton>
          </View>
        )}

        <Text style={{ fontWeight: "bold", fontSize: 20, marginVertical: 10 }}>
          Existing Precautions
        </Text>
        <FlatList
        data={precautions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
            <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderBottomWidth: 1,
                borderColor: "#ddd",
                backgroundColor: "#fafafa",
                borderRadius: 8,
                marginBottom: 8,
            }}
            >
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.title}</Text>
                <Text>{item.disasterType} | Severity: {item.severity}</Text>
                <Text style={{ fontSize: 12, color: "gray" }}>
                Created: {item.createdAt}{" "}
                {item.updatedAt ? `| Updated: ${item.updatedAt}` : ""}
                </Text>

                {/* 🔹 Status Text */}
                <Text style={{ fontSize: 13, marginTop: 4, fontWeight: "600", color: item.isActive ? "green" : "red" }}>
                {item.isActive ? "Active" : "Inactive"}
                </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => editPrecaution(item)} style={{ marginRight: 12 }}>
                <Icon name="edit" size={22} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePrecaution(item.id)} style={{ marginRight: 12 }}>
                <Icon name="delete" size={22} color="red" />
                </TouchableOpacity>
                <Switch
                value={item.isActive}
                onValueChange={() => toggleActive(item.id)}
                trackColor={{ false: "#ccc", true: "#4caf50" }}
                thumbColor={item.isActive ? "#fff" : "#f4f3f4"}
                />
            </View>
            </View>
        )}
        />
      </ScrollView>
    </StyledContainer>
  );
}
