import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isFromUser: boolean;
  emoji?: string;
  senderName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'support' | 'team' | 'shift' | 'emergency';
  icon: string;
  description: string;
  lastMessage?: Message;
  unreadCount: number;
  participants: string[];
}

interface MessageState {
  chatRooms: ChatRoom[];
  messages: Record<string, Message[]>; // chatRoomId -> messages
  currentChatId: string | null;
  addMessage: (chatId: string, text: string, isFromUser: boolean, emoji?: string, senderName?: string) => void;
  setCurrentChat: (chatId: string) => void;
  markAsRead: (chatId: string) => void;
  getCurrentMessages: () => Message[];
  getCurrentChat: () => ChatRoom | null;
}

const mockChatRooms: ChatRoom[] = [
  {
    id: 'support-dashboard',
    name: 'Support Dashboard',
    type: 'support',
    icon: '🏥',
    description: 'Direct line to admin support',
    unreadCount: 2,
    participants: ['Admin', 'You']
  },
  {
    id: 'day-shift-team',
    name: 'Day Shift Team',
    type: 'shift',
    icon: '☀️',
    description: '6 members • Day shift coordination',
    unreadCount: 0,
    participants: ['Sarah', 'Mike', 'Lisa', 'Tom', 'Emma', 'You']
  },
  {
    id: 'night-shift-team',
    name: 'Night Shift Team',
    type: 'shift',
    icon: '🌙',
    description: '4 members • Night shift coordination',
    unreadCount: 1,
    participants: ['Alex', 'Maria', 'James', 'You']
  },
  {
    id: 'emergency-alerts',
    name: 'Emergency Alerts',
    type: 'emergency',
    icon: '🚨',
    description: 'Critical updates only',
    unreadCount: 0,
    participants: ['Emergency System', 'All Staff']
  },
  {
    id: 'general-team',
    name: 'General Team Chat',
    type: 'team',
    icon: '💬',
    description: '12 members • General discussions',
    unreadCount: 3,
    participants: ['Everyone']
  }
];

const mockMessages: Record<string, Message[]> = {
  'support-dashboard': [
    {
      id: '1',
      text: 'Hi! I am here to help you today. How are you doing? 😊',
      timestamp: new Date(Date.now() - 3600000),
      isFromUser: false,
      emoji: '😊',
      senderName: 'Admin'
    },
    {
      id: '2', 
      text: 'Hello! Everything is going well today 👍',
      timestamp: new Date(Date.now() - 3000000),
      isFromUser: true,
      emoji: '👍'
    },
    {
      id: '3',
      text: 'Great to hear! Let me know if you need anything.',
      timestamp: new Date(Date.now() - 1800000),
      isFromUser: false,
      senderName: 'Admin'
    }
  ],
  'day-shift-team': [
    {
      id: '4',
      text: 'Good morning everyone! Ready for another great day 🌟',
      timestamp: new Date(Date.now() - 7200000),
      isFromUser: false,
      senderName: 'Sarah'
    },
    {
      id: '5',
      text: 'Morning! Coffee is ready in the break room ☕',
      timestamp: new Date(Date.now() - 6900000),
      isFromUser: false,
      senderName: 'Mike'
    }
  ],
  'night-shift-team': [
    {
      id: '6',
      text: 'Quiet night so far. Patient in room 12 requested extra blanket.',
      timestamp: new Date(Date.now() - 5400000),
      isFromUser: false,
      senderName: 'Alex'
    },
    {
      id: '7',
      text: 'Thanks Alex, I will check on them shortly 👍',
      timestamp: new Date(Date.now() - 3600000),
      isFromUser: false,
      senderName: 'Maria'
    }
  ],
  'general-team': [
    {
      id: '8',
      text: 'Reminder: Staff meeting tomorrow at 2 PM 📅',
      timestamp: new Date(Date.now() - 10800000),
      isFromUser: false,
      senderName: 'Lisa'
    },
    {
      id: '9',
      text: 'Thanks for the reminder! 👍',
      timestamp: new Date(Date.now() - 9000000),
      isFromUser: false,
      senderName: 'Tom'
    },
    {
      id: '10',
      text: 'Will be there! 😊',
      timestamp: new Date(Date.now() - 7200000),
      isFromUser: false,
      senderName: 'Emma'
    }
  ]
};

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      chatRooms: mockChatRooms.map(room => ({
        ...room,
        lastMessage: mockMessages[room.id]?.[mockMessages[room.id].length - 1]
      })),
      messages: mockMessages,
      currentChatId: null,
      addMessage: (chatId: string, text: string, isFromUser: boolean, emoji?: string, senderName?: string) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          timestamp: new Date(),
          isFromUser,
          emoji,
          senderName
        };
        
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage]
          },
          chatRooms: state.chatRooms.map(room => 
            room.id === chatId 
              ? { ...room, lastMessage: newMessage, unreadCount: isFromUser ? room.unreadCount : room.unreadCount + 1 }
              : room
          )
        }));
      },
      setCurrentChat: (chatId: string) => {
        set({ currentChatId: chatId });
      },
      markAsRead: (chatId: string) => {
        set((state) => ({
          chatRooms: state.chatRooms.map(room => 
            room.id === chatId ? { ...room, unreadCount: 0 } : room
          )
        }));
      },
      getCurrentMessages: () => {
        const state = get();
        return state.currentChatId ? state.messages[state.currentChatId] || [] : [];
      },
      getCurrentChat: () => {
        const state = get();
        return state.currentChatId ? state.chatRooms.find(room => room.id === state.currentChatId) || null : null;
      }
    }),
    {
      name: 'messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);