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
      <div className="space-y-4">
        <div className="grid gap-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleChoiceSelect(option)}
              className={`p-3 text-left rounded-lg border transition-colors ${
                selectedChoice === option
                  ? "bg-primary text-primary-content border-primary"
                  : "bg-base-100 border-base-300 hover:bg-base-200"
              }`}
              disabled={isSubmitting}
            >
              {option}
            </button>
          ))}
        </div>
        
        {selectedChoice && (
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

  // Multi-choice input (checkboxes)
  if (question.type === "multi_choice" && question.options) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedMultiChoices.includes(option)
                  ? "bg-primary/10 border-primary"
                  : "bg-base-100 border-base-300 hover:bg-base-200"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMultiChoices.includes(option)}
                onChange={() => handleMultiChoiceToggle(option)}
                className="checkbox checkbox-primary mt-0.5"
                disabled={isSubmitting}
              />
              <span className="text-sm leading-relaxed">{option}</span>
            </label>
          ))}
        </div>
        
        <div className="text-xs text-base-content/60 px-2">
          {selectedMultiChoices.length === 0 
            ? "Select any that apply or continue without selecting" 
            : `${selectedMultiChoices.length} selected`}
        </div>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
        >
          {isSubmitting ? "Sending..." : "Continue"}
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
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {scaleOptions.map((value) => (
            <button
              key={value}
              onClick={() => handleScaleSelect(value.toString())}
              className={`p-3 text-center rounded-lg border transition-colors ${
                scaleValue === value.toString()
                  ? "bg-primary text-primary-content border-primary"
                  : "bg-base-100 border-base-300 hover:bg-base-200"
              }`}
              disabled={isSubmitting}
            >
              {value}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-base-content/60">
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
    <div className="space-y-3">
      <textarea
        value={currentAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your response here... (Press Enter to send, Shift+Enter for new line)"
        className="w-full min-h-[100px] p-3 border border-base-300 rounded-lg bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        disabled={isSubmitting}
        maxLength={2000}
      />
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-base-content/50">
          Press Enter to send, Shift+Enter for new line
        </div>
        <div className="text-xs text-base-content/50">
          {currentAnswer.length}/2000
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={!currentAnswer.trim() || isSubmitting}
        className="w-full py-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </div>
  );
}