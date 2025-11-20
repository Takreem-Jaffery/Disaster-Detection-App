import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyledContainer, PageTitle, SubTitle } from './../../../constants/styles';
import { getPrecautions } from "./../../../services/precautionService";

export default function UserPrecautions() {
  const [precautions, setPrecautions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Fetch precautions from backend on mount
  useEffect(() => {
    fetchPrecautions();
  }, []);

  const fetchPrecautions = async () => {
    setLoading(true);
    try {
      const result = await getPrecautions(); // Call your backend service
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
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while fetching precautions.");
    }
    setLoading(false);
  };

  // Filter + Sort
  const filteredPrecautions = precautions
    .filter((item) =>
      selectedSeverity === "All" ? true : item.severity === selectedSeverity
    )
    .filter((item) =>
      selectedType === "All" ? true : item.disasterType === selectedType
    )
    .filter((item) =>
      selectedStatus === "All"
        ? true
        : selectedStatus === "Active"
        ? item.isActive
        : !item.isActive
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Severity mapping
  const severityStyles = {
    high: { color: "red", icon: "error" },
    medium: { color: "orange", icon: "warning" },
    low: { color: "green", icon: "check-circle" },
  };

  return (
    <StyledContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageTitle style={{ fontSize: 26 }}>User Precautions</PageTitle>
        <SubTitle style={{ fontSize: 20, marginBottom: 15 }}>
          Stay Safe & Prepared
        </SubTitle>

        {/* 🔹 Filter Section */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterHeading}>Filter By:</Text>
          <View style={styles.filterRow}>
            {/* Severity */}
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedSeverity}
                onValueChange={(val) => setSelectedSeverity(val)}
              >
                <Picker.Item label="Severity" value="All" />
                <Picker.Item label="High" value="High" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Low" value="Low" />
              </Picker>
            </View>

            {/* Type */}
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedType}
                onValueChange={(val) => setSelectedType(val)}
              >
                <Picker.Item label="Type" value="All" />
                <Picker.Item label="Flood" value="Flood" />
                <Picker.Item label="Rainfall" value="Rainfall" />
                <Picker.Item label="Earthquake" value="Earthquake" />
                <Picker.Item label="Heatwave" value="Heatwave" />
              </Picker>
            </View>

            {/* Status */}
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val)}
              >
                <Picker.Item label="Status" value="All" />
                <Picker.Item label="Active" value="Active" />
                <Picker.Item label="Inactive" value="Inactive" />
              </Picker>
            </View>
          </View>
        </View>

        {/* 🔹 List of Precautions */}
        <FlatList
          data={filteredPrecautions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const severity = severityStyles[item.severity];
            return (
              <View
                style={[
                  styles.card,
                  item.isActive
                    ? { backgroundColor: "#f9fff9" } // light greenish
                    : { backgroundColor: "#f0f0f0" }, // gray for inactive
                ]}
              >
                {/* Header with Title & Severity */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.type}>{item.disasterType}</Text>
                  </View>
                  <View style={styles.severityBadge}>
                    <Icon
                      name={severity.icon}
                      size={18}
                      color={severity.color}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.severityText, { color: severity.color }]}>
                      {item.severity}
                    </Text>
                  </View>
                </View>

                {/* Precaution Text */}
                <Text style={styles.text}>{item.precautionText}</Text>

                {/* Dates */}
                <Text style={styles.date}>
                  Created: {item.createdAt}{" "}
                  {item.updatedAt ? `| Updated: ${item.updatedAt}` : ""}
                </Text>

                {/* Status */}
                <Text
                  style={[
                    styles.status,
                    { color: item.isActive ? "green" : "red" },
                  ]}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </StyledContainer>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: "#eaf4ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  filterHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerBox: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "white",
  },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  type: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#555",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
  },
  status: {
    fontWeight: "bold",
    fontSize: 14,
  },
});