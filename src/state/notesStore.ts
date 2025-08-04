import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NoteTemplate {
  id: string;
  title: string;
  fields: NoteField[];
  icon: string;
}

export interface NoteField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[]; // for select fields
  placeholder?: string;
}

export interface CompletedNote {
  id: string;
  templateId: string;
  templateTitle: string;
  data: Record<string, any>;
  timestamp: Date;
  submitted: boolean;
}

interface NotesState {
  templates: NoteTemplate[];
  completedNotes: CompletedNote[];
  addCompletedNote: (note: Omit<CompletedNote, 'id' | 'timestamp'>) => void;
  submitNote: (noteId: string) => void;
  getTemplate: (id: string) => NoteTemplate | undefined;
}

const mockTemplates: NoteTemplate[] = [
  {
    id: 'patient-check',
    title: 'Patient Check-in',
    icon: '🏥',
    fields: [
      {
        id: 'patient-name',
        label: 'Patient Name',
        type: 'text',
        required: true,
        placeholder: 'Enter patient name'
      },
      {
        id: 'mood',
        label: 'Patient Mood',
        type: 'select',
        required: true,
        options: ['Happy 😊', 'Calm 😌', 'Anxious 😰', 'Sad 😢', 'Angry 😠']
      },
      {
        id: 'vitals-check',
        label: 'Vitals Checked',
        type: 'checkbox',
        required: false
      },
      {
        id: 'notes',
        label: 'Additional Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Any additional observations...'
      }
    ]
  },
  {
    id: 'medication',
    title: 'Medication Log',
    icon: '💊',
    fields: [
      {
        id: 'patient-name',
        label: 'Patient Name',
        type: 'text',
        required: true,
        placeholder: 'Enter patient name'
      },
      {
        id: 'medication',
        label: 'Medication Given',
        type: 'text',
        required: true,
        placeholder: 'Enter medication name'
      },
      {
        id: 'dosage',
        label: 'Dosage',
        type: 'text',
        required: true,
        placeholder: 'e.g., 10mg'
      },
      {
        id: 'time',
        label: 'Time Given',
        type: 'text',
        required: true,
        placeholder: 'e.g., 2:30 PM'
      },
      {
        id: 'reaction',
        label: 'Patient Reaction',
        type: 'select',
        required: false,
        options: ['Normal ✅', 'Mild reaction ⚠️', 'Adverse reaction ❌', 'No reaction observed']
      }
    ]
  },
  {
    id: 'incident',
    title: 'Incident Report',
    icon: '⚠️',
    fields: [
      {
        id: 'incident-type',
        label: 'Incident Type',
        type: 'select',
        required: true,
        options: ['Fall', 'Behavioral Issue', 'Medical Emergency', 'Equipment Malfunction', 'Other']
      },
      {
        id: 'location',
        label: 'Location',
        type: 'text',
        required: true,
        placeholder: 'Where did this occur?'
      },
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Describe what happened in detail...'
      },
      {
        id: 'action-taken',
        label: 'Action Taken',
        type: 'textarea',
        required: true,
        placeholder: 'What steps were taken to address the incident?'
      }
    ]
  }
];

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      templates: mockTemplates,
      completedNotes: [],
      addCompletedNote: (note) => {
        const newNote: CompletedNote = {
          ...note,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        set((state) => ({
          completedNotes: [...state.completedNotes, newNote]
        }));
      },
      submitNote: (noteId) => {
        set((state) => ({
          completedNotes: state.completedNotes.map(note => 
            note.id === noteId ? { ...note, submitted: true } : note
          )
        }));
      },
      getTemplate: (id) => {
        return get().templates.find(template => template.id === id);
      }
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);