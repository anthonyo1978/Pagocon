import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMessageStore } from '../state/messageStore';
import { useNotesStore } from '../state/notesStore';
import { useAnnouncementStore } from '../state/announcementStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { chatRooms } = useMessageStore();
  const { completedNotes } = useNotesStore();
  const { announcements, dismissAnnouncement } = useAnnouncementStore();

  const unreadMessages = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);
  const pendingNotes = completedNotes.filter(note => !note.submitted).length;
  const activeAnnouncements = announcements.filter(a => !a.dismissed);

  const FeatureTile = ({ 
    title, 
    icon, 
    description, 
    badge, 
    onPress, 
    color = 'blue' 
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
    badge?: number;
    onPress: () => void;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    };

    return (
      <Pressable
        onPress={onPress}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative"
      >
        {badge !== undefined && badge > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center z-10">
            <Text className="text-white text-xs font-bold">
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
        
        <View className={`w-16 h-16 ${colorClasses[color]} rounded-2xl items-center justify-center mb-4`}>
          <Ionicons name={icon} size={32} color="white" />
        </View>
        
        <Text className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </Text>
        
        <Text className="text-sm text-gray-500 leading-5">
          {description}
        </Text>
        
        <View className="flex-row items-center mt-4">
          <Text className="text-blue-500 font-medium mr-2">Open</Text>
          <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-blue-600 px-6 py-8">
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-white rounded-full items-center justify-center mr-4 shadow-lg">
            <Text className="text-2xl">👤</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              Welcome back, Sarah
            </Text>
          </View>
          <Pressable className="p-2">
            <Ionicons name="notifications-outline" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Organization Announcements */}
        {activeAnnouncements.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              📢 Organization Updates
            </Text>
            {activeAnnouncements.map((announcement) => {
              const typeColors = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', button: 'bg-blue-100' },
                warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', button: 'bg-orange-100' },
                urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', button: 'bg-red-100' },
                celebration: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', button: 'bg-green-100' }
              };
              
              const colors = typeColors[announcement.type];
              
              return (
                <View key={announcement.id} className={`${colors.bg} rounded-2xl p-4 mb-3 ${colors.border}`}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">{announcement.icon}</Text>
                        <Text className={`text-lg font-semibold ${colors.text}`}>
                          {announcement.title}
                        </Text>
                      </View>
                      <Text className={`text-sm ${colors.text} leading-5 mb-3`}>
                        {announcement.message}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(announcement.timestamp).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => dismissAnnouncement(announcement.id)}
                      className={`${colors.button} rounded-full p-2 ml-3`}
                    >
                      <Ionicons name="close" size={16} color="#6B7280" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}



        {/* Personal Notifications */}
        {(unreadMessages > 0 || pendingNotes > 0) && (
          <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person" size={18} color="#6B7280" />
              <Text className="text-base font-medium text-gray-700 ml-2">
                Your Tasks
              </Text>
            </View>
            <View className="space-y-2">
              {unreadMessages > 0 && (
                <Pressable
                  onPress={() => navigation.navigate('Messages' as never)}
                  className="flex-row items-center justify-between bg-white rounded-lg p-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="chatbubble" size={14} color="#3B82F6" />
                    <Text className="text-sm text-gray-700 ml-2">
                      {unreadMessages} new message{unreadMessages > 1 ? 's' : ''} from teams
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#6B7280" />
                </Pressable>
              )}
              {pendingNotes > 0 && (
                <Pressable
                  onPress={() => navigation.navigate('Notes' as never)}
                  className="flex-row items-center justify-between bg-white rounded-lg p-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="document" size={14} color="#10B981" />
                    <Text className="text-sm text-gray-700 ml-2">
                      {pendingNotes} note{pendingNotes > 1 ? 's' : ''} ready to submit
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#6B7280" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Main Features */}
        <View className="space-y-4 mb-8">
          <FeatureTile
            title="Messages"
            icon="chatbubbles"
            description="Chat with your team and support dashboard."
            badge={unreadMessages}
            color="blue"
            onPress={() => navigation.navigate('Messages' as never)}
          />
          
          <FeatureTile
            title="Notes"
            icon="document-text"
            description="Fill out patient forms and incident reports."
            badge={pendingNotes}
            color="green"
            onPress={() => navigation.navigate('Notes' as never)}
          />
          
          <FeatureTile
            title="Requests"
            icon="hand-right"
            description="Submit requests for supplies, maintenance, or additional support."
            badge={0}
            color="purple"
            onPress={() => {/* TODO: Navigate to Requests screen */}}
          />
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}