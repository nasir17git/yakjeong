import { create } from 'zustand';
import { Room, Participant, OptimalTimeSlot } from '../types';

interface AppState {
  // Room state
  currentRoom: Room | null;
  rooms: Room[];
  participants: Participant[];
  optimalTimes: OptimalTimeSlot[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentRoom: (room: Room | null) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  setOptimalTimes: (times: OptimalTimeSlot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentRoom: null,
  rooms: [],
  participants: [],
  optimalTimes: [],
  loading: false,
  error: null,

  // Actions
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => ({ 
    rooms: [...state.rooms, room] 
  })),
  
  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set((state) => ({ 
    participants: [...state.participants, participant] 
  })),
  
  removeParticipant: (participantId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== participantId)
  })),
  
  setOptimalTimes: (times) => set({ optimalTimes: times }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  reset: () => set({
    currentRoom: null,
    rooms: [],
    participants: [],
    optimalTimes: [],
    loading: false,
    error: null,
  }),
}));
