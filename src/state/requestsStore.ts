import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RequestType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'maintenance' | 'supplies' | 'support' | 'meal' | 'transport' | 'other';
  estimatedTime: string;
  requiresApproval: boolean;
}

export interface SubmittedRequest {
  id: string;
  requestTypeId: string;
  requestTypeName: string;
  icon: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  timestamp: Date;
  estimatedCompletion?: Date;
  assignedTo?: string;
  notes?: string;
  location?: string;
}

interface RequestsState {
  requestTypes: RequestType[];
  submittedRequests: SubmittedRequest[];
  submitRequest: (request: Omit<SubmittedRequest, 'id' | 'timestamp' | 'status'>) => void;
  updateRequestStatus: (requestId: string, status: SubmittedRequest['status'], notes?: string) => void;
  getActiveRequests: () => SubmittedRequest[];
  getCompletedRequests: () => SubmittedRequest[];
}

const mockRequestTypes: RequestType[] = [
  {
    id: 'meal-service',
    name: 'Meal Service',
    description: 'Request special meals, dietary accommodations, or meal delivery',
    icon: '🍽️',
    category: 'meal',
    estimatedTime: '30-60 minutes',
    requiresApproval: false
  },
  {
    id: 'maintenance-repair',
    name: 'Maintenance & Repair',
    description: 'Report broken equipment, plumbing issues, or facility repairs',
    icon: '🔧',
    category: 'maintenance',
    estimatedTime: '2-4 hours',
    requiresApproval: true
  },
  {
    id: 'supply-request',
    name: 'Supply Request',
    description: 'Request medical supplies, cleaning materials, or office supplies',
    icon: '📦',
    category: 'supplies',
    estimatedTime: '1-2 hours',
    requiresApproval: false
  },
  {
    id: 'transport-assistance',
    name: 'Transport Assistance',
    description: 'Request patient transport, wheelchair assistance, or mobility support',
    icon: '🚑',
    category: 'transport',
    estimatedTime: '15-30 minutes',
    requiresApproval: false
  },
  {
    id: 'clinical-support',
    name: 'Clinical Support',
    description: 'Request additional nursing staff or medical assistance',
    icon: '👩‍⚕️',
    category: 'support',
    estimatedTime: '30-45 minutes',
    requiresApproval: true
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Request deep cleaning, laundry service, or room sanitization',
    icon: '🧹',
    category: 'maintenance',
    estimatedTime: '1-2 hours',
    requiresApproval: false
  },
  {
    id: 'it-support',
    name: 'IT Support',
    description: 'Technical issues with computers, tablets, or communication systems',
    icon: '💻',
    category: 'support',
    estimatedTime: '1-3 hours',
    requiresApproval: false
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Request',
    description: 'Medication delivery, prescription refills, or pharmacy consultation',
    icon: '💊',
    category: 'supplies',
    estimatedTime: '45-90 minutes',
    requiresApproval: true
  }
];

const mockSubmittedRequests: SubmittedRequest[] = [
  {
    id: '1',
    requestTypeId: 'meal-service',
    requestTypeName: 'Meal Service',
    icon: '🍽️',
    description: 'Patient in room 12 needs diabetic meal for lunch',
    priority: 'medium',
    status: 'in_progress',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    estimatedCompletion: new Date(Date.now() + 1800000), // 30 mins from now
    assignedTo: 'Kitchen Staff',
    location: 'Room 12'
  },
  {
    id: '2',
    requestTypeId: 'maintenance-repair',
    requestTypeName: 'Maintenance & Repair',
    icon: '🔧',
    description: 'Air conditioning not working in patient room 8',
    priority: 'high',
    status: 'approved',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    assignedTo: 'Maintenance Team',
    location: 'Room 8'
  },
  {
    id: '3',
    requestTypeId: 'supply-request',
    requestTypeName: 'Supply Request',
    icon: '📦',
    description: 'Need additional bed sheets for ward 3',
    priority: 'low',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    assignedTo: 'Supply Team',
    location: 'Ward 3'
  }
];

export const useRequestsStore = create<RequestsState>()(
  persist(
    (set, get) => ({
      requestTypes: mockRequestTypes,
      submittedRequests: mockSubmittedRequests,
      submitRequest: (request) => {
        const newRequest: SubmittedRequest = {
          ...request,
          id: Date.now().toString(),
          timestamp: new Date(),
          status: request.priority === 'urgent' ? 'approved' : 'pending'
        };
        
        set((state) => ({
          submittedRequests: [newRequest, ...state.submittedRequests]
        }));
        
        // Simulate automatic status updates
        setTimeout(() => {
          const currentState = get();
          if (currentState.submittedRequests.find(r => r.id === newRequest.id)) {
            if (newRequest.status === 'pending') {
              get().updateRequestStatus(newRequest.id, 'approved', 'Request has been reviewed and approved');
              
              setTimeout(() => {
                get().updateRequestStatus(newRequest.id, 'in_progress', 'Staff assigned and working on request');
              }, 30000); // 30 seconds later
            }
          }
        }, 10000); // 10 seconds later
      },
      updateRequestStatus: (requestId, status, notes) => {
        set((state) => ({
          submittedRequests: state.submittedRequests.map(request =>
            request.id === requestId
              ? { 
                  ...request, 
                  status, 
                  notes: notes || request.notes,
                  estimatedCompletion: status === 'in_progress' 
                    ? new Date(Date.now() + 3600000) // 1 hour from now
                    : request.estimatedCompletion
                }
              : request
          )
        }));
      },
      getActiveRequests: () => {
        return get().submittedRequests.filter(
          request => !['completed', 'cancelled'].includes(request.status)
        );
      },
      getCompletedRequests: () => {
        return get().submittedRequests.filter(
          request => ['completed', 'cancelled'].includes(request.status)
        );
      }
    }),
    {
      name: 'requests-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);