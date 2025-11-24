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
  StyleSheet,
  ImageBackground,
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  PageTitle,
  SubTitle,
  StyledButton,
  ButtonText,
  StyledTextInputSafe,
} from "./../../constants/styles";
import { Colors } from "./../../constants/styles";
import {
  createPrecaution,
  getPrecautions,
  updatePrecaution,
  deletePrecaution,
} from "./../../services/precautionService";

const { brand } = Colors;

// Custom Dropdown Component
const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find(opt => opt.value === value)?.label || "Select...";

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
        <Text style={styles.dropdownText}>{selectedLabel}</Text>
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

const getSeverityColor = (severity) => {
  switch(severity) {
    case 'high': return '#DC2626';
    case 'medium': return '#F59E0B';
    case 'low': return '#22C55E';
    default: return '#999';
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
                <PageTitle home={true}>Safety Precautions</PageTitle>
                <SubTitle home={true}>
                  ⚠️ Manage Disaster Guidelines
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
                <ButtonText>+ Add New Precaution</ButtonText>
              </StyledButton>
            </View>
          )}

          {/* Form */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingId ? "Edit Precaution" : "New Precaution"}
              </Text>

              <CustomDropdown
                label="Disaster Type"
                value={formData.disasterType}
                options={DISASTER_TYPES}
                onSelect={(val) => setFormData({ ...formData, disasterType: val })}
              />

              <CustomDropdown
                label="Severity Level"
                value={formData.severity}
                options={SEVERITY_LEVELS}
                onSelect={(val) => setFormData({ ...formData, severity: val })}
              />

              <Text style={styles.label}>Title *</Text>
              <StyledTextInputSafe
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter precaution title"
              />

              <Text style={styles.label}>Safety Measures *</Text>
              <StyledTextInputSafe
                value={formData.precautionText}
                onChangeText={(text) => setFormData({ ...formData, precautionText: text })}
                placeholder="Enter detailed safety measures and instructions"
                multiline
                style={{ height: 120, textAlignVertical: "top" }}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Status</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                  trackColor={{ false: '#ccc', true: brand }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.formActions}>
                <StyledButton onPress={savePrecaution} disabled={loading}>
                  <ButtonText>{editingId ? "Update" : "Save"}</ButtonText>
                </StyledButton>

                <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Precautions List */}
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>
              Precautions ({precautions.length})
            </Text>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={brand} />
              </View>
            )}

            {!loading && precautions.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>No precautions yet</Text>
                <Text style={styles.emptySubtext}>Add your first safety guideline</Text>
              </View>
            )}

            {precautions.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: `${getSeverityColor(item.severity)}20` }
                  ]}>
                    <Ionicons 
                      name={getDisasterIcon(item.disasterType)} 
                      size={24} 
                      color={getSeverityColor(item.severity)} 
                    />
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.cardMeta}>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(item.severity) }
                      ]}>
                        <Text style={styles.severityText}>{item.severity}</Text>
                      </View>
                      <Text style={styles.disasterType}>
                        {item.disasterType}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={3}>
                  {item.precautionText}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.cardDates}>
                    <Text style={styles.dateText}>
                      Created: {item.createdAt}
                    </Text>
                    {item.updatedAt && (
                      <Text style={styles.dateText}>
                        Updated: {item.updatedAt}
                      </Text>
                    )}
                  </View>
                  
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

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editBtn]}
                    onPress={() => editPrecaution(item)}
                    disabled={loading}
                  >
                    <Ionicons name="create" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteBtn]}
                    onPress={() => handleDeletePrecaution(item.id)}
                    disabled={loading}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      item.isActive ? styles.deactivateBtn : styles.activateBtn
                    ]}
                    onPress={() => toggleActive(item.id)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={item.isActive ? "close-circle" : "checkmark-circle"} 
                      size={18} 
                      color="#fff" 
                    />
                    <Text style={styles.actionButtonText}>
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#f8f7fc',
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
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
    textTransform: 'capitalize',
    fontFamily: 'Poppins-Regular',
  },
  modalOptionTextSelected: {
    color: brand,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
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
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardDates: {
    flex: 1,
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#22C55E',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  activateBtn: {
    backgroundColor: '#22C55E',
  },
  deactivateBtn: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});