import React from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMessageStore, ChatRoom } from '../state/messageStore';

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { chatRooms, setCurrentChat } = useMessageStore();

  const openChat = (chatRoom: ChatRoom) => {
    setCurrentChat(chatRoom.id);
    navigation.navigate('ChatScreen' as never, { chatId: chatRoom.id } as never);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support': return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'emergency': return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'shift': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'team': return { bg: 'bg-purple-100', text: 'text-purple-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const colors = getTypeColor(item.type);
    const lastMessageTime = item.lastMessage 
      ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <Pressable
        onPress={() => openChat(item)}
        className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100"
      >
        <View className="flex-row items-center">
          <View className={`w-12 h-12 ${colors.bg} rounded-xl items-center justify-center mr-4`}>
            <Text className="text-2xl">{item.icon}</Text>
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-lg font-semibold text-gray-800">
                {item.name}
              </Text>
              <View className="flex-row items-center">
                {lastMessageTime && (
                  <Text className="text-xs text-gray-500 mr-2">
                    {lastMessageTime}
                  </Text>
                )}
                {item.unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {item.unreadCount > 9 ? '9+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text className="text-sm text-gray-500 mb-2">
              {item.description}
            </Text>
            
            {item.lastMessage && (
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {item.lastMessage.senderName && !item.lastMessage.isFromUser 
                  ? `${item.lastMessage.senderName}: ` 
                  : item.lastMessage.isFromUser ? 'You: ' : ''
                }
                {item.lastMessage.text}
              </Text>
            )}
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#007AFF" className="ml-2" />
        </View>
      </Pressable>
    );
  };

  const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Messages</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {totalUnread > 0 
            ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`
            : 'All caught up!'
          }
        </Text>
      </View>

      {/* Chat Rooms */}
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        className="flex-1 pt-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="mx-4 mt-12 p-8 bg-white rounded-xl items-center">
            <Text className="text-6xl mb-4">💬</Text>
            <Text className="text-lg font-medium text-gray-800 text-center">
              No conversations yet
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Your chats will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}