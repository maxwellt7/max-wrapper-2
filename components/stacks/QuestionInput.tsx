"use client";

import { useState } from "react";

interface Question {
  index: number;
  key: string;
  text: string;
  type?: string;
  options?: string[];
  min?: number;
  max?: number;
  section?: string;
}

interface QuestionInputProps {
  question: Question;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function QuestionInput({ 
  question, 
  currentAnswer, 
  onAnswerChange, 
  onSubmit, 
  isSubmitting 
}: QuestionInputProps) {
  const [selectedChoice, setSelectedChoice] = useState(currentAnswer || "");
  const [scaleValue, setScaleValue] = useState(currentAnswer || "");
  const [selectedMultiChoices, setSelectedMultiChoices] = useState<string[]>(
    currentAnswer ? currentAnswer.split(", ") : []
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleChoiceSelect = (choice: string) => {
    setSelectedChoice(choice);
    onAnswerChange(choice);
  };

  const handleScaleSelect = (value: string) => {
    setScaleValue(value);
    onAnswerChange(value);
    
    // Auto-submit immediately when selecting any value on the scale
    if (question.type === "scale") {
      // Use a small delay to ensure state updates complete
      setTimeout(() => onSubmit(), 100);
    }
  };

  const handleMultiChoiceToggle = (choice: string) => {
    const newSelectedChoices = selectedMultiChoices.includes(choice)
      ? selectedMultiChoices.filter(c => c !== choice)
      : [...selectedMultiChoices, choice];
    
    setSelectedMultiChoices(newSelectedChoices);
    onAnswerChange(newSelectedChoices.join(", "));
  };

  // Choice input (dropdown/buttons)
  if (question.type === "choice" && question.options) {
    return (
      <div className="space-y-6">
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleChoiceSelect(option)}
              className={`group p-4 text-left rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                selectedChoice === option
                  ? "glass border-blue-400/50 text-blue-300 glow-primary"
                  : "glass-subtle border-slate-600/30 hover:border-slate-500/50 text-slate-300 hover:text-white hover:glass"
              }`}
              disabled={isSubmitting}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  selectedChoice === option
                    ? "border-blue-400 bg-blue-400 glow-primary"
                    : "border-slate-500 group-hover:border-slate-400"
                }`}>
                  {selectedChoice === option && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
        
        {selectedChoice && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full py-4 glass border border-blue-400/30 rounded-xl text-blue-300 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-200 font-semibold hover:scale-[1.02] glow-primary disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              "Continue"
            )}
          </button>
        )}
      </div>
    );
  }

  // Multi-choice input (checkboxes)
  if (question.type === "multi_choice" && question.options) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`group flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                selectedMultiChoices.includes(option)
                  ? "glass border-blue-400/50 text-blue-300"
                  : "glass-subtle border-slate-600/30 hover:border-slate-500/50 text-slate-300 hover:text-white hover:glass"
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
                selectedMultiChoices.includes(option)
                  ? "border-blue-400 bg-blue-400 glow-primary"
                  : "border-slate-500 group-hover:border-slate-400"
              }`}>
                {selectedMultiChoices.includes(option) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={selectedMultiChoices.includes(option)}
                onChange={() => handleMultiChoiceToggle(option)}
                className="sr-only"
                disabled={isSubmitting}
              />
              <span className="font-medium leading-relaxed">{option}</span>
            </label>
          ))}
        </div>
        
        <div className="glass-subtle rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400">
            {selectedMultiChoices.length === 0 
              ? "Select any that apply or continue without selecting" 
              : `${selectedMultiChoices.length} option${selectedMultiChoices.length !== 1 ? 's' : ''} selected`}
          </div>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-4 glass border border-blue-400/30 rounded-xl text-blue-300 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-200 font-semibold hover:scale-[1.02] glow-primary disabled:opacity-50 disabled:scale-100"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </div>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    );
  }

  // Scale input (1-10 rating)
  if (question.type === "scale") {
    const min = question.min || 1;
    const max = question.max || 10;
    const scaleOptions = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-3">
          {scaleOptions.map((value) => (
            <button
              key={value}
              onClick={() => handleScaleSelect(value.toString())}
              className={`group p-4 text-center rounded-xl border transition-all duration-200 hover:scale-[1.05] font-bold text-lg ${
                scaleValue === value.toString()
                  ? "glass border-blue-400/50 text-blue-300 glow-primary"
                  : "glass-subtle border-slate-600/30 hover:border-slate-500/50 text-slate-300 hover:text-white hover:glass"
              }`}
              disabled={isSubmitting}
            >
              {value}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-slate-400 px-2">
          <span>Low</span>
          <span>High</span>
        </div>
        
        {(scaleValue || currentAnswer) && (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {isSubmitting ? "Sending..." : "Continue"}
          </button>
        )}
      </div>
    );
  }

  // Default text input
  return (
    <div className="space-y-6">
      <div className="relative">
        <textarea
          value={currentAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response here... (Press Enter to send, Shift+Enter for new line)"
          className="w-full min-h-[140px] p-6 glass border border-slate-600/30 rounded-xl text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400/50 focus:glow-primary transition-all duration-200 modern-scrollbar backdrop-blur-xl"
          disabled={isSubmitting}
          maxLength={2000}
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-500">
          {currentAnswer.length}/2000
        </div>
      </div>
      
      <div className="glass-subtle rounded-lg p-3 text-center">
        <div className="text-xs text-slate-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={!currentAnswer.trim() || isSubmitting}
        className="w-full py-4 glass border border-blue-400/30 rounded-xl text-blue-300 hover:text-blue-200 hover:border-blue-400/50 transition-all duration-200 font-semibold hover:scale-[1.02] glow-primary disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Sending...
          </div>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
}