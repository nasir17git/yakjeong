import axios from 'axios';
import {
  Room,
  CreateRoomRequest,
  Participant,
  CreateParticipantRequest,
  Response,
  CreateResponseRequest,
  OptimalTimeSlot,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Room API
export const roomApi = {
  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    const response = await api.post('/rooms/', roomData);
    return response.data;
  },

  async getRoom(roomId: string): Promise<Room> {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  async updateRoom(roomId: string, roomData: Partial<Room>): Promise<Room> {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  },

  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}`);
  },

  async getOptimalTimes(roomId: string): Promise<OptimalTimeSlot[]> {
    const response = await api.get(`/rooms/${roomId}/optimal-times`);
    return response.data;
  },
};

// Participant API
export const participantApi = {
  async createParticipant(participantData: CreateParticipantRequest): Promise<Participant> {
    const response = await api.post('/participants/', participantData);
    return response.data;
  },

  async getParticipantsByRoom(roomId: string): Promise<Participant[]> {
    const response = await api.get(`/participants/room/${roomId}`);
    return response.data;
  },

  async getParticipant(participantId: string): Promise<Participant> {
    const response = await api.get(`/participants/${participantId}`);
    return response.data;
  },

  async deleteParticipant(participantId: string): Promise<void> {
    await api.delete(`/participants/${participantId}`);
  },
};

// Response API
export const responseApi = {
  async createResponse(responseData: CreateResponseRequest): Promise<Response> {
    const response = await api.post('/responses/', responseData);
    return response.data;
  },

  async getResponsesByParticipant(participantId: string): Promise<Response[]> {
    const response = await api.get(`/responses/participant/${participantId}`);
    return response.data;
  },

  async getResponse(responseId: string): Promise<Response> {
    const response = await api.get(`/responses/${responseId}`);
    return response.data;
  },

  async updateResponse(responseId: string, responseData: { response_data: Record<string, any> }): Promise<Response> {
    const response = await api.put(`/responses/${responseId}`, responseData);
    return response.data;
  },

  async activateResponse(responseId: string): Promise<Response> {
    const response = await api.put(`/responses/${responseId}/activate`);
    return response.data;
  },

  async deleteResponse(responseId: string): Promise<void> {
    await api.delete(`/responses/${responseId}`);
  },
};

export default api;
