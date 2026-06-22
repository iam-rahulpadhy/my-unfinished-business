import apiClient from './apiClient';

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface MilestoneRequest {
  title: string;
  targetDate: string;
  isCompleted: boolean;
}

export const getMilestones = async (): Promise<Milestone[]> => {
  const response = await apiClient.get('/milestones');
  return response.data;
};

export const createMilestone = async (data: MilestoneRequest): Promise<Milestone> => {
  const response = await apiClient.post('/milestones', data);
  return response.data;
};

export const updateMilestone = async (id: string, data: MilestoneRequest): Promise<Milestone> => {
  const response = await apiClient.put(`/milestones/${id}`, data);
  return response.data;
};

export const deleteMilestone = async (id: string): Promise<void> => {
  await apiClient.delete(`/milestones/${id}`);
};
