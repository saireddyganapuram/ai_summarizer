import React, { useState, useMemo } from 'react';

const FlashcardDisplay = ({ flashcards, currentIndex, onPrevious, onNext, onFlip, isFlipped }) => {
  // Process flashcards data to ensure consistent format
  const processedFlashcards = useMemo(() => {
    if (!flashcards || flashcards.length === 0) {
      return [];
    }

    // Check if flashcards are already in the correct format
    return flashcards.map(card => {
      // Handle various possible formats
      return {
        front: card.front || card.question || card.q || "Question not available",
        back: card.back || card.answer || card.a || "Answer not available"
      };
    });
  }, [flashcards]);

  if (!processedFlashcards || processedFlashcards.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No flashcards available. Generate some content first!
      </div>
    );
  }

  const currentFlashcard = processedFlashcards[currentIndex];
  
  if (!currentFlashcard) {
    console.error("No flashcard found at index:", currentIndex);
    return (
      <div className="text-gray-400 text-center py-8">
        Error loading flashcard. Please try regenerating the content.
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = Math.round((currentIndex + 1) / processedFlashcards.length * 100);

  return (
    <div className="bg-[#232b3b] border border-blue-900 rounded-lg p-4 h-[520px] flex flex-col">
      <h3 className="font-bold text-lg mb-4 text-white">
        AI Flashcards <span className="text-sm text-gray-400 ml-2">(Click card or use Flip button)</span>
      </h3>
      
      <div className="flex flex-col items-center flex-1 overflow-y-auto">
        {/* Flashcard Container */}
        <div className="w-full max-w-4xl mb-6 perspective">
          <div 
            className={`relative w-full aspect-video bg-[#2d3748] rounded-lg shadow-2xl cursor-pointer transition-transform duration-500 `}
          >
            {/* Front of card */}
            <div className={`absolute inset-0 p-8 flex flex-col backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
              <div className="text-2xl font-bold text-white mb-4 flex justify-between items-center">
                <span>Card {currentIndex + 1} of {processedFlashcards.length}</span>
                <span className="text-lg text-blue-400">{progressPercentage}% Complete</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-3xl">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {currentFlashcard.front}
                    </h2>
                  </div>
                  <div className="bg-[#232b3b] rounded-lg p-4">
                    <p className="text-gray-400 text-lg">Click to reveal answer</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Back of card */}
            <div className={`absolute inset-0 p-8 flex flex-col backface-hidden ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
              <div className="text-2xl font-bold text-white mb-4 flex justify-between items-center">
                <span>Card {currentIndex + 1} of {processedFlashcards.length}</span>
                <span className="text-lg text-blue-400">{progressPercentage}% Complete</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-3xl">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-green-400">Answer</h2>
                  </div>
                  <div className="bg-[#232b3b] rounded-lg p-4">
                    <p className="text-lg text-gray-200">
                      {currentFlashcard.back}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className={`px-6 py-3 rounded-lg font-semibold text-lg ${
              currentIndex === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            ← Previous
          </button>
          <button 
            onClick={onFlip}
            className="px-6 py-3 rounded-lg font-semibold text-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </button>
          <button
            onClick={() => onNext()}
            disabled={currentIndex === processedFlashcards.length - 1}
            className={`px-6 py-3 rounded-lg font-semibold text-lg ${
              currentIndex === processedFlashcards.length - 1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
          >
            Next →
          </button>
        </div>
        
        {/* Navigation Dots */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-4xl">
          {processedFlashcards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                // Tell parent component to change index and flip state
                if (isFlipped) {
                  onFlip();
                }
                // Using a callback to update index in parent component
                onNext(idx);
              }}
              className={`w-3 h-3 rounded-full ${
                idx === currentIndex ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to flashcard ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardDisplay; 