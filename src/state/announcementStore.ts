import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'celebration';
  icon: string;
  timestamp: Date;
  dismissed: boolean;
}

interface AnnouncementState {
  announcements: Announcement[];
  dismissAnnouncement: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp' | 'dismissed'>) => void;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Weather Alert',
    message: 'Storm expected this afternoon. All outdoor activities cancelled. Please ensure patients stay indoors.',
    type: 'warning',
    icon: '⛈️',
    timestamp: new Date(Date.now() - 1800000), // 30 mins ago
    dismissed: false
  },
  {
    id: '2', 
    title: 'Raffle Update',
    message: 'Raffle ticket sales have closed. Winner will be announced at 5 PM today!',
    type: 'info',
    icon: '🎟️',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    dismissed: false
  }
];

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set, get) => ({
      announcements: mockAnnouncements,
      dismissAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.map(announcement => 
            announcement.id === id ? { ...announcement, dismissed: true } : announcement
          )
        }));
      },
      addAnnouncement: (announcement) => {
        const newAnnouncement: Announcement = {
          ...announcement,
          id: Date.now().toString(),
          timestamp: new Date(),
          dismissed: false,
        };
        set((state) => ({
          announcements: [newAnnouncement, ...state.announcements]
        }));
      },
    }),
    {
      name: 'announcements-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);