import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PetListScreen } from '../screens/pets/PetListScreen';
import { colors, fontSize } from '../theme';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: colors.primary,
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600' as const,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'paw';
          if (route.name === 'PetList') iconName = 'paw';
          else if (route.name === 'Today') iconName = 'today';
          else if (route.name === 'Health') iconName = 'heart';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="PetList"
        component={PetListScreen as any}
        options={{ tabBarLabel: 'Pets' }}
      />
      <Tab.Screen
        name="Today"
        component={PetListScreen as any}
        options={{ tabBarLabel: 'Today / Hoje' }}
      />
      <Tab.Screen
        name="Health"
        component={PetListScreen as any}
        options={{ tabBarLabel: 'Health / Saude' }}
      />
    </Tab.Navigator>
  );
}
