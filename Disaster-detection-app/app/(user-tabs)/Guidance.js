import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PageTitle, SubTitle } from "./../../constants/styles";
import { Colors } from "./../../constants/styles";
import { getPrecautions } from "./../../services/precautionService";

const { brand } = Colors;

// Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label || label;

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
        <Text style={styles.dropdownText} numberOfLines={1}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.modalScroll}>
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
                    <Ionicons name="checkmark" size={20} color={brand} />
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

const getSeverityColor = (severity) => {
  switch(severity) {
    case 'high': return '#DC2626';
    case 'medium': return '#F59E0B';
    case 'low': return '#22C55E';
    default: return '#999';
  }
};

const getSeverityIcon = (severity) => {
  switch(severity) {
    case 'high': return 'alert-circle';
    case 'medium': return 'warning';
    case 'low': return 'checkmark-circle';
    default: return 'information-circle';
  }
};

const getDisasterIcon = (type) => {
  switch(type) {
    case 'flood': return 'water';
    case 'rainfall': return 'rainy';
    case 'earthquake': return 'pulse';
    case 'heatwave': return 'sunny';
    default: return 'alert-circle';
  }
};

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

  const renderCard = (item) => {
    const severityColor = getSeverityColor(item.severity);
    const severityIcon = getSeverityIcon(item.severity);
    const disasterIcon = getDisasterIcon(item.disasterType);

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: `${severityColor}20` }
          ]}>
            <Ionicons 
              name={disasterIcon} 
              size={24} 
              color={severityColor} 
            />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardMeta}>
              <View style={[
                styles.severityBadge,
                { backgroundColor: severityColor }
              ]}>
                <Ionicons name={severityIcon} size={12} color="#fff" />
                <Text style={styles.severityText}>{item.severity}</Text>
              </View>
              <Text style={styles.disasterType}>
                {item.disasterType}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.cardDescription}>{item.precautionText}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Created: {item.createdAt}</Text>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.isActive ? '#22C55E' : '#DC2626' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: item.isActive ? '#22C55E' : '#DC2626' }
            ]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
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
                <PageTitle home={true}>Safety Guidance</PageTitle>
                <SubTitle home={true}>
                  📋 Stay Safe & Prepared
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
          {/* Filters */}
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Ionicons name="filter" size={20} color={brand} />
              <Text style={styles.filterTitle}>Filter Precautions</Text>
            </View>

            <Text style={styles.filterLabel}>Severity Level</Text>
            <CustomDropdown
              label="Severity"
              value={selectedSeverity}
              options={SEVERITY_OPTIONS}
              onSelect={setSelectedSeverity}
            />

            <View style={styles.filterRow}>
              <View style={styles.filterHalf}>
                <Text style={styles.filterLabel}>Disaster Type</Text>
                <CustomDropdown
                  label="Type"
                  value={selectedType}
                  options={TYPE_OPTIONS}
                  onSelect={setSelectedType}
                />
              </View>
              
              <View style={styles.filterHalf}>
                <Text style={styles.filterLabel}>Status</Text>
                <CustomDropdown
                  label="Status"
                  value={selectedStatus}
                  options={STATUS_OPTIONS}
                  onSelect={setSelectedStatus}
                />
              </View>
            </View>

            {(selectedSeverity !== "All" || selectedType !== "All" || selectedStatus !== "All") && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSelectedSeverity("All");
                  setSelectedType("All");
                  setSelectedStatus("All");
                }}
              >
                <Ionicons name="close-circle" size={16} color={brand} />
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredPrecautions.length} precaution{filteredPrecautions.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {/* Loading or List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={brand} />
              <Text style={styles.loadingText}>Loading guidance...</Text>
            </View>
          ) : filteredPrecautions.length > 0 ? (
            filteredPrecautions.map(renderCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>No precautions found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
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

  // Filter Styles
  filterCard: {
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
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterHalf: {
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: brand,
    fontFamily: 'Poppins-SemiBold',
  },

  // Dropdown Styles
  dropdownContainer: {
    marginBottom: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f7fc',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionSelected: {
    backgroundColor: '#f0eef6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  modalOptionTextSelected: {
    color: brand,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Results Header
  resultsHeader: {
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
  },

  // Loading & Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'Poppins-SemiBold',
  },
  disasterType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    fontFamily: 'Poppins-Regular',
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});