import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FiChevronRight, FiEdit2, FiPlus, FiSend, FiPaperclip, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { generateStudyMaterials } from '../services/studyMaterialsService';
import FlashcardDisplay from '../components/FlashcardDisplay';
import logo from '../assets/logo.png';
import api from '../services/api';
import { logout } from '../config/firebase';

const TABS = [
  'AI Notes',
  'AI Summary',
  'AI Flashcards',
  'AI Quizzes',
  'Recommended Courses',
  'YouTube Resources',
];

const ALL_TABS = ['Input', ...TABS];

// Helper to create a new session object
const createEmptySession = () => ({
  notesContent: {
    key_points: [],
    important_terms: [],
    concepts_explained: [],
    examples: []
  },
  summaryContent: null,
  flashcardsContent: [],
  quizzesContent: [],
  recommendedCourses: [],
  youtubeResources: [],
  inputLink: '',
  uploadedFiles: [],
});

const Home = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Input');
  const [sessions, setSessions] = useState([createEmptySession()]);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [inputContent, setInputContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState({ correct: 0, total: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const [question, setQuestion] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const chatContainerRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Get current session data
  const currentSession = sessions[currentSessionIdx];

  // Add welcome message when component mounts
  React.useEffect(() => {
    // Only add welcome message if chat is empty
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          type: 'ai',
          content: "👋 Hi there! I'm your AI Tutor. I can help answer questions about the study materials you generate. What would you like to know?"
        }
      ]);
    }
  }, []);

  // Auto-scroll chat to bottom when new messages are added with smooth scrolling
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  }, [chatHistory]);

  // Handle scroll events in the chat container
  React.useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      // Show scroll button when user has scrolled up more than 100px from bottom
      const isScrolledUp = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    // Initial check
    handleScroll();

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Add a scroll indicator when new messages arrive
  React.useEffect(() => {
    if (chatHistory.length > 0) {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
          // Check if user is already at the bottom
          const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight <= 100;

          // If not at bottom, show the scroll button and increment new message count
          if (!isAtBottom) {
            setShowScrollButton(true);
            setNewMessageCount(prev => prev + 1);
          } else {
            // If at bottom, scroll to the new message and reset count
            scrollToBottom();
            setNewMessageCount(0);
          }
        }
      }, 100);
    }
  }, [chatHistory.length]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
      setNewMessageCount(0); // Reset new message count when scrolling to bottom
    }
  };

  // Reset quiz state when switching to AI Quizzes tab or session
  React.useEffect(() => {
    if (activeTab === 'AI Quizzes') {
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizResult({ correct: 0, total: 0 });
    }
  }, [activeTab, currentSessionIdx]);

  // Redirect to login if not authenticated and set current user
  React.useEffect(() => {
    const auth = getAuth();

    // Check if we have a persisted auth state in localStorage
    const persistedAuth = localStorage.getItem('authUser');

    // If we have persisted auth, set the current user from it
    if (persistedAuth) {
      try {
        const userData = JSON.parse(persistedAuth);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing persisted auth:', error);
      }
    }

    // Set up the Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If no Firebase user but we have persisted state, don't navigate away
        // This prevents logout on page refresh while Firebase is initializing
        if (!persistedAuth) {
          navigate('/login');
        }
      } else {
        // User is signed in, update the persisted state and current user
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User'
        };

        localStorage.setItem('authUser', JSON.stringify(userData));
        setCurrentUser(userData);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle clicks outside the profile menu
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(prev => !prev);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false);
      const result = await logout();
      if (result.error) {
        console.error('Logout error:', result.error);
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleFileChange = (e) => {
    console.log("File input changed");

    // Check if files were selected
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No files selected");
      return;
    }

    const files = Array.from(e.target.files);
    console.log("Selected files:", files.map(f => f.name));

    // Validate file types
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    // Log file types for debugging
    files.forEach(file => {
      console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
    });

    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      const errorMsg = `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}`;
      console.error(errorMsg);
      setGenerationError(errorMsg);
      return;
    }

    // Check for large files and show a warning
    const LARGE_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    const largeFiles = files.filter(file => file.size > LARGE_FILE_SIZE);

    if (largeFiles.length > 0) {
      // Show warning but still allow the upload
      const warningMsg = `Warning: Large file(s) detected (${largeFiles.map(f => f.name).join(', ')}). Processing may take longer than usual.`;
      console.warn(warningMsg);
      setGenerationError(warningMsg);
    } else {
      // Clear any previous error
      setGenerationError(null);
    }

    // Clear any previous text input or link
    setInputContent('');

    setSessions(prev => {
      const updated = [...prev];
      updated[currentSessionIdx] = {
        ...updated[currentSessionIdx],
        uploadedFiles: files,
        inputLink: '', // Clear link when file is selected
      };
      console.log("Updated session with files:", files.map(f => f.name));
      return updated;
    });
  };

  const handleInputLinkChange = (e) => {
    console.log("Link input changed:", e.target.value);
    setSessions(prev => {
      const updated = [...prev];
      updated[currentSessionIdx] = {
        ...updated[currentSessionIdx],
        inputLink: e.target.value,
      };
      console.log("Updated session with link:", e.target.value);
      return updated;
    });
  };

  // New Session: add a new session and switch to it
  const handleNewSession = () => {
    setSessions(prev => [...prev, createEmptySession()]);
    setCurrentSessionIdx(sessions.length); // switch to new session
    setActiveTab('AI Notes');
  };

  // Add navigation handlers
  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < currentSession.flashcardsContent.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  // Inside handleSubmit, make sure the flashcards are properly processed
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError(null);
    setLoading(true);

    try {
      let response;

      // Handle file upload
      if (currentSession.uploadedFiles.length > 0) {
        const file = currentSession.uploadedFiles[0];
        console.log("Processing file upload:", file.name, "Size:", file.size, "Type:", file.type);

        // Create a new FormData instance
        const formData = new FormData();

        // The field name 'file' must match what the server expects in upload.single("file")
        formData.append('file', file);

        // Log FormData contents for debugging
        console.log("FormData entries:");
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        // Make sure the file is actually in the FormData
        if (formData.has('file')) {
          console.log("File is in FormData");
        } else {
          console.error("File is NOT in FormData");
        }

        response = await generateStudyMaterials(formData);
      }
      // Handle link
      else if (currentSession.inputLink.trim()) {
        console.log("Processing link:", currentSession.inputLink.trim());
        response = await generateStudyMaterials({ link: currentSession.inputLink.trim() });
      }
      // Handle text content
      else if (inputContent.trim()) {
        console.log("Processing text content");
        response = await generateStudyMaterials({ text: inputContent.trim() });
      } else {
        throw new Error('Please provide some content (text, link, or file) to generate study materials.');
      }

      console.log("Raw response:", response.data);

      // Parse the response
      let studyMaterials;
      try {
        // Log the entire response for debugging
        console.log("Full response object:", response);

        // Extract the response data - handle both possible structures
        let responseData;

        // Case 1: Direct response object (no data property)
        if (response.response && typeof response.response === 'string') {
          responseData = response.response;
        }
        // Case 2: Response with data.response property
        else if (response.data && response.data.response) {
          responseData = response.data.response;
        }
        // Case 3: Response with direct data property
        else if (response.data) {
          responseData = response.data;
        }
        // No valid response structure found
        else {
          throw new Error('Invalid response structure');
        }

        console.log("Response data:", responseData);

        // Add validation for response format
        if (!responseData) {
          throw new Error('Empty response from server');
        }

        // Process the response data
        let parsedData;

        // If responseData is already an object
        if (typeof responseData === 'object' && responseData !== null) {
          parsedData = responseData;
        }
        // If responseData is a string (most likely case based on logs)
        else if (typeof responseData === 'string') {
          // Remove markdown code block markers if present
          const cleanedStr = responseData.replace(/```json\n|\n```/g, '');
          console.log("Cleaned JSON string:", cleanedStr);

          try {
            parsedData = JSON.parse(cleanedStr);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid JSON response from server');
          }
        }
        // Unexpected type
        else {
          throw new Error(`Unexpected response data type: ${typeof responseData}`);
        }

        // Validate the structure of parsedData
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('Invalid response format: Expected an object');
        }

        studyMaterials = parsedData.studyMaterials;
        if (!studyMaterials || typeof studyMaterials !== 'object') {
          throw new Error('Invalid response format: Missing or invalid study materials');
        }
      } catch (error) {
        console.error('Failed to parse response:', error);
        throw new Error(`Invalid response format: ${error.message}`);
      }

      if (!studyMaterials) {
        console.error('No study materials found in parsed data');
        throw new Error('Invalid response from server: Missing study materials');
      }

      // Create new session with the generated materials
      const newSession = {
        ...currentSession,
        notesContent: {
          key_points: [],
          important_terms: [],
          concepts_explained: [],
          examples: []
        },
        summaryContent: null,
        flashcardsContent: [],
        quizzesContent: [],
        recommendedCourses: [],
        youtubeResources: []
      };

      // Process Short Notes
      if (studyMaterials.shortNotes) {
        newSession.notesContent = {
          key_points: studyMaterials.shortNotes.key_points || [],
          important_terms: studyMaterials.shortNotes.important_terms || [],
          concepts_explained: studyMaterials.shortNotes.concepts_explained || [],
          examples: studyMaterials.shortNotes.examples || []
        };
      }

      // Process Summary
      if (studyMaterials.summary) {
        newSession.summaryContent = {
          brief: studyMaterials.summary.brief || 'No brief summary available',
          detailed: studyMaterials.summary.detailed || 'No detailed summary available'
        };
      }

      // Process Flashcards
      if (studyMaterials.flashcards) {
        const allFlashcards = [
          ...(studyMaterials.flashcards.basic || []),
          ...(studyMaterials.flashcards.advanced || [])
        ];

        newSession.flashcardsContent = allFlashcards.map(card => ({
          front: card.front || 'No question available',
          back: card.back || 'No answer available'
        }));
      }

      // Process Quiz Questions
      if (studyMaterials.quizQuestions) {
        const allQuizzes = [
          ...(studyMaterials.quizQuestions.multipleChoice || []).map(q => ({
            question: q.question,
            options: Object.values(q.options || {}),
            answer: Object.keys(q.options || {}).indexOf(q.correctAnswer),
            explanation: q.explanation
          })),
          ...(studyMaterials.quizQuestions.trueFalse || []).map(q => ({
            question: q.question,
            options: ['True', 'False'],
            answer: q.correctAnswer ? 0 : 1,
            explanation: q.explanation
          }))
        ];

        newSession.quizzesContent = allQuizzes;
      }

      // Process Resources
      if (studyMaterials.resources) {
        newSession.recommendedCourses = studyMaterials.resources.recommendedCourses || [];
        newSession.youtubeResources = (studyMaterials.resources.youtubeLinks || []).map(link => ({
          title: link.title || 'Untitled Video',
          channel: link.channel || 'Unknown Channel',
          url: link.url || '#',
          duration: link.duration || 'Unknown Duration'
        }));
      }

      // Update the session
      const updatedSessions = [...sessions];
      updatedSessions[currentSessionIdx] = newSession;
      setSessions(updatedSessions);

      // Reset states
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
      setActiveTab('AI Notes'); // Switch to AI Notes tab after successful generation

    } catch (error) {
      console.error('Error generating materials:', error);

      let errorMessage;
      if (error.name === 'AxiosError' && error.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. The server might be busy, please try again.';
      } else if (error.name === 'AxiosError' && error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Could not connect to the server. Please check your internet connection.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error: The AI service is currently experiencing issues. Please try again later.';
      } else if (error.response?.status === 400) {
        // Handle specific 400 Bad Request errors
        const serverError = error.response.data?.error;
        if (serverError) {
          if (serverError.includes('Unsupported file type')) {
            errorMessage = 'This file type is not supported. Please upload a PDF, DOC, TXT, or image file.';
          } else if (serverError.includes('PowerPoint files are not currently supported')) {
            errorMessage = 'PowerPoint files are not currently supported. Please convert to PDF or extract text.';
          } else if (serverError.includes('Failed to extract content')) {
            errorMessage = 'Could not extract content from this file. The file may be corrupted or password-protected.';
          } else if (serverError.includes('No file uploaded')) {
            errorMessage = 'No file was received by the server. Please try uploading again.';
          } else {
            // Use the server's error message directly
            errorMessage = serverError;
          }
        } else {
          errorMessage = 'Invalid request. Please check your input and try again.';
        }
      } else {
        errorMessage = error.message || 'Failed to generate materials. Please try again.';
      }

      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  // Handle quiz answer selection
  const handleQuizAnswerSelect = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (!currentSession.quizzesContent || currentSession.quizzesContent.length === 0) return;

    let correct = 0;
    let total = currentSession.quizzesContent.length;

    currentSession.quizzesContent.forEach((quiz, index) => {
      if (quizAnswers[index] === quiz.answer) {
        correct++;
      }
    });

    setQuizResult({ correct, total });
    setQuizSubmitted(true);
  };

  // Reset quiz state
  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult({ correct: 0, total: 0 });
  };

  // Add a function to handle card flipping
  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Function to check if we have generated content to use for the AI tutor
  const hasGeneratedContent = () => {
    return (currentSession.notesContent &&
      (currentSession.notesContent.key_points.length > 0 ||
       currentSession.notesContent.important_terms.length > 0 ||
       currentSession.notesContent.concepts_explained.length > 0)) ||
    currentSession.summaryContent ||
    (currentSession.flashcardsContent && currentSession.flashcardsContent.length > 0);
  };

   const handleAskTutor = async (e) => {
  e.preventDefault();
  if (!question.trim()) return;

  const currentQuestion = question.trim();
  setTutorLoading(true);
  setTutorError(null);

  // Add user question to chat history immediately
  const newMessage = { type: 'user', content: currentQuestion };
  setChatHistory(prev => [...prev, newMessage]);

  // Clear the input field
  setQuestion('');

  try {
    // Create a comprehensive context from the generated study materials
    let aiContext = '';

    // Use the hasGeneratedContent function to check if we have study materials
    if (hasGeneratedContent()) {
      // Add summary if available
      if (currentSession.summaryContent) {
        if (typeof currentSession.summaryContent === 'string') {
          aiContext += `Summary: ${currentSession.summaryContent}\n\n`;
        } else {
          aiContext += `Brief Summary: ${currentSession.summaryContent.brief || ''}\n`;
          aiContext += `Detailed Summary: ${currentSession.summaryContent.detailed || ''}\n\n`;
        }
      }

      // Add key points if available
      if (currentSession.notesContent && currentSession.notesContent.key_points.length > 0) {
        aiContext += "Key Points:\n";
        currentSession.notesContent.key_points.forEach((point, idx) => {
          aiContext += `${idx + 1}. ${point}\n`;
        });
        aiContext += '\n';
      }

      // Add important terms if available
      if (currentSession.notesContent && currentSession.notesContent.important_terms.length > 0) {
        aiContext += "Important Terms:\n";
        currentSession.notesContent.important_terms.forEach((term, idx) => {
          aiContext += `${idx + 1}. ${term}\n`;
        });
        aiContext += '\n';
      }

      // Add concepts if available
      if (currentSession.notesContent && currentSession.notesContent.concepts_explained.length > 0) {
        aiContext += "Concepts Explained:\n";
        currentSession.notesContent.concepts_explained.forEach((concept, idx) => {
          aiContext += `${idx + 1}. ${concept}\n`;
        });
        aiContext += '\n';
      }

      // Add flashcards if available
      if (currentSession.flashcardsContent && currentSession.flashcardsContent.length > 0) {
        aiContext += "Flashcards:\n";
        currentSession.flashcardsContent.forEach((card, idx) => {
          aiContext += `Q${idx + 1}: ${card.front}\nA${idx + 1}: ${card.back}\n`;
        });
        aiContext += '\n';
      }
    } else {
      // If no generated content, use the raw input
      aiContext = inputContent || 'No context available. Please generate study materials first.';
    }

    const response = await api.post('/api/ask', {
      question: currentQuestion,
      aiContent: aiContext,
    });

    const aiResponse = response.data.answer;

    // Add AI response to chat history
    setChatHistory(prev => [...prev, { type: 'ai', content: aiResponse }]);
  } catch (error) {
    console.error('Error asking AI Tutor:', error);
    setTutorError('Failed to get a response from the AI Tutor.');

    // Add error message to chat history
    setChatHistory(prev => [...prev, {
      type: 'system',
      content: 'Sorry, I encountered an error while processing your request.'
    }]);
  } finally {
    setTutorLoading(false);
  }
};


  // Add this new function after handleFileChange
  const handleClearInput = () => {
    setInputContent('');
    setSessions(prev => {
      const updated = [...prev];
      updated[currentSessionIdx] = {
        ...updated[currentSessionIdx],
        inputLink: '',
        uploadedFiles: [],
      };
      return updated;
    });
    setGenerationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render dynamic content for the left column
  const renderTabContent = () => {
    console.log('Current session:', currentSession);
    console.log('Active tab:', activeTab);

    if (loading) {
      return <div className="text-gray-400 text-center py-8">Loading...</div>;
    }

    if (activeTab === 'AI Notes') {
      console.log('Rendering AI Notes with content:', currentSession.notesContent);
      if (!currentSession.notesContent ||
          (!currentSession.notesContent.key_points || currentSession.notesContent.key_points.length === 0) &&
          (!currentSession.notesContent.important_terms || currentSession.notesContent.important_terms.length === 0) &&
          (!currentSession.notesContent.concepts_explained || currentSession.notesContent.concepts_explained.length === 0) &&
          (!currentSession.notesContent.examples || currentSession.notesContent.examples.length === 0)) {
        return <div className="text-gray-400 text-center py-8">No notes available. Generate some content first!</div>;
      }

      return (
        <div className="bg-[#232b3b] border border-blue-900 rounded-lg p-4 h-[520px] flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-white">AI Notes</h3>
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Key Points Section */}
            {currentSession.notesContent.key_points && currentSession.notesContent.key_points.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Key Points</h4>
                <ul className="list-disc ml-6 text-gray-200 space-y-2">
                  {currentSession.notesContent.key_points.map((point, idx) => (
                    <li key={idx} className="bg-[#2d3748] p-3 rounded-lg">{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Terms Section */}
            {currentSession.notesContent.important_terms && currentSession.notesContent.important_terms.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Important Terms</h4>
                <ul className="list-disc ml-6 text-gray-200 space-y-2">
                  {currentSession.notesContent.important_terms.map((term, idx) => (
                    <li key={idx} className="bg-[#2d3748] p-3 rounded-lg">{term}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concepts Explained Section */}
            {currentSession.notesContent.concepts_explained && currentSession.notesContent.concepts_explained.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Concepts Explained</h4>
                <ul className="list-disc ml-6 text-gray-200 space-y-2">
                  {currentSession.notesContent.concepts_explained.map((concept, idx) => (
                    <li key={idx} className="bg-[#2d3748] p-3 rounded-lg">{concept}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples Section */}
            {currentSession.notesContent.examples && currentSession.notesContent.examples.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Examples</h4>
                <ul className="list-disc ml-6 text-gray-200 space-y-2">
                  {currentSession.notesContent.examples.map((example, idx) => (
                    <li key={idx} className="bg-[#2d3748] p-3 rounded-lg">{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'AI Summary') {
      console.log('Rendering AI Summary with content:', currentSession.summaryContent);
      if (!currentSession.summaryContent) {
        return <div className="text-gray-400 text-center py-8">No summary available. Generate some content first!</div>;
      }

      // Handle if summaryContent is a string (for backward compatibility) or an object
      let brief = '';
      let detailed = '';

      if (typeof currentSession.summaryContent === 'string') {
        detailed = currentSession.summaryContent;
      } else if (typeof currentSession.summaryContent === 'object') {
        brief = currentSession.summaryContent.brief || 'No brief summary available';
        detailed = currentSession.summaryContent.detailed || 'No detailed summary available';
      }

      return (
        <div className="bg-[#232b3b] border border-blue-900 rounded-lg p-4 h-[520px] flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-white">AI Summary</h3>
          <div className="text-gray-200 space-y-6 overflow-y-auto flex-1">
            <div>
              <h4 className="font-semibold mb-2 text-blue-400">Brief Summary</h4>
              <p className="text-gray-300 bg-[#2d3748] p-4 rounded-lg">
                {brief}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-400">Detailed Summary</h4>
              <p className="text-gray-300 bg-[#2d3748] p-4 rounded-lg">
                {detailed}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'AI Flashcards') {
      if (!currentSession.flashcardsContent || currentSession.flashcardsContent.length === 0) {
        return <div className="text-gray-400 text-center py-8">No flashcards available. Generate some content first!</div>;
      }

      return (
        <FlashcardDisplay
          flashcards={currentSession.flashcardsContent}
          currentIndex={currentFlashcardIndex}
          onPrevious={handlePrevFlashcard}
          onNext={(idx) => {
            // If idx is provided, go to that specific card
            if (typeof idx === 'number') {
              setCurrentFlashcardIndex(idx);
            } else {
              // Otherwise just go to next card
              handleNextFlashcard();
            }
          }}
          onFlip={handleCardFlip}
          isFlipped={isFlipped}
        />
      );
    }

    if (activeTab === 'AI Quizzes') {
      if (!currentSession.quizzesContent || currentSession.quizzesContent.length === 0) {
        return <div className="text-gray-400 text-center py-8">No quizzes available. Generate some content first!</div>;
      }

      console.log('Quiz content:', currentSession.quizzesContent);

      return (
        <div className="bg-[#232b3b] border border-blue-900 rounded-lg p-4 h-[520px] flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-white flex justify-between items-center">
            <span>AI Quizzes</span>
            {quizSubmitted && (
              <span className="text-base bg-blue-900 px-3 py-1 rounded-lg">
                Score: {quizResult.correct}/{quizResult.total} ({Math.round(quizResult.correct / quizResult.total * 100)}%)
              </span>
            )}
          </h3>
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {currentSession.quizzesContent.map((quiz, index) => (
              <div key={index} className={`border rounded-lg p-4 ${
                quizSubmitted
                  ? quizAnswers[index] === quiz.answer
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-red-500 bg-red-900/20'
                  : 'border-gray-700'
              }`}>
                <h4 className="text-lg font-semibold text-white mb-3">{quiz.question}</h4>
                <div className="space-y-2">
                  {quiz.options && Array.isArray(quiz.options) && quiz.options.map((option, optIdx) => (
                    <div key={optIdx} className={`flex items-center p-2 rounded ${
                      quizSubmitted && optIdx === quiz.answer ? 'bg-green-900/30' :
                      quizSubmitted && quizAnswers[index] === optIdx && quizAnswers[index] !== quiz.answer ? 'bg-red-900/30' :
                      ''
                    }`}>
                      <input
                        type="radio"
                        name={`quiz-${index}`}
                        id={`quiz-${index}-${optIdx}`}
                        className="mr-2"
                        checked={quizAnswers[index] === optIdx}
                        onChange={() => handleQuizAnswerSelect(index, optIdx)}
                        disabled={quizSubmitted}
                      />
                      <label htmlFor={`quiz-${index}-${optIdx}`} className={`text-gray-200 ${
                        quizSubmitted && optIdx === quiz.answer ? 'font-bold text-green-400' : ''
                      }`}>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {quizSubmitted && quiz.explanation && (
                  <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800 rounded">
                    <p className="text-sm text-blue-300">
                      <span className="font-bold">Explanation:</span> {quiz.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < currentSession.quizzesContent.length}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-semibold text-lg shadow-lg"
              >
                Submit Answers
              </button>
            ) : (
              <button
                onClick={handleQuizReset}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg shadow-lg"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'Recommended Courses') {
      if (!currentSession.recommendedCourses || currentSession.recommendedCourses.length === 0) {
        return <div className="text-gray-400 text-center py-8">No courses available. Generate some content first!</div>;
      }

      console.log('Courses content:', currentSession.recommendedCourses);

      return (
        <div className="bg-[#232b3b] border border-blue-900 rounded-lg p-4 h-[520px] flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-white">Recommended Courses</h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {currentSession.recommendedCourses.map((course, index) => (
              <div key={index} className="bg-[#2d3748] p-4 rounded-lg hover:bg-[#3a4556] transition-colors">
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h4 className="text-lg font-semibold text-white hover:text-blue-400">{course.title}</h4>
                  <p className="text-sm text-blue-400 mt-1">{course.provider}</p>
                  <p className="text-gray-300 mt-2">{course.description}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'YouTube Resources') {
      if (!currentSession.youtubeResources || currentSession.youtubeResources.length === 0) {
        return <div className="text-gray-400 text-center py-8">No YouTube resources available. Generate some content first!</div>;
      }

      console.log('YouTube content:', currentSession.youtubeResources);

      return (
        <div className="bg-[#232b3b] border border-blue-900 rounded-lg p-4 h-[520px] flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-white">YouTube Resources</h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {currentSession.youtubeResources.map((video, index) => (
              <div key={index} className="bg-[#2d3748] p-4 rounded-lg hover:bg-[#3a4556] transition-colors">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white hover:text-blue-400">{video.title}</h4>
                      <p className="text-sm text-blue-400 mt-1">{video.channel}</p>
                    </div>
                    <span className="text-gray-400 text-sm bg-[#1f2937] px-2 py-1 rounded">{video.duration}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // Update the CSS styles to ensure proper 3D transformations and chat animations
  const styles = `
    /* 3D transformations for flashcards */
    .perspective {
      perspective: 1000px;
    }
    .preserve-3d {
      transform-style: preserve-3d;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
    .backface-hidden {
      backface-visibility: hidden;
    }
    .transition-transform {
      transition: transform 0.6s;
    }
    .absolute {
      position: absolute;
    }
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    /* Chat message animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-15px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(15px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
        transform: scale(1);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        transform: scale(1);
      }
    }

    .message-ai {
      animation: fadeInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      max-height: 400px;
      overflow-y: auto;
    }

    .message-user {
      animation: fadeInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .message-system {
      animation: fadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* Scrollbar styling for chat container */
    .scrollbar-custom::-webkit-scrollbar {
      width: 8px;
    }

    .scrollbar-custom::-webkit-scrollbar-track {
      background: #1e1e24;
      border-radius: 10px;
      margin: 4px 0;
    }

    .scrollbar-custom::-webkit-scrollbar-thumb {
      background: #3f3f46;
      border-radius: 10px;
      border: 2px solid #1e1e24;
    }

    .scrollbar-custom::-webkit-scrollbar-thumb:hover {
      background: #4b5563;
    }

    /* For Firefox */
    .scrollbar-custom {
      scrollbar-width: thin;
      scrollbar-color: #3f3f46 #1e1e24;
    }

    /* Also style scrollbars inside AI messages */
    .message-ai::-webkit-scrollbar {
      width: 4px;
    }

    .message-ai::-webkit-scrollbar-track {
      background: #232b3b;
      border-radius: 10px;
    }

    .message-ai::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 10px;
    }

    .message-ai::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  `;

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col h-screen">
      <style>{styles}</style>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-2 bg-[#23232a] shadow-sm border-b border-gray-800">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-full" />
          <span className="font-bold text-lg text-white">SnapStudy</span>
          <FiChevronRight className="mx-2 text-gray-400" />
          <span className="text-gray-400">Home</span>
          <FiChevronRight className="mx-2 text-gray-400" />
          <span className="text-blue-400 font-semibold">Session {currentSessionIdx + 1}</span>
          <button className="ml-2 p-1 rounded hover:bg-gray-700"><FiEdit2 className="text-gray-400 text-base" /></button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow"
            onClick={handleNewSession}
          >
            <FiPlus /> New Session
          </button>

          {/* User Profile with Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm shadow"
              onClick={toggleProfileMenu}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <FiUser />}
              </div>
              <span className="max-w-[120px] truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}</span>
              <FiChevronDown className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-700">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-white font-medium truncate">{currentUser?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser?.email || ''}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <FiLogOut className="text-red-400" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-8 py-1 bg-[#23232a] border-b border-gray-800 items-center">
        {ALL_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => {
              console.log(`Switching to tab: ${tab}`);
              setActiveTab(tab);
            }}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm focus:outline-none border-b-2 transition ${
              activeTab === tab
                ? 'text-blue-400 border-blue-400 bg-[#232b3b]' : 'text-gray-300 border-transparent hover:text-blue-400 hover:border-blue-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row justify-center gap-4 px-8 py-6 bg-[#18181b] h-[calc(100vh-120px)]">
        {/* Left: Input Button + (Input Fields) + Tab Content (dynamic) */}
        <div className="flex-1 flex flex-col bg-[#23232a] rounded-xl shadow p-6 overflow-auto min-w-[320px] max-w-[600px] border border-gray-800">
          {/* Show input fields only if 'Input' tab is active, otherwise show tab content */}
          {activeTab === 'Input' ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Input Content</h3>
              <form onSubmit={handleSubmit} className="space-y-4" encType='multipart/form-data'>
                <div className="space-y-4">
                  {/* Text Input */}
                  <div>
                    <label className="block text-gray-200 mb-2">Enter your content</label>
                    <textarea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      className="w-full bg-[#18181b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800"
                      placeholder="Paste your text here..."
                      rows="4"
                    />
                  </div>

                  {/* Link Input */}
                  <div>
                    <label className="block text-gray-200 mb-2">Or enter a link to a webpage</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={currentSession.inputLink}
                        onChange={handleInputLinkChange}
                        className="w-full bg-[#18181b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800"
                        placeholder="https://example.com/article"
                        pattern="https?://.*"
                        title="Please enter a valid URL starting with http:// or https://"
                      />
                      {currentSession.inputLink && !currentSession.inputLink.match(/^https?:\/\//i) && (
                        <div className="text-yellow-500 text-xs mt-1">
                          URL should start with http:// or https://
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-dashed border-gray-600 rounded-lg hover:bg-gray-800 hover:border-blue-500 transition-colors">
                      <span className="p-2 bg-blue-600 rounded-full text-white"><FiPaperclip /></span>
                      <span className="text-gray-200">Click to upload files (PDF, DOC, TXT, Images)</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        onClick={(e) => {
                          // Reset the input value to ensure onChange fires even if the same file is selected
                          e.currentTarget.value = null;
                        }}
                      />
                    </label>
                    {currentSession.uploadedFiles.length > 0 && (
                      <div className="mt-2">
                        <ul className="text-gray-300 text-sm list-disc ml-6">
                          {currentSession.uploadedFiles.map((file, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="mr-2">{file.name}</span>
                              <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 text-xs text-blue-400">
                          Supported file types: PDF, DOC/DOCX, TXT, JPG/PNG
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={isGenerating || (!inputContent.trim() && !currentSession.inputLink.trim() && currentSession.uploadedFiles.length === 0)}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Study Materials'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                  >
                    Clear
                  </button>
                </div>

                {generationError && (
                  <div className="text-red-500 text-sm mt-2">
                    {generationError}
                  </div>
                )}
              </form>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
        {/* Right: AI Tutor/Chat Area */}
    <div className="flex-1 bg-[#23232a] rounded-xl shadow p-6 flex flex-col min-w-[320px] max-w-[600px] border border-gray-800 h-full overflow-hidden">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">AI Tutor</h2>
              <p className="text-gray-400 text-sm mt-1">
                {hasGeneratedContent()
                  ? "Ask questions about the generated study materials"
                  : "Generate study materials first for better responses"}
              </p>
            </div>
            {chatHistory.length > 0 && (
              <button
                onClick={() => setChatHistory([])}
                className="text-sm px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                Clear Chat
              </button>
            )}
          </div>
          <div className="relative flex-1 mb-4 overflow-hidden">
            <div ref={chatContainerRef} className="absolute inset-0 overflow-y-auto text-gray-200 pr-2 scrollbar-custom" id="chat-container">
              {chatHistory.length > 0 ? (
                <div className="space-y-4 p-2">
                  {chatHistory.map((message, index) => (
                  <div key={index}>
                    {message.type === 'user' ? (
                      /* User's question - right aligned */
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none max-w-[80%] message-user">
                          <p className="break-words">{message.content}</p>
                        </div>
                      </div>
                    ) : message.type === 'ai' ? (
                      /* AI's response - left aligned */
                      <div className="flex justify-start">
                        <div className="bg-[#2d3748] p-3 rounded-lg rounded-tl-none max-w-[80%] message-ai scrollbar-custom" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <p className="whitespace-pre-line break-words">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      /* System message - centered */
                      <div className="flex justify-center">
                        <div className="bg-red-900/30 text-red-300 p-2 rounded-lg text-sm max-w-[90%] text-center message-system">
                          <p>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              ) : (
                <div className="p-4 bg-[#18181b] border border-gray-700 rounded-lg opacity-70">
                  <p className="text-gray-400">
                    {hasGeneratedContent()
                      ? "Ask a question about the content you've generated. For example:"
                      : "Generate study materials first, then ask questions like:"}
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-gray-400">
                    <li>"Explain the concept of [topic] in simpler terms"</li>
                    <li>"What are the key differences between [term1] and [term2]?"</li>
                    <li>"Can you provide more examples of [concept]?"</li>
                    <li>"How would you apply [concept] in a real-world scenario?"</li>
                  </ul>
                </div>
              )}
            </div>
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 animate-pulse hover:animate-none"
                aria-label="Scroll to bottom"
                style={{
                  animation: 'fadeInUp 0.3s ease-out, pulse 2s infinite',
                  zIndex: 10
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
                </svg>
                {newMessageCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {newMessageCount > 9 ? '9+' : newMessageCount}
                  </span>
                )}
              </button>
            )}
          </div>
          <div className="mt-auto">
            <form className="flex items-center gap-2" onSubmit={handleAskTutor}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-[#18181b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800"
                placeholder={hasGeneratedContent() ? "Ask about the generated materials..." : "Generate materials first, then ask questions..."}
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white focus:outline-none"
                disabled={tutorLoading}
              >
                {tutorLoading ? '...' : <FiSend className="text-xl" />}
              </button>
            </form>
            {tutorError && <p className="text-red-500 text-sm mt-2">{tutorError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;