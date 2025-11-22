import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getPrecautions } from "./../../services/precautionService";

// Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label || label;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
        <Text style={styles.dropdownText} numberOfLines={1}>{selectedLabel}</Text>
        <Icon name="arrow-drop-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
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
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const SEVERITY_OPTIONS = [
  { label: "All Severity", value: "All" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "All" },
  { label: "Flood", value: "flood" },
  { label: "Rainfall", value: "rainfall" },
  { label: "Earthquake", value: "earthquake" },
  { label: "Heatwave", value: "heatwave" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function Guidance() {
  const [precautions, setPrecautions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    fetchPrecautions();
  }, []);

  const fetchPrecautions = async () => {
    setLoading(true);
    try {
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
        }));
        setPrecautions(transformedData);
      } else {
        Alert.alert("Error", result.message || "Failed to fetch precautions");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while fetching precautions.");
    }
    setLoading(false);
  };

  const filteredPrecautions = precautions
    .filter((item) => selectedSeverity === "All" || item.severity === selectedSeverity)
    .filter((item) => selectedType === "All" || item.disasterType === selectedType)
    .filter((item) => {
      if (selectedStatus === "All") return true;
      return selectedStatus === "Active" ? item.isActive : !item.isActive;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const severityStyles = {
    high: { color: "#dc3545", icon: "error" },
    medium: { color: "#f59e0b", icon: "warning" },
    low: { color: "#22c55e", icon: "check-circle" },
  };

  const renderCard = (item) => {
    const severity = severityStyles[item.severity] || severityStyles.low;
    return (
      <View
        key={item.id}
        style={[
          styles.card,
          { borderLeftColor: item.isActive ? "#22c55e" : "#999" },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.type}>{item.disasterType}</Text>
          </View>
          <View style={[styles.severityBadge, { borderColor: severity.color }]}>
            <Icon name={severity.icon} size={14} color={severity.color} />
            <Text style={[styles.severityText, { color: severity.color }]}>
              {item.severity}
            </Text>
          </View>
        </View>
        <Text style={styles.text}>{item.precautionText}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.date}>{item.createdAt}</Text>
          <Text style={[styles.status, { color: item.isActive ? "#22c55e" : "#999" }]}>
            {item.isActive ? "● Active" : "● Inactive"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.pageTitle}>Safety Guidance</Text>
        <Text style={styles.subTitle}>Stay Safe & Prepared</Text>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterHeading}>Filter By:</Text>
          <View style={styles.filterRow}>
            <CustomDropdown
              label="Severity"
              value={selectedSeverity}
              options={SEVERITY_OPTIONS}
              onSelect={setSelectedSeverity}
            />
          </View>
          <View style={styles.filterRow}>
            <CustomDropdown
              label="Type"
              value={selectedType}
              options={TYPE_OPTIONS}
              onSelect={setSelectedType}
            />
            <View style={{ width: 8 }} />
            <CustomDropdown
              label="Status"
              value={selectedStatus}
              options={STATUS_OPTIONS}
              onSelect={setSelectedStatus}
            />
          </View>
        </View>

        {/* Results count */}
        <Text style={styles.resultsText}>
          Showing {filteredPrecautions.length} precaution(s)
        </Text>

        {/* Loading or List - Using ScrollView via map instead of FlatList */}
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.listContainer}>
            {filteredPrecautions.length > 0 ? (
              filteredPrecautions.map(renderCard)
            ) : (
              <Text style={styles.empty}>No precautions match your filters.</Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "rgba(121, 106, 198, 1)",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  filterContainer: {
    backgroundColor: "#eaf4ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  filterHeading: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
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
  modalOptionSelected: {
    backgroundColor: "#f0f8ff",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionTextSelected: {
    color: "#007bff",
    fontWeight: "600",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  type: {
    fontSize: 13,
    color: "#666",
    textTransform: "capitalize",
    marginTop: 2,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  status: {
    fontWeight: "600",
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "gray",
    fontSize: 14,
  },
});