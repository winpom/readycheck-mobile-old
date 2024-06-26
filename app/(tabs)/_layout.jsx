import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-readychecks"
        options={{
          title: 'Active ReadyChecks',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'checkbox-active' : 'checkbox-active-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create a New ReadyCheck',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'check' : 'check-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'user-group' : 'user-group-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends List',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'user-friends' : 'user-friends-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
