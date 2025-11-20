// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Alert,
//   Switch,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import {
//   StyledContainer,
//   PageTitle,
//   StyledButton,
//   ButtonText,
//   StyledTextInput,
//   SubTitle,
// } from "../../../constants/styles";
// import {
//   createPrecaution,
//   getPrecautions,
//   updatePrecaution,
//   deletePrecaution,
// } from "../../../services/precautionService";

// export default function CreatePrecautions() {
//   const [precautions, setPrecautions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     disasterType: "flood",
//     severity: "medium",
//     title: "",
//     precautionText: "",
//     isActive: true,
//   });

//   // Fetch precautions on component mount
//   useEffect(() => {
//     fetchPrecautions();
//   }, []);

//   const fetchPrecautions = async () => {
//     setLoading(true);
//     const result = await getPrecautions();
//     if (result.success) {
//       // Transform backend data to frontend format
//       const transformedData = result.data.map((item) => ({
//         id: item._id,
//         disasterType: item.disasterType,
//         severity: item.severity,
//         title: item.title,
//         precautionText: item.precautions,
//         isActive: item.isActive,
//         createdAt: new Date(item.createdAt).toISOString().split("T")[0],
//         updatedAt: item.updatedAt
//           ? new Date(item.updatedAt).toISOString().split("T")[0]
//           : "",
//         userId: item.userId,
//       }));
//       setPrecautions(transformedData);
//     } else {
//       Alert.alert("Error", result.message || "Failed to fetch precautions");
//     }
//     setLoading(false);
//   };

//   const resetForm = () => {
//     setFormData({
//       disasterType: "flood",
//       severity: "medium",
//       title: "",
//       precautionText: "",
//       isActive: true,
//     });
//     setEditingId(null);
//     setShowForm(false);
//   };

//   const savePrecaution = async () => {
//     if (
//       !formData.disasterType ||
//       !formData.severity ||
//       !formData.title ||
//       !formData.precautionText
//     ) {
//       Alert.alert("Validation Error", "All fields are required!");
//       return;
//     }

//     setLoading(true);

//     if (editingId) {
//       // Update existing
//       const result = await updatePrecaution(editingId, formData);
//       if (result.success) {
//         Alert.alert("Success", "Precaution updated successfully");
//         await fetchPrecautions(); // Refresh list
//         resetForm();
//       } else {
//         Alert.alert("Error", result.message || "Failed to update precaution");
//       }
//     } else {
//       // Add new
//       const result = await createPrecaution(formData);
//       if (result.success) {
//         Alert.alert("Success", "Precaution created successfully");
//         await fetchPrecautions(); // Refresh list
//         resetForm();
//       } else {
//         Alert.alert("Error", result.message || "Failed to create precaution");
//       }
//     }

//     setLoading(false);
//   };

//   const editPrecaution = (item) => {
//     setFormData({
//       disasterType: item.disasterType,
//       severity: item.severity,
//       title: item.title,
//       precautionText: item.precautionText,
//       isActive: item.isActive,
//     });
//     setEditingId(item.id);
//     setShowForm(true);
//   };

//   const handleDeletePrecaution = (id) => {
//     Alert.alert(
//       "Confirm Deletion",
//       "Are you sure you want to delete this precaution?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             setLoading(true);
//             const result = await deletePrecaution(id);
//             if (result.success) {
//               Alert.alert("Success", "Precaution deleted successfully");
//               await fetchPrecautions();
//             } else {
//               Alert.alert("Error", result.message || "Failed to delete precaution");
//             }
//             setLoading(false);
//           },
//         },
//       ]
//     );
//   };

//   const toggleActive = async (id) => {
//     const precaution = precautions.find((p) => p.id === id);
//     if (!precaution) return;

//     const updatedData = {
//       ...precaution,
//       isActive: !precaution.isActive,
//     };

//     setLoading(true);
//     const result = await updatePrecaution(id, updatedData);
//     if (result.success) {
//       await fetchPrecautions(); // Refresh list
//     } else {
//       Alert.alert("Error", result.message || "Failed to toggle status");
//     }
//     setLoading(false);
//   };

//   return (
//     <StyledContainer>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <PageTitle style={{ fontSize: 26 }}>Admin Panel</PageTitle>
//         <SubTitle style={{ fontSize: 20, marginBottom: 15 }}>
//           Create & Manage Precautions
//         </SubTitle>

//         {loading && (
//           <ActivityIndicator
//             size="large"
//             color="#0000ff"
//             style={{ marginVertical: 20 }}
//           />
//         )}

//         {!showForm ? (
//           <StyledButton onPress={() => setShowForm(true)} disabled={loading}>
//             <ButtonText>Add New Precaution</ButtonText>
//           </StyledButton>
//         ) : (
//           <View style={{ marginBottom: 20 }}>
//             <Text style={{ fontWeight: "bold", marginTop: 10 }}>
//               Disaster Type
//             </Text>
//             <View
//               style={{
//                 borderWidth: 1,
//                 borderColor: "#ccc",
//                 borderRadius: 8,
//                 marginVertical: 6,
//               }}
//             >
//               <Picker
//                 selectedValue={formData.disasterType}
//                 onValueChange={(val) =>
//                   setFormData({ ...formData, disasterType: val })
//                 }
//               >
//                 <Picker.Item label="Flood" value="flood" />
//                 <Picker.Item label="Rainfall" value="rainfall" />
//                 <Picker.Item label="Earthquake" value="earthquake" />
//                 <Picker.Item label="Heatwave" value="heatwave" />
//               </Picker>
//             </View>

//             <Text style={{ fontWeight: "bold", marginTop: 10 }}>Severity</Text>
//             <View
//               style={{
//                 borderWidth: 1,
//                 borderColor: "#ccc",
//                 borderRadius: 8,
//                 marginVertical: 6,
//               }}
//             >
//               <Picker
//                 selectedValue={formData.severity}
//                 onValueChange={(val) =>
//                   setFormData({ ...formData, severity: val })
//                 }
//               >
//                 <Picker.Item label="High" value="high" />
//                 <Picker.Item label="Medium" value="medium" />
//                 <Picker.Item label="Low" value="low" />
//               </Picker>
//             </View>

//             <Text style={{ fontWeight: "bold", marginTop: 10 }}>Title</Text>
//             <StyledTextInput
//               value={formData.title}
//               onChangeText={(text) =>
//                 setFormData({ ...formData, title: text })
//               }
//               placeholder="Enter Title"
//             />

//             <Text style={{ fontWeight: "bold", marginTop: 10 }}>
//               Precautions
//             </Text>
//             <StyledTextInput
//               value={formData.precautionText}
//               onChangeText={(text) =>
//                 setFormData({ ...formData, precautionText: text })
//               }
//               placeholder="Enter Safety Measures"
//               multiline
//               style={{ height: 120, textAlignVertical: "top" }}
//             />

//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginTop: 10,
//               }}
//             >
//               <Text>Status (Active): </Text>
//               <Switch
//                 value={formData.isActive}
//                 onValueChange={(val) =>
//                   setFormData({ ...formData, isActive: val })
//                 }
//               />
//             </View>

//             <StyledButton onPress={savePrecaution} disabled={loading}>
//               <ButtonText>
//                 {editingId ? "Update Precaution" : "Save Precaution"}
//               </ButtonText>
//             </StyledButton>

//             <StyledButton onPress={resetForm} disabled={loading}>
//               <ButtonText>Cancel</ButtonText>
//             </StyledButton>
//           </View>
//         )}

//         <Text style={{ fontWeight: "bold", fontSize: 20, marginVertical: 10 }}>
//           Existing Precautions
//         </Text>

//         <FlatList
//           data={precautions}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: 12,
//                 borderBottomWidth: 1,
//                 borderColor: "#ddd",
//                 backgroundColor: "#fafafa",
//                 borderRadius: 8,
//                 marginBottom: 8,
//               }}
//             >
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//                   {item.title}
//                 </Text>
//                 <Text style={{ textTransform: "capitalize" }}>
//                   {item.disasterType} | Severity: {item.severity}
//                 </Text>
//                 <Text style={{ fontSize: 12, color: "gray" }}>
//                   Created: {item.createdAt}{" "}
//                   {item.updatedAt ? `| Updated: ${item.updatedAt}` : ""}
//                 </Text>
//                 <Text
//                   style={{
//                     fontSize: 13,
//                     marginTop: 4,
//                     fontWeight: "600",
//                     color: item.isActive ? "green" : "red",
//                   }}
//                 >
//                   {item.isActive ? "Active" : "Inactive"}
//                 </Text>
//               </View>

//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <TouchableOpacity
//                   onPress={() => editPrecaution(item)}
//                   style={{ marginRight: 12 }}
//                   disabled={loading}
//                 >
//                   <Icon name="edit" size={22} color="blue" />
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={() => handleDeletePrecaution(item.id)}
//                   style={{ marginRight: 12 }}
//                   disabled={loading}
//                 >
//                   <Icon name="delete" size={22} color="red" />
//                 </TouchableOpacity>

//                 <Switch
//                   value={item.isActive}
//                   onValueChange={() => toggleActive(item.id)}
//                   trackColor={{ false: "#ccc", true: "#4caf50" }}
//                   thumbColor={item.isActive ? "#fff" : "#f4f3f4"}
//                   disabled={loading}
//                 />
//               </View>
//             </View>
//           )}
//         />
//       </ScrollView>
//     </StyledContainer>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyledContainer,
  PageTitle,
  StyledButton,
  ButtonText,
  StyledTextInput,
  SubTitle,
} from "./../../../constants/styles"
import {
  createPrecaution,
  getPrecautions,
  updatePrecaution,
  deletePrecaution,
} from "./../../../services/precautionService"

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

  // Fetch precautions on component mount
  useEffect(() => {
    checkToken();
    fetchPrecautions();
  }, []);

  // Debug: Check if token exists
  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('Token:', token ? 'EXISTS' : 'MISSING');
  };

  const fetchPrecautions = async () => {
    console.log('Fetching precautions...');
    setLoading(true);
    const result = await getPrecautions();
    console.log('📦 Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('Success! Data count:', result.data.length);
      // Transform backend data to frontend format
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
        userId: item.userId,
      }));
      setPrecautions(transformedData);
    } else {
      console.log('Error:', result.message);
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
    if (
      !formData.disasterType ||
      !formData.severity ||
      !formData.title ||
      !formData.precautionText
    ) {
      Alert.alert("Validation Error", "All fields are required!");
      return;
    }

    setLoading(true);

    if (editingId) {
      // Update existing
      const result = await updatePrecaution(editingId, formData);
      if (result.success) {
        Alert.alert("Success", "Precaution updated successfully");
        await fetchPrecautions(); // Refresh list
        resetForm();
      } else {
        Alert.alert("Error", result.message || "Failed to update precaution");
      }
    } else {
      // Add new
      const result = await createPrecaution(formData);
      if (result.success) {
        Alert.alert("Success", "Precaution created successfully");
        await fetchPrecautions(); // Refresh list
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
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this precaution?",
      [
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
      ]
    );
  };

  const toggleActive = async (id) => {
    const precaution = precautions.find((p) => p.id === id);
    if (!precaution) return;

    const updatedData = {
      ...precaution,
      isActive: !precaution.isActive,
    };

    setLoading(true);
    const result = await updatePrecaution(id, updatedData);
    if (result.success) {
      await fetchPrecautions(); // Refresh list
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

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginVertical: 20 }}
        />
      )}

      {!showForm ? (
        <StyledButton onPress={() => setShowForm(true)} disabled={loading}>
          <ButtonText>Add New Precaution</ButtonText>
        </StyledButton>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Disaster Type
          </Text>
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
              <Picker.Item label="Flood" value="flood" />
              <Picker.Item label="Rainfall" value="rainfall" />
              <Picker.Item label="Earthquake" value="earthquake" />
              <Picker.Item label="Heatwave" value="heatwave" />
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
              onValueChange={(val) =>
                setFormData({ ...formData, severity: val })
              }
            >
              <Picker.Item label="High" value="high" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Low" value="low" />
            </Picker>
          </View>

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>Title</Text>
          <StyledTextInput
            value={formData.title}
            onChangeText={(text) =>
              setFormData({ ...formData, title: text })
            }
            placeholder="Enter Title"
          />

          <Text style={{ fontWeight: "bold", marginTop: 10 }}>
            Precautions
          </Text>
          <StyledTextInput
            value={formData.precautionText}
            onChangeText={(text) =>
              setFormData({ ...formData, precautionText: text })
            }
            placeholder="Enter Safety Measures"
            multiline
            style={{ height: 120, textAlignVertical: "top" }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text>Status (Active): </Text>
            <Switch
              value={formData.isActive}
              onValueChange={(val) =>
                setFormData({ ...formData, isActive: val })
              }
            />
          </View>

          <StyledButton onPress={savePrecaution} disabled={loading}>
            <ButtonText>
              {editingId ? "Update Precaution" : "Save Precaution"}
            </ButtonText>
          </StyledButton>

          <StyledButton onPress={resetForm} disabled={loading}>
            <ButtonText>Cancel</ButtonText>
          </StyledButton>
        </View>
      )}

      <Text style={{ fontWeight: "bold", fontSize: 20, marginVertical: 10 }}>
        Existing Precautions ({precautions.length})
      </Text>
    </View>
  );

  return (
    <StyledContainer>
      <FlatList
        data={precautions}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
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
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {item.title}
              </Text>
              <Text style={{ textTransform: "capitalize" }}>
                {item.disasterType} | Severity: {item.severity}
              </Text>
              <Text style={{ fontSize: 12, color: "gray" }}>
                Created: {item.createdAt}{" "}
                {item.updatedAt ? `| Updated: ${item.updatedAt}` : ""}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  marginTop: 4,
                  fontWeight: "600",
                  color: item.isActive ? "green" : "red",
                }}
              >
                {item.isActive ? "Active" : "Inactive"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => editPrecaution(item)}
                style={{ marginRight: 12 }}
                disabled={loading}
              >
                <Icon name="edit" size={22} color="blue" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeletePrecaution(item.id)}
                style={{ marginRight: 12 }}
                disabled={loading}
              >
                <Icon name="delete" size={22} color="red" />
              </TouchableOpacity>

              <Switch
                value={item.isActive}
                onValueChange={() => toggleActive(item.id)}
                trackColor={{ false: "#ccc", true: "#4caf50" }}
                thumbColor={item.isActive ? "#fff" : "#f4f3f4"}
                disabled={loading}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          !loading && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
              No precautions found. Add your first precaution!
            </Text>
          )
        )}
      />
    </StyledContainer>
  );
}