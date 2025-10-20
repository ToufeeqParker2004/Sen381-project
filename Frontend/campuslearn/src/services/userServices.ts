// services/userServices.ts
import apiClient from '@/services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  bio: string;
  location: string;
  createdAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  phoneNumber: string;
  bio: string;
  location: string;
  password: string;
  createdAt: string; // Add this field
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
}

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/student');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/student/${id}`);
    return response.data;
  },

  createUser: async (userData: CreateUserDTO): Promise<User> => {
    const response = await apiClient.post('/student', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: UpdateUserDTO): Promise<User> => {
    const response = await apiClient.put(`/student/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/student/${id}`);
  },
};