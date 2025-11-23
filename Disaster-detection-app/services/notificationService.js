import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications appear when app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Register for push notifications and get token
export async function registerForPushNotifications() {
    let token;

    // Must be a physical device (not simulator)
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#796AC6',
            sound: 'default',
        });
    }

    // Check/request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
    }

    // Get the token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
    } catch (error) {
        console.log('Error getting push token:', error);
    }

    return token;
}

// Send token to your backend (implement this when you have backend)
export async function sendTokenToBackend(token, userId) {
    // TODO: Replace with your actual API endpoint
    /*
    try {
        await fetch('https://your-backend.com/api/save-push-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, userId }),
        });
    } catch (error) {
        console.log('Error saving token:', error);
    }
    */
    console.log('Token to send to backend:', token);
}

// Schedule a local notification (for testing)
export async function sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            sound: 'default',
            data: data,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { seconds: 1 },
    });
}

// Listen for notifications received while app is open
export function addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
}

// Listen for when user taps on notification
export function addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

// Remove listeners
export function removeNotificationSubscription(subscription) {
    Notifications.removeNotificationSubscription(subscription);
}