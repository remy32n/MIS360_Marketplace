import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

import BrowseScreen from '../screens/shared/BrowseScreen';
import ListingDetailScreen from '../screens/shared/ListingDetailScreen';
import MyListingsScreen from '../screens/org/MyListingsScreen';
import CreateListingScreen from '../screens/org/CreateListingScreen';
import ListingSubmittedScreen from '../screens/org/ListingSubmittedScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();
const BrowseStack = createStackNavigator();
const ListingsStack = createStackNavigator();

function BrowseStackScreen() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerShown: false }}>
      <BrowseStack.Screen name="BrowseMain" component={BrowseScreen} />
      <BrowseStack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </BrowseStack.Navigator>
  );
}

function ListingsStackScreen() {
  return (
    <ListingsStack.Navigator screenOptions={{ headerShown: false }}>
      <ListingsStack.Screen name="MyListingsMain" component={MyListingsScreen} />
      <ListingsStack.Screen name="CreateListing" component={CreateListingScreen} />
      <ListingsStack.Screen name="ListingSubmitted" component={ListingSubmittedScreen} />
      <ListingsStack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </ListingsStack.Navigator>
  );
}

function PostTabButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.postButton}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.postButtonInner}>
        <Ionicons name="add" size={32} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );
}

export default function OrgTabs() {
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
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Browse:       focused ? 'home' : 'home-outline',
            'My Listings':focused ? 'list' : 'list-outline',
            Post:         focused ? 'add-circle' : 'add-circle-outline',
            Notifications:focused ? 'notifications' : 'notifications-outline',
            Profile:      focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Browse" component={BrowseStackScreen} />
      <Tab.Screen name="My Listings" component={ListingsStackScreen} />
      <Tab.Screen
        name="Post"
        component={CreateListingScreen}
        options={{
          tabBarButton: (props) => <PostTabButton {...props} />,
        }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  postButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
});
