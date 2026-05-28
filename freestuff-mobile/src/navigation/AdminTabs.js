import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import ApprovalQueueScreen from '../screens/admin/ApprovalQueueScreen';
import BrowseScreen from '../screens/shared/BrowseScreen';
import ListingDetailScreen from '../screens/shared/ListingDetailScreen';
import ActivityDashboardScreen from '../screens/admin/ActivityDashboardScreen';
import OrgVerificationScreen from '../screens/admin/OrgVerificationScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

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

export default function AdminTabs() {
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
            Pending:  focused ? 'time' : 'time-outline',
            Browse:   focused ? 'home' : 'home-outline',
            Activity: focused ? 'bar-chart' : 'bar-chart-outline',
            Orgs:     focused ? 'shield' : 'shield-outline',
            Profile:  focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pending" component={ApprovalQueueScreen} />
      <Tab.Screen name="Browse" component={BrowseStackScreen} />
      <Tab.Screen name="Activity" component={ActivityDashboardScreen} />
      <Tab.Screen name="Orgs" component={OrgVerificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
