import api from './api';

export const generateStudyMaterials = async (content) => {
  try {
    const response = await api.post('/ai/response', { content });
    return response;
  } catch (error) {
    console.error('Error generating study materials:', error);
    throw error;
  }
}; 