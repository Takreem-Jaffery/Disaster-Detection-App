import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyledContainer,
  PageTitle,
  StyledButton,
  ButtonText,
  StyledTextInput,
  SubTitle,
} from "./../../constants/styles";
import {
  createPrecaution,
  getPrecautions,
  updatePrecaution,
  deletePrecaution,
} from "./../../services/precautionService";

// Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select...";

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
        <Text style={styles.dropdownText}>{selectedLabel}</Text>
        <Icon name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    value === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    value === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Icon name="check" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const DISASTER_TYPES = [
  { label: "Flood", value: "flood" },
  { label: "Rainfall", value: "rainfall" },
  { label: "Earthquake", value: "earthquake" },
  { label: "Heatwave", value: "heatwave" },
];

const SEVERITY_LEVELS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function CreatePrecautions() {
  const [precautions, setPrecautions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    disasterType: "flood",
    severity: "medium",
    title: "",
    precautionText: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPrecautions();
  }, []);

  const fetchPrecautions = async () => {
    setLoading(true);
    const result = await getPrecautions();
    if (result.success) {
      const transformedData = result.data.map((item) => ({
        id: item._id,
        disasterType: item.disasterType,
        severity: item.severity,
        title: item.title,
        precautionText: item.precautions,
        isActive: item.isActive,
        createdAt: new Date(item.createdAt).toISOString().split("T")[0],
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toISOString().split("T")[0]
          : "",
      }));
      setPrecautions(transformedData);
    } else {
      Alert.alert("Error", result.message || "Failed to fetch precautions");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      disasterType: "flood",
      severity: "medium",
      title: "",
      precautionText: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const savePrecaution = async () => {
    if (!formData.disasterType || !formData.severity || !formData.title || !formData.precautionText) {
      Alert.alert("Validation Error", "All fields are required!");
      return;
    }

    setLoading(true);
    if (editingId) {
      const result = await updatePrecaution(editingId, formData);
      if (result.success) {
        Alert.alert("Success", "Precaution updated successfully");
        await fetchPrecautions();
        resetForm();
      } else {
        Alert.alert("Error", result.message || "Failed to update precaution");
      }
    } else {
      const result = await createPrecaution(formData);
      if (result.success) {
        Alert.alert("Success", "Precaution created successfully");
        await fetchPrecautions();
        resetForm();
      } else {
        Alert.alert("Error", result.message || "Failed to create precaution");
      }
    }
    setLoading(false);
  };

  const editPrecaution = (item) => {
    setFormData({
      disasterType: item.disasterType,
      severity: item.severity,
      title: item.title,
      precautionText: item.precautionText,
      isActive: item.isActive,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeletePrecaution = (id) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this precaution?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          const result = await deletePrecaution(id);
          if (result.success) {
            Alert.alert("Success", "Precaution deleted successfully");
            await fetchPrecautions();
          } else {
            Alert.alert("Error", result.message || "Failed to delete precaution");
          }
          setLoading(false);
        },
      },
    ]);
  };

  const toggleActive = async (id) => {
    const precaution = precautions.find((p) => p.id === id);
    if (!precaution) return;

    setLoading(true);
    const result = await updatePrecaution(id, { ...precaution, isActive: !precaution.isActive });
    if (result.success) {
      await fetchPrecautions();
    } else {
      Alert.alert("Error", result.message || "Failed to toggle status");
    }
    setLoading(false);
  };

  const renderHeader = () => (
    <View>
      <PageTitle style={{ fontSize: 26 }}>Admin Panel</PageTitle>
      <SubTitle style={{ fontSize: 20, marginBottom: 15 }}>
        Create & Manage Precautions
      </SubTitle>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

      {!showForm ? (
        <StyledButton onPress={() => setShowForm(true)} disabled={loading}>
          <ButtonText>Add New Precaution</ButtonText>
        </StyledButton>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <CustomDropdown
            label="Disaster Type"
            value={formData.disasterType}
            options={DISASTER_TYPES}
            onSelect={(val) => setFormData({ ...formData, disasterType: val })}
          />

          <CustomDropdown
            label="Severity"
            value={formData.severity}
            options={SEVERITY_LEVELS}
            onSelect={(val) => setFormData({ ...formData, severity: val })}
          />

          <Text style={styles.label}>Title</Text>
          <StyledTextInput
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter Title"
          />

          <Text style={styles.label}>Precautions</Text>
          <StyledTextInput
            value={formData.precautionText}
            onChangeText={(text) => setFormData({ ...formData, precautionText: text })}
            placeholder="Enter Safety Measures"
            multiline
            style={{ height: 120, textAlignVertical: "top" }}
          />

          <View style={styles.switchRow}>
            <Text>Status (Active):</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(val) => setFormData({ ...formData, isActive: val })}
              trackColor={{ false: "#ccc", true: "#4caf50" }}
            />
          </View>

          <StyledButton onPress={savePrecaution} disabled={loading}>
            <ButtonText>{editingId ? "Update Precaution" : "Save Precaution"}</ButtonText>
          </StyledButton>

          <StyledButton onPress={resetForm} disabled={loading}>
            <ButtonText>Cancel</ButtonText>
          </StyledButton>
        </View>
      )}

      <Text style={styles.listHeader}>Existing Precautions ({precautions.length})</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSub}>{item.disasterType} | Severity: {item.severity}</Text>
        <Text style={styles.cardDate}>
          Created: {item.createdAt} {item.updatedAt ? `| Updated: ${item.updatedAt}` : ""}
        </Text>
        <Text style={[styles.status, { color: item.isActive ? "green" : "red" }]}>
          {item.isActive ? "● Active" : "● Inactive"}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => editPrecaution(item)} style={{ marginRight: 12 }} disabled={loading}>
          <Icon name="edit" size={22} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePrecaution(item.id)} style={{ marginRight: 12 }} disabled={loading}>
          <Icon name="delete" size={22} color="#dc3545" />
        </TouchableOpacity>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleActive(item.id)}
          trackColor={{ false: "#ccc", true: "#4caf50" }}
          disabled={loading}
        />
      </View>
    </View>
  );

  return (
    <StyledContainer>
      <FlatList
        data={precautions}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() =>
          !loading && <Text style={styles.empty}>No precautions found. Add your first precaution!</Text>
        }
      />
    </StyledContainer>
  );
}

const styles = {
  label: { fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fff",
  },
  dropdownText: { fontSize: 16, color: "#333" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxHeight: "60%",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionSelected: { backgroundColor: "#f0f8ff" },
  modalOptionText: { fontSize: 16, color: "#333" },
  modalOptionTextSelected: { color: "#007bff", fontWeight: "600" },
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
  cardSub: { fontSize: 13, color: "#555", textTransform: "capitalize" },
  cardDate: { fontSize: 12, color: "gray", marginTop: 4 },
  status: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  actions: { flexDirection: "row", alignItems: "center" },
  empty: { textAlign: "center", marginTop: 30, color: "gray", fontSize: 14 },
};