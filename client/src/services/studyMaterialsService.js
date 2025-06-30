import api from './api';

export const generateStudyMaterials = async (content) => {
  try {
    let response;
    console.log("generateStudyMaterials called with:", content);

    // Check if content is FormData (file upload) or regular object (text content)
    if (content instanceof FormData) {
      console.log("Handling file upload");

      // Verify FormData contains the file
      let hasFile = false;
      for (let pair of content.entries()) {
        console.log(`FormData contains: ${pair[0]} = ${pair[1]}`);
        if (pair[0] === 'file') {
          hasFile = true;
        }
      }

      if (!hasFile) {
        console.error("FormData does not contain a file entry");
        throw new Error("No file selected for upload");
      }

      // Use the `/api/upload` route for file uploads
      // Let axios set the correct Content-Type header with boundary automatically
      response = await api.post('/api/upload', content, {
        // Don't set any headers here - the request interceptor will handle this
        // by NOT setting Content-Type for FormData objects
        timeout: 300000, // 5 minutes - increased to handle larger files
      });
    } else if (content.link) {
      console.log("Handling link:", content.link);
      // Use the `/api/link` route for links
      response = await api.post('/api/link', { link: content.link });
    } else if (content.text) {
      console.log("Handling text content");
      // Use the `/api/response` route for text content
      response = await api.post('/api/response', { content: content.text });
    } else {
      throw new Error('Invalid content type. Provide text, link, or file.');
    }

    return response.data;
  } catch (error) {
    console.error('Error generating study materials:', error);

    // Extract more detailed error information if available
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      console.error('Server error details:', errorData);

      // Create a more informative error message
      const errorMessage = errorData.error || errorData.details || error.message;
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.statusCode = error.response.status;
      enhancedError.details = errorData;

      throw enhancedError;
    }

    throw error;
  }
};