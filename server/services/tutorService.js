const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

class TutorService {
    constructor() {
        if (!process.env.GOOGLE_GEMINI_API) {
            throw new Error('GOOGLE_GEMINI_API key is not configured');
        }
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API);
    }

    async generateAnswer(question, aiContent) {
        try {
            // Use the correct model name
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",  // Changed from gemini-1.0-pro
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            });
            
            if (!model) {
                throw new Error('Failed to initialize Gemini model');
            }

            // Format the prompt with better structure
            const prompt = `
            Context:
            ${aiContent}
            
            Question:
            ${question}
            
            Instructions:
            - Provide a clear and concise answer based on the context
            - Include relevant details from the provided content
            - Stay focused on the specific question`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            if (!response || !response.text()) {
                throw new Error('No response generated from Gemini API');
            }
            
            return response.text();

        } catch (error) {
            console.error('Gemini API Error:', {
                message: error.message,
                details: error.details || 'No additional details',
                status: error.status
            });
            throw new Error(`Failed to generate answer: ${error.message}`);
        }
    }
}

module.exports = new TutorService();