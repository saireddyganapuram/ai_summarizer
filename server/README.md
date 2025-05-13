# AI Study Assistant

A full-stack application that helps users transform text into organized study materials using AI.

## Project Structure

```
project/
├── app.js                 # Express server main file
├── routes/                # API routes
│   └── aiRoutes.js        # Routes for AI-related endpoints
├── controllers/           # Request handlers
│   └── aiController.js    # Handlers for AI-related requests
├── services/              # Business logic 
│   └── aiServices.js      # AI processing logic
├── client/                # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       └── ...            # Other React files
└── ...
```

## Features

- Process text input using AI to generate structured study materials
- Display organized content in a tabbed interface
- Includes summaries, key points, flashcards, and quiz questions

## Setup Instructions

### Backend

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the project root with your API keys:
   ```
   PORT=3000
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the server:
   ```
   npm start
   ```

### Frontend

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

The React app will be available at http://localhost:3001 and will proxy API requests to the Express backend at http://localhost:3000.

## API Endpoints

- `POST /ai/response`: Send a text prompt and receive structured study materials

## Technologies Used

- Backend: Node.js, Express
- Frontend: React
- AI: Google Gemini API 