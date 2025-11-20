import React, { useContext } from 'react';
import RootLayout from './../_layout'
import UserTabLayout from './user/_layout';
import AdminTabLayout from './admin/_layout';
import { AuthContext } from './../../src/context/authContext'
import { ActivityIndicator, View } from 'react-native';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { user, initializing } = useContext(AuthContext);
  console.log("TabsLayout user role:", user?.role);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (!user) {
    //User not logged in
    return <RootLayout />;
  } 
  
  if (user?.role === 'rescue-authority') {
    return <AdminTabLayout />;
  }

  // default to regular user
  return <UserTabLayout />;
}
