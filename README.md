# 🎓 SnapStudy - AI-Powered Study Materials Generator

## 📋 Overview

**SnapStudy** is an intelligent study companion platform that leverages Google's Gemini AI to transform any educational content into comprehensive, structured study materials. Whether you're studying from PDFs, web articles, or plain text, SnapStudy automatically generates notes, summaries, flashcards, quizzes, and curated learning resources to enhance your learning experience.

Built with modern web technologies, SnapStudy features a sleek, dark-themed interface with real-time AI tutoring capabilities, making it the perfect tool for students, educators, and lifelong learners.

---

## ✨ Key Features

### 🤖 AI-Powered Content Generation
- **Smart Content Processing**: Upload PDFs, Word documents, text files, or paste URLs/text directly
- **Multi-Format Support**: Handles PDF, DOCX, TXT, JPEG, PNG, and web links
- **Intelligent Parsing**: Extracts and processes content from various sources automatically

### 📚 Comprehensive Study Materials
- **AI Notes**: Organized key points, important terms, concepts, and examples
- **AI Summary**: Brief and detailed summaries of the content
- **AI Flashcards**: Basic and advanced flashcards for active recall
- **AI Quizzes**: Multiple-choice and true/false questions with explanations
- **Recommended Courses**: Curated course suggestions from Coursera, edX, Udemy
- **YouTube Resources**: Relevant video tutorials with channel info and duration

### 💬 Interactive AI Tutor
- **Real-time Q&A**: Ask questions about your study materials
- **Context-Aware Responses**: AI tutor understands your generated content
- **Chat History**: Keep track of your learning conversations
- **Smart Scrolling**: Auto-scroll with new message indicators

### 🔐 User Authentication
- **Firebase Authentication**: Secure email/password authentication
- **Protected Routes**: Session-based access control
- **User Profiles**: Personalized experience with profile management
- **Email Verification**: Account verification via email

### 🎨 Modern UI/UX
- **Dark Theme**: Eye-friendly dark mode interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Tab-Based Navigation**: Easy switching between different study materials
- **Session Management**: Multiple study sessions support
- **Loading States**: Clear feedback during AI processing

---

## 🏗️ Project Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Frontend (Vite + React Router)                │   │
│  │  - Landing Page                                      │   │
│  │  - Authentication (Login/Signup)                     │   │
│  │  - Home Dashboard (Protected)                        │   │
│  │  - AI Tutor Chat Interface                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services Layer                                      │   │
│  │  - API Service (Axios)                               │   │
│  │  - Study Materials Service                           │   │
│  │  - Firebase Config                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Backend                                  │   │
│  │  - CORS Middleware                                   │   │
│  │  - Multer (File Upload)                              │   │
│  │  - Error Handling                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes Layer                                        │   │
│  │  - /api/upload (File Processing)                     │   │
│  │  - /api/link (URL Processing)                        │   │
│  │  - /api/response (Text Processing)                   │   │
│  │  - /api/ask (AI Tutor)                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services Layer                                      │   │
│  │  - AI Service (Gemini Integration)                   │   │
│  │  - Tutor Service (Q&A Processing)                    │   │
│  │  - Document Parsers (PDF, DOCX)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕ API Calls
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Google Gemini AI (gemini-1.5-flash)                 │   │
│  │  - Content Analysis                                  │   │
│  │  - Study Materials Generation                        │   │
│  │  - Q&A Processing                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Firebase                                            │   │
│  │  - Authentication                                    │   │
│  │  - Firestore (Database)                              │   │
│  │  - Storage                                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
ENCODED/
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, logos
│   │   ├── components/              # Reusable components
│   │   │   ├── FlashcardDisplay.jsx # Flashcard component
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   └── ProtectedRoute.jsx   # Route protection
│   │   ├── config/
│   │   │   └── firebase.js          # Firebase configuration
│   │   ├── pages/                   # Page components
│   │   │   ├── landing.jsx          # Landing page
│   │   │   ├── login.jsx            # Login page
│   │   │   ├── signup.jsx           # Signup page
│   │   │   └── home.jsx             # Main dashboard
│   │   ├── services/                # API services
│   │   │   ├── api.js               # Axios instance
│   │   │   └── studyMaterialsService.js
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env                         # Environment variables
│   ├── package.json                 # Dependencies
│   ├── vite.config.js               # Vite configuration
│   └── tailwind.config.js           # Tailwind CSS config
│
├── server/                          # Express Backend
│   ├── controllers/
│   │   └── aiController.js          # AI request handlers
│   ├── routes/
│   │   └── aiRoutes.js              # API routes
│   ├── services/
│   │   ├── aiServices.js            # Gemini AI integration
│   │   └── tutorService.js          # AI tutor logic
│   ├── .env                         # Environment variables
│   ├── app.js                       # Express app setup
│   └── package.json                 # Dependencies
│
└── README.md                        # Project documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19.0.0** - UI library
- **Vite 6.3.1** - Build tool and dev server
- **React Router DOM 7.5.2** - Client-side routing
- **Axios 1.9.0** - HTTP client
- **Material-UI (MUI) 7.0.2** - UI components
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **React Icons 5.5.0** - Icon library
- **ECharts 5.6.0** - Data visualization
- **Firebase 11.6.1** - Authentication and backend services

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **Google Generative AI 0.24.0** - Gemini AI SDK
- **Multer 1.4.5** - File upload middleware
- **PDF-Parse 1.1.1** - PDF text extraction
- **Mammoth 1.9.0** - DOCX text extraction
- **Node-Fetch 2.7.0** - HTTP client for Node.js
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 16.5.0** - Environment variable management

### External Services
- **Google Gemini AI** - AI content generation
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - Database (configured)
- **Firebase Storage** - File storage (configured)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- **Firebase Project** ([Create one here](https://console.firebase.google.com/))

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ENCODED
```

#### 2. Setup Backend (Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
# Add the following variables:
GOOGLE_GEMINI_API=your_gemini_api_key_here
PORT=5000
NODE_ENV=development

# Start the server
npm start
```

The server will run on `http://localhost:5000`

#### 3. Setup Frontend (Client)

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Create .env file
# Add the following variable:
REACT_APP_API_URL=http://localhost:5000

# Start the development server
npm run dev
```

The client will run on `http://localhost:5173` (or the port Vite assigns)

---

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
GOOGLE_GEMINI_API=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

### Firebase Configuration
Update `client/src/config/firebase.js` with your Firebase project credentials:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. **Health Check**
```http
GET /
```
**Response:**
```json
{
  "status": "Server is running",
  "routes": {
    "ai": "/api/ask",
    "upload": "/api/upload",
    "link": "/api/link"
  }
}
```

#### 2. **Upload File**
```http
POST /api/upload
Content-Type: multipart/form-data
```
**Request Body:**
- `file`: File (PDF, DOCX, TXT, JPEG, PNG)

**Response:**
```json
{
  "response": "{\"studyMaterials\": {...}}"
}
```

#### 3. **Process Link**
```http
POST /api/link
Content-Type: application/json
```
**Request Body:**
```json
{
  "link": "https://example.com/article"
}
```

**Response:**
```json
{
  "response": "{\"studyMaterials\": {...}}"
}
```

#### 4. **Process Text**
```http
POST /api/response
Content-Type: application/json
```
**Request Body:**
```json
{
  "content": "Your educational text content here"
}
```

**Response:**
```json
{
  "response": "{\"studyMaterials\": {...}}"
}
```

#### 5. **AI Tutor Q&A**
```http
POST /api/ask
Content-Type: application/json
```
**Request Body:**
```json
{
  "question": "What is photosynthesis?",
  "aiContent": "Context from generated study materials"
}
```

**Response:**
```json
{
  "answer": "Photosynthesis is the process..."
}
```

---

## 📖 Usage Guide

### 1. **Sign Up / Login**
- Navigate to the landing page
- Click "Sign Up" to create a new account
- Or "Login" if you already have an account
- Email verification will be sent upon signup

### 2. **Generate Study Materials**

#### Option A: Upload a File
1. Click the "Input" tab
2. Click the paperclip icon to upload a file
3. Select a PDF, DOCX, TXT, or image file
4. Click "Generate" to process

#### Option B: Paste a URL
1. Click the "Input" tab
2. Enter a URL in the link input field
3. Click "Generate" to process

#### Option C: Enter Text
1. Click the "Input" tab
2. Type or paste your text content
3. Click "Generate" to process

### 3. **Explore Study Materials**
After generation, navigate through the tabs:
- **AI Notes**: View key points, terms, and concepts
- **AI Summary**: Read brief and detailed summaries
- **AI Flashcards**: Study with interactive flashcards
- **AI Quizzes**: Test your knowledge
- **Recommended Courses**: Explore related courses
- **YouTube Resources**: Watch relevant videos

### 4. **Use AI Tutor**
- Type your question in the chat input
- The AI tutor will answer based on your study materials
- View chat history and scroll through conversations

### 5. **Manage Sessions**
- Click "New Session" to create a new study session
- Switch between sessions using the session selector
- Each session maintains its own study materials

---

## 🎯 Features in Detail

### AI Content Processing
The platform uses Google's Gemini 1.5 Flash model with a sophisticated system instruction that ensures:
- Structured JSON output
- Minimum 5 flashcards (basic + advanced)
- Minimum 5 quiz questions with explanations
- At least 2-3 recommended courses
- At least 2-3 YouTube videos with metadata

### File Processing
- **PDF**: Uses `pdf-parse` to extract text
- **DOCX**: Uses `mammoth` to extract raw text
- **TXT**: Direct UTF-8 text reading
- **Images**: Placeholder support (can be extended with OCR)
- **Large Files**: Supports files up to 100MB with warnings

### Quiz System
- Multiple-choice and true/false questions
- Answer tracking and scoring
- Detailed explanations for each answer
- Reset functionality

### Flashcard System
- Interactive flip animation
- Navigation between cards
- Basic and advanced difficulty levels
- Progress tracking

---

## 🔒 Security Features

- **Firebase Authentication**: Secure email/password authentication
- **Protected Routes**: Client-side route protection
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Sensitive data stored in .env files
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and user feedback

---

## 🐛 Error Handling

The application includes robust error handling:
- File type validation
- File size warnings (>20MB)
- Network error detection
- Server error messages
- Timeout handling (5-minute timeout for large files)
- User-friendly error messages

---

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark color scheme (#1a202c background)
- **Responsive Design**: Mobile and desktop compatible
- **Loading States**: Clear feedback during processing
- **Smooth Animations**: Flashcard flips, transitions
- **Auto-scroll**: Smart chat scrolling with indicators
- **Profile Menu**: User profile with logout option
- **Session Management**: Visual session indicators

---

## 📝 Development Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server
```bash
npm start        # Start server (production)
npm test         # Run tests (not configured)
```

---

## 🚧 Known Limitations

1. **PowerPoint Files**: Not currently supported
2. **Image OCR**: Images are processed with placeholder text
3. **Large Files**: May take longer to process (>20MB)
4. **Link Processing**: Only supports plain text and HTML content
5. **Session Persistence**: Sessions are not saved to database (in-memory only)

---

## 🔮 Future Enhancements

- [ ] Database integration for session persistence
- [ ] PowerPoint file support
- [ ] OCR for image text extraction
- [ ] Export study materials (PDF, DOCX)
- [ ] Collaborative study sessions
- [ ] Progress tracking and analytics
- [ ] Mobile app (React Native)
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Advanced quiz analytics

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Built with ❤️ by [Your Name]

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful AI capabilities
- **Firebase** for authentication and backend services
- **React** and **Vite** for excellent developer experience
- **Material-UI** and **Tailwind CSS** for beautiful UI components

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub

---

**Happy Learning! 🎓✨**
