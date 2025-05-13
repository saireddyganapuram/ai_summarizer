import api from './api';

export const generateStudyMaterials = async (content) => {
  try {
    // Check if content is FormData (file upload) or regular object (text content)
    if (content instanceof FormData) {
      // If it's FormData, use the upload route
      const response = await api.post('/ai/upload', content, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } else if (content.link) {
      // If it contains a link, use the link route
      const response = await api.post('/ai/link', { link: content.link });
      return response;
    } else {
      // If it's regular content, use the response route
      const response = await api.post('/ai/response', { content: content.text });
      return response;
    }
  } catch (error) {
    console.error('Error generating study materials:', error);
    throw error;
  }
}; 