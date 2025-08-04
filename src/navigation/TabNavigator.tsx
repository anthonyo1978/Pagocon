import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import NotesScreen from '../screens/NotesScreen';
import RequestsScreen from '../screens/RequestsScreen';
import { useMessageStore } from '../state/messageStore';
import { useNotesStore } from '../state/notesStore';
import { useRequestsStore } from '../state/requestsStore';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { chatRooms } = useMessageStore();
  const { completedNotes } = useNotesStore();
  const { getActiveRequests } = useRequestsStore();
  
  const unreadMessages = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);
  const pendingNotes = completedNotes.filter(note => !note.submitted).length;
  const activeRequests = getActiveRequests().length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Notes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ 
          title: 'Messages',
          tabBarBadge: unreadMessages > 0 ? (unreadMessages > 9 ? '9+' : unreadMessages) : undefined
        }}
      />
      <Tab.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{ 
          title: 'Notes',
          tabBarBadge: pendingNotes > 0 ? (pendingNotes > 9 ? '9+' : pendingNotes) : undefined
        }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsScreen}
        options={{ 
          title: 'Requests',
          tabBarBadge: activeRequests > 0 ? (activeRequests > 9 ? '9+' : activeRequests) : undefined
        }}
      />
    </Tab.Navigator>
  );
}