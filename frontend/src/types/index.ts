export interface Room {
  id: string;
  title: string;
  description?: string;
  room_type: number; // 1: 시간기준, 2: 블럭기준, 3: 날짜기준
  creator_name: string;
  max_participants?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  participants?: Participant[];
}

export interface CreateRoomRequest {
  title: string;
  description?: string;
  room_type: number;
  creator_name: string;
  max_participants?: number;
  deadline?: string;
}

export interface Participant {
  id: string;
  room_id: string;
  name: string;
  created_at: string;
  responses?: Response[];
}

export interface CreateParticipantRequest {
  room_id: string;
  name: string;
}

export interface Response {
  id: string;
  participant_id: string;
  response_data: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateResponseRequest {
  participant_id: string;
  response_data: Record<string, any>;
}

export interface OptimalTimeSlot {
  time_slot: string;
  available_participants: string[];
  participant_count: number;
  availability_rate: number;
}

export interface TimeSlot {
  hour: number;
  available: boolean;
}

export interface DateSlot {
  date: string;
  available: boolean;
}

export interface BlockSlot {
  date: string;
  time_range: string;
  available: boolean;
}

export const ROOM_TYPES = {
  HOURLY: 1,
  BLOCK: 2,
  DAILY: 3,
} as const;

export const ROOM_TYPE_LABELS = {
  [ROOM_TYPES.HOURLY]: '시간 기준',
  [ROOM_TYPES.BLOCK]: '블럭 기준',
  [ROOM_TYPES.DAILY]: '날짜 기준',
} as const;
