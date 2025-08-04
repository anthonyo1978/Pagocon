import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMessageStore, Message } from '../state/messageStore';

const QUICK_EMOJIS = ['😊', '👍', '❤️', '😢', '😂', '🙏', '👋', '✅'];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const { getCurrentMessages, getCurrentChat, addMessage, markAsRead } = useMessageStore();
  const flatListRef = useRef<FlatList>(null);

  const chatId = route.params?.chatId;
  const messages = getCurrentMessages();
  const currentChat = getCurrentChat();

  useEffect(() => {
    if (chatId) {
      markAsRead(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && chatId) {
      addMessage(chatId, newMessage.trim(), true);
      setNewMessage('');
      setShowEmojis(false);
      
      // Simulate responses for different chat types
      if (currentChat) {
        setTimeout(() => {
          let response = '';
          let senderName = '';
          
          switch (currentChat.type) {
            case 'support':
              response = 'Got it! Thanks for the update 👍';
              senderName = 'Admin';
              break;
            case 'team':
            case 'shift':
              const teamResponses = [
                'Thanks for letting us know! 😊',
                'Understood 👍',
                'Copy that! ✅',
                'Good to know 🙂'
              ];
              response = teamResponses[Math.floor(Math.random() * teamResponses.length)];
              senderName = currentChat.participants[Math.floor(Math.random() * (currentChat.participants.length - 1))];
              break;
            case 'emergency':
              response = 'Message received and logged. 🚨';
              senderName = 'Emergency System';
              break;
          }
          
          if (response) {
            addMessage(chatId, response, false, response.match(/[😊👍✅🙂🚨]/)?.[0], senderName);
          }
        }, Math.random() * 2000 + 1000);
      }
    }
  };

  const addEmoji = (emoji: string) => {
    if (newMessage.trim()) {
      addMessage(chatId, `${newMessage.trim()} ${emoji}`, true, emoji);
      setNewMessage('');
    } else {
      addMessage(chatId, emoji, true, emoji);
    }
    setShowEmojis(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowEmojis(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`mx-4 mb-3 ${item.isFromUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          item.isFromUser
            ? 'bg-blue-500 rounded-br-md'
            : 'bg-gray-200 rounded-bl-md'
        }`}
      >
        {!item.isFromUser && item.senderName && (
          <Text className={`text-xs font-medium mb-1 ${item.isFromUser ? 'text-blue-200' : 'text-gray-600'}`}>
            {item.senderName}
          </Text>
        )}
        <Text className={`text-base ${item.isFromUser ? 'text-white' : 'text-gray-800'}`}>
          {item.text}
        </Text>
      </View>
      <Text className="text-xs text-gray-500 mt-1 px-2">
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (!currentChat) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-500">Chat not found</Text>
      </View>
    );
  }

  const getStatusText = () => {
    switch (currentChat.type) {
      case 'support':
        return 'Admin is online ●';
      case 'emergency':
        return 'Emergency channel';
      case 'team':
      case 'shift':
        return `${currentChat.participants.length} members`;
      default:
        return 'Active';
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="bg-blue-500 px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">{currentChat.icon}</Text>
              <View>
                <Text className="text-white text-xl font-semibold">
                  {currentChat.name}
                </Text>
                <Text className="text-blue-100 text-sm">
                  {getStatusText()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <Pressable onPress={dismissKeyboard} className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </Pressable>

      {/* Quick Emoji Bar */}
      {showEmojis && (
        <View className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <FlatList
            data={QUICK_EMOJIS}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => addEmoji(item)}
                className="mr-4 p-2 bg-white rounded-full shadow-sm"
              >
                <Text className="text-2xl">{item}</Text>
              </Pressable>
            )}
            keyExtractor={(item) => item}
          />
        </View>
      )}

      {/* Input Area */}
      <View className="bg-white px-4 py-3 border-t border-gray-200" style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={() => setShowEmojis(!showEmojis)}
            className="p-2"
          >
            <Ionicons 
              name={showEmojis ? "happy" : "happy-outline"} 
              size={24} 
              color="#007AFF" 
            />
          </Pressable>
          
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 px-4 py-3 rounded-full text-base"
            multiline
            maxLength={500}
            onFocus={() => setShowEmojis(false)}
          />
          
          <Pressable 
            onPress={sendMessage}
            className={`p-3 rounded-full ${newMessage.trim() ? 'bg-blue-500' : 'bg-gray-300'}`}
            disabled={!newMessage.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="white" 
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}