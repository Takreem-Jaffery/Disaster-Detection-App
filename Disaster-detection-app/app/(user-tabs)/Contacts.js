import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import {
    PageTitle,
    SubTitle,
    StyledButton,
    ButtonText,
} from "./../../constants/styles"
import { 
    Platform, 
    PermissionsAndroid, 
    View, 
    StyleSheet, 
    Alert, 
    ScrollView, 
    Text, 
    TouchableOpacity,
    ImageBackground,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from "./../../constants/styles";
import API from "../../src/api/api";

const { brand, darkLight, tertiary, primary, secondary } = Colors;

const requestCallPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn(err);
        return false;
    }
}

const makeCall = async (number) => {
    const url = `tel:${number}`;
    if (Platform.OS === "android") {
        const allowed = await requestCallPermission();
        if (!allowed) {
            Alert.alert("Permission denied", "Couldn't make a call without permission.");
            return;
        }
    }
    Linking.openURL(url);
}

const sendSMS = (number) => {
    const url = `sms:${number}`;
    Linking.openURL(url);
}

const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'emergency', label: 'Emergency', icon: 'warning' },
    { id: 'government', label: 'Government', icon: 'business' },
    { id: 'weather', label: 'Weather', icon: 'cloud' },
    { id: 'support', label: 'Support', icon: 'heart' }
];

const Contacts = () => {
    const router = useRouter();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchContacts();
    }, [selectedCategory, searchQuery]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }
            
            const response = await API.get(`/contacts?${params.toString()}`);
            setContacts(response.data.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            Alert.alert('Error', 'Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchContacts();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <>
            <StatusBar style='light' />
            
            {/* Header with Image Background */}
            <View style={styles.headerWrapper}>
                <ImageBackground
                    source={require('./../../assets/images/img2.webp')}
                    style={styles.headerBackground}
                    imageStyle={styles.headerImage}
                >
                    <View style={styles.headerOverlay}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerText}>
                                <PageTitle home={true}>Emergency Contacts</PageTitle>
                                <SubTitle home={true}>
                                    📞 Quick access to help
                                </SubTitle>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* Gradient Background for Content */}
            <LinearGradient
                colors={['#f8f7fc', '#ebe8f5', '#ddd8ee']}
                style={styles.linearGradient}
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color={darkLight} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search contacts..."
                            placeholderTextColor={darkLight}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={darkLight} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Category Filters */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContainer}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat.id && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <Ionicons 
                                name={cat.icon} 
                                size={16} 
                                color={selectedCategory === cat.id ? '#fff' : brand} 
                            />
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat.id && styles.categoryTextActive
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Contacts List */}
                <ScrollView 
                    style={styles.scrollContainer} 
                    contentContainerStyle={styles.scrollContent}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={brand} />
                            <Text style={styles.loadingText}>Loading contacts...</Text>
                        </View>
                    ) : contacts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search" size={48} color={darkLight} />
                            <Text style={styles.emptyText}>No contacts found</Text>
                            <Text style={styles.emptySubtext}>Try a different search or category</Text>
                        </View>
                    ) : (
                        contacts.map((contact) => (
                            <ContactCard
                                key={contact._id}
                                title={contact.title}
                                icon={contact.icon}
                                numbers={contact.numbers}
                                priority={contact.priority}
                                description={contact.description}
                            />
                        ))
                    )}
                </ScrollView>
            </LinearGradient>
        </>
    );
}

const ContactCard = ({ title, icon, numbers = [], priority, description }) => {
    const isHighPriority = priority === 'high';

    return (
        <View style={[styles.card, isHighPriority && styles.highPriorityCard]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, isHighPriority && styles.highPriorityIcon]}>
                    <Ionicons 
                        name={icon} 
                        size={24} 
                        color={isHighPriority ? '#DC2626' : brand} 
                    />
                </View>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    {description && (
                        <Text style={styles.cardDescription}>{description}</Text>
                    )}
                </View>
            </View>

            <View style={styles.actionsContainer}>
                {numbers.map((num, idx) => (
                    <View style={styles.actionRow} key={idx}>
                        <Text style={styles.numberText}>{num.value}</Text>
                        <TouchableOpacity 
                            style={[
                                styles.actionButton, 
                                num.type === 'call' ? styles.callButton : styles.smsButton
                            ]}
                            onPress={() => num.type === 'call' ? makeCall(num.value) : sendSMS(num.value)}
                        >
                            <Ionicons 
                                name={num.type === 'call' ? 'call' : 'chatbubble'} 
                                size={20} 
                                color="#fff" 
                            />
                            <Text style={styles.actionButtonText}>
                                {num.type === 'call' ? 'Call' : 'SMS'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}

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
    highPriorityCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#DC2626',
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
    highPriorityIcon: {
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
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

    // Search Styles
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },

    // Category Styles
    categoryScroll: {
        maxHeight: 50,
    },
    categoryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: brand,
        gap: 6,
    },
    categoryChipActive: {
        backgroundColor: brand,
        borderColor: brand,
    },
    categoryText: {
        fontSize: 13,
        color: brand,
        fontFamily: 'Poppins-SemiBold',
    },
    categoryTextActive: {
        color: '#fff',
    },

    // Loading & Empty States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    emptySubtext: {
        marginTop: 4,
        fontSize: 13,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },

    // Action Styles
    actionsContainer: {
        gap: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f7fc',
        borderRadius: 8,
        padding: 10,
    },
    numberText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
    },
    callButton: {
        backgroundColor: brand,
    },
    smsButton: {
        backgroundColor: '#22C55E',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default Contacts;