import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import BrowseScreen from '../screens/shared/BrowseScreen';
import ListingDetailScreen from '../screens/shared/ListingDetailScreen';
import SavedScreen from '../screens/student/SavedScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();
const BrowseStack = createStackNavigator();

function BrowseStackScreen() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerShown: false }}>
      <BrowseStack.Screen name="BrowseMain" component={BrowseScreen} />
      <BrowseStack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </BrowseStack.Navigator>
  );
}

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.brand[600],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          borderTopWidth: 1,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Browse: focused ? 'home' : 'home-outline',
            Saved: focused ? 'bookmark' : 'bookmark-outline',
            Notifications: focused ? 'notifications' : 'notifications-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Browse" component={BrowseStackScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
