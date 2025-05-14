import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FiChevronRight, FiEdit2, FiPlus, FiSend, FiPaperclip } from 'react-icons/fi';
import { generateStudyMaterials } from '../services/studyMaterialsService';
import FlashcardDisplay from '../components/FlashcardDisplay';
import logo from '../assets/logo.png';

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
  const [uploadProgress, setUploadProgress] = useState(0);

  // Get current session data
  const currentSession = sessions[currentSessionIdx];

  // Reset quiz state when switching to AI Quizzes tab or session
  React.useEffect(() => {
    if (activeTab === 'AI Quizzes') {
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizResult({ correct: 0, total: 0 });
    }
  }, [activeTab, currentSessionIdx]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadProgress(0);
    
    // Validate file types
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setGenerationError(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setSessions(prev => {
      const updated = [...prev];
      updated[currentSessionIdx] = {
        ...updated[currentSessionIdx],
        uploadedFiles: files,
      };
      return updated;
    });
  };

  const handleInputLinkChange = (e) => {
    setSessions(prev => {
      const updated = [...prev];
      updated[currentSessionIdx] = {
        ...updated[currentSessionIdx],
        inputLink: e.target.value,
      };
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
        const formData = new FormData();
        formData.append('file', currentSession.uploadedFiles[0]);
        response = await generateStudyMaterials(formData);
      }
      // Handle link
      else if (currentSession.inputLink.trim()) {
        response = await generateStudyMaterials({ link: currentSession.inputLink.trim() });
      }
      // Handle text content
      else if (inputContent.trim()) {
        response = await generateStudyMaterials({ text: inputContent.trim() });
      } else {
        throw new Error('Please provide some content (text, link, or file) to generate study materials.');
      }

      console.log("Raw response:", response.data);

      // Parse the response
      let studyMaterials;
      try {
        // Handle different response formats
        const responseData = response.data.response;
        console.log("Response string:", responseData);
        
        // Add validation for response format
        if (!responseData) {
          throw new Error('Empty response from server');
        }
        
        // Remove the markdown code block markers and parse the JSON
        const jsonStr = responseData.replace(/```json\n|\n```/g, '');
        console.log("Cleaned JSON string:", jsonStr);
        
        let parsedData;
        try {
          parsedData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid JSON response from server');
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

  // Update the CSS styles to ensure proper 3D transformations
  const styles = `
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
  `;

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col">
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
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow"
          onClick={handleNewSession}
        >
          <FiPlus /> New Session
        </button>
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
      <div className="flex-1 flex flex-col md:flex-row justify-center gap-4 px-8 py-6 bg-[#18181b]">
        {/* Left: Input Button + (Input Fields) + Tab Content (dynamic) */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#23232a] rounded-xl shadow p-6 overflow-hidden min-w-[320px] max-w-[600px] border border-gray-800">
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
                    <label className="block text-gray-200 mb-2">Or enter a link</label>
                    <input
                      type="url"
                      value={currentSession.inputLink}
                      onChange={handleInputLinkChange}
                      className="w-full bg-[#18181b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800"
                      placeholder="https://..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="p-2 bg-blue-600 rounded-full text-white"><FiPaperclip /></span>
                      <span className="text-gray-200">Or upload files (PDF, PPT, DOC, Images, etc.)</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    {currentSession.uploadedFiles.length > 0 && (
                      <ul className="mt-2 text-gray-300 text-sm list-disc ml-6">
                        {currentSession.uploadedFiles.map((file, idx) => (
                          <li key={idx}>{file.name}</li>
                        ))}
                      </ul>
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
        <div className="flex-1 bg-[#23232a] rounded-xl shadow p-6 flex flex-col min-w-[320px] max-w-[600px] border border-gray-800">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4 text-white">AI Tutor</h2>
          </div>
          <div className="mt-auto">
            <form className="flex items-center gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                className="flex-1 bg-[#18181b] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-800"
                placeholder="Ask AI assistant..."
              />
              <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white focus:outline-none">
                <FiSend className="text-xl" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;