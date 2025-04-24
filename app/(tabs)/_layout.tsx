import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

export default function _layout() {
  return (
    <Tabs screenOptions={{
        headerShown: false,
      }}>
        {/* <Tabs.Screen name="tracking" options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({color})=><Ionicons name="home" size={24} color={color} />
        }}/> */}
        {/* <Tabs.Screen name="bins" options={{                    
            tabBarLabel: 'Bin Details',
            tabBarIcon: ({color})=><Ionicons name="trash-bin-outline" size={24} color={color} />
        }}/> */}
        {/* <Tabs.Screen name="profile" options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({color})=><Ionicons name="people-circle" size={24} color={color} />
        }}/> */}
    </Tabs>
  )
}