// FILE: app/index.tsx
import { useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { AuthContext } from '../src/context/authContext';

export default function Index() {
  const { user, initializing } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (initializing) return; // Wait until auth check is complete

    // Use setTimeout to ensure navigation happens after mount
    const timeout = setTimeout(() => {
      if (!user) {
        router.replace('/Login');
      } else if (user.role === 'rescue-authority') {
        router.replace('/(admin-tabs)/Home');
      } else {
        router.replace('/(user-tabs)/Home');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [user, initializing]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}