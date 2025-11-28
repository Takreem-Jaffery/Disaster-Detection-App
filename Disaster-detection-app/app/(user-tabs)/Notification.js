import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
    InnerContainer,
    PageTitle,
    SubTitle,
    HomeContainer,
    Colors
} from "./../../constants/styles";
import { 
    View, 
    StyleSheet, 
    Text, 
    FlatList, 
    TouchableOpacity
} from 'react-native';

const { primary, secondary, tertiary, darkLight, brand } = Colors;

// Dummy notifications - replace with backend data later
const DUMMY_NOTIFICATIONS = [
    {
        id: '1',
        name: 'Safety Alert',
        description: 'You have entered a safe zone near City Hospital.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
    },
    {
        id: '2',
        name: 'Emergency Contact Added',
        description: 'John Doe has been added as your emergency contact.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
    },
    {
        id: '3',
        name: 'Location Shared',
        description: 'Your location was shared with your emergency contacts.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: '4',
        name: 'App Update Available',
        description: 'A new version of the app is available. Update now for better safety features.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: '5',
        name: 'Weekly Safety Report',
        description: 'Your weekly safety report is ready. Tap to view your activity summary.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
];

const Notification = () => {
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
    const [filter, setFilter] = useState('all');
    const router = useRouter();

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const handleNotificationPress = (notification) => {
        setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
    };

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getFilteredNotifications = () => {
        let filtered = [...notifications];
        
        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.isRead);
        } else if (filter === 'read') {
            filtered = filtered.filter(n => n.isRead);
        }
        
        return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const renderNotification = ({ item }) => (
        <View>
            <TouchableOpacity 
                style={[
                    styles.notificationCard,
                    { backgroundColor: item.isRead ? primary : tertiary },
                    !item.isRead && styles.unreadBorder
                ]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={styles.notificationHeader}>
                    <Text style={styles.notificationName}>{item.name}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationDesc}>{item.description}</Text>
                <View style={styles.timeRow}>
                    <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
                    <Text style={styles.notificationDateTime}>{formatDateTime(item.timestamp)}</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.separator} />
        </View>
    );

    return (
        <>
            <StatusBar style='dark' />
            <InnerContainer>
                <HomeContainer style={{ paddingTop: 40 }}>
                    <View style={styles.headerRow}>
                        <PageTitle home={true} style={{ color: secondary }}>Notifications</PageTitle>
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    <SubTitle home={true} style={{ color: darkLight, paddingBottom:10 }}>Stay updated with alerts</SubTitle>

                    <View style={styles.filterContainer}>
                        <TouchableOpacity 
                            style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
                            onPress={() => setFilter('all')}
                        >
                            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.filterBtn, filter === 'unread' && styles.filterActive]}
                            onPress={() => setFilter('unread')}
                        >
                            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>Unread</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.filterBtn, filter === 'read' && styles.filterActive]}
                            onPress={() => setFilter('read')}
                        >
                            <Text style={[styles.filterText, filter === 'read' && styles.filterTextActive]}>Read</Text>
                        </TouchableOpacity>
                    </View>

                    {unreadCount > 0 && (
                        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                            <Text style={styles.markAllText}>Mark all as read</Text>
                        </TouchableOpacity>
                    )}

                    <FlatList
                        data={getFilteredNotifications()}
                        renderItem={renderNotification}
                        keyExtractor={item => item.id}
                        style={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No notifications</Text>
                            </View>
                        }
                    />

                </HomeContainer>
            </InnerContainer>
        </>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    badge: {
        backgroundColor: brand,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 10,
        
    },
    badgeText: {
        color: primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 15,
    },
    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: tertiary,
    },
    filterActive: {
        backgroundColor: brand,
    },
    filterText: {
        color: secondary,
    },
    filterTextActive: {
        color: primary,
        fontWeight: 'bold',
    },
    markAllBtn: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    markAllText: {
        color: brand,
        fontSize: 14,
    },
    list: {
        width: '100%',
        flex: 1,
    },
    notificationCard: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginVertical: 6,
    },
    unreadBorder: {
        borderLeftWidth: 4,
        borderLeftColor: brand,
    },
    notificationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: secondary,
    },
    notificationDesc: {
        fontSize: 14,
        color: darkLight,
        marginTop: 5,
    },
    notificationTime: {
        fontSize: 12,
        color: brand,
        marginTop: 8,
    },
    notificationDateTime: {
        fontSize: 11,
        color: darkLight,
        marginTop: 8,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: brand,
    },
    separator: {
        height: 1,
        backgroundColor: tertiary,
        marginVertical: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        color: darkLight,
        fontSize: 16,
    },
});

export default Notification;