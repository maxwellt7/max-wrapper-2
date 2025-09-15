"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "@/components/stacks/MessageBubble";

interface Question {
  index: number;
  key: string;
  text: string;
}

interface StackSession {
  id: string;
  title: string;
  status: string;
  current_index: number;
  stack: {
    slug: string;
    title: string;
    questions: Question[];
  };
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

interface StackChatProps {
  session: StackSession;
  onSessionUpdate: (session: StackSession) => void;
}

export function StackChat({ session, onSessionUpdate }: StackChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [session.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      // Load previous answers
      const response = await fetch(`/stacks/api/answers?sessionId=${session.id}`);
      if (response.ok) {
        const answers = await response.json();
        
        const messageHistory: Message[] = [];
        
        // Add welcome message
        messageHistory.push({
          id: "welcome",
          role: "assistant",
          content: `Welcome to your ${session.stack.title}! I'm here to guide you through this structured reflection. Let's begin with your first question.`,
          timestamp: new Date().toISOString(),
        });

        // Add previous Q&A pairs
        answers.forEach((answer: any) => {
          messageHistory.push({
            id: `q-${answer.question_index}`,
            role: "assistant",
            content: answer.question_text,
            timestamp: answer.created_at,
          });
          
          messageHistory.push({
            id: `a-${answer.question_index}`,
            role: "user",
            content: answer.answer_text,
            timestamp: answer.created_at,
          });
        });

        // Add current question if not completed
        if (session.status !== "completed" && session.current_index < session.stack.questions.length) {
          const currentQuestion = session.stack.questions[session.current_index];
          let questionText = currentQuestion.text;
          
          // Replace [X] placeholder with the subject from question 3
          const subjectAnswer = answers.find((a: any) => a.question_key === "subject");
          if (subjectAnswer && questionText.includes("[X]")) {
            questionText = questionText.replace(/\[X\]/g, subjectAnswer.answer_text);
          }
          
          messageHistory.push({
            id: `current-q`,
            role: "assistant",
            content: questionText,
            timestamp: new Date().toISOString(),
          });
        }

        // Check for summary
        if (session.status === "completed") {
          const summaryResponse = await fetch(`/stacks/api/summary?sessionId=${session.id}`);
          if (summaryResponse.ok) {
            const summary = await summaryResponse.json();
            messageHistory.push({
              id: "summary",
              role: "assistant",
              content: `🎉 Congratulations! You've completed your ${session.stack.title}.\n\nHere's your personalized summary:\n\n${summary.summary_text}`,
              timestamp: summary.created_at,
            });
          }
        }

        setMessages(messageHistory);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/stacks/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
          questionIndex: session.current_index,
          answer: currentAnswer.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const result = await response.json();
      
      // Add user's answer to messages
      const userMessage: Message = {
        id: `user-${session.current_index}`,
        role: "user",
        content: currentAnswer.trim(),
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setCurrentAnswer("");
      
      // Update session
      const updatedSession = { ...session, current_index: result.current_index };
      onSessionUpdate(updatedSession);
      
      // If completed, generate summary
      if (result.completed) {
        setIsGeneratingSummary(true);
        try {
          const summaryResponse = await fetch("/stacks/api/summary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: session.id,
            }),
          });

          if (summaryResponse.ok) {
            const summary = await summaryResponse.json();
            const summaryMessage: Message = {
              id: "final-summary",
              role: "assistant",
              content: `🎉 Congratulations! You've completed your ${session.stack.title}.\n\nHere's your personalized summary:\n\n${summary.summary_text}`,
              timestamp: new Date().toISOString(),
            };
            
            setMessages(prev => [...prev, summaryMessage]);
            onSessionUpdate({ ...updatedSession, status: "completed" });
          }
        } catch (error) {
          console.error("Error generating summary:", error);
        } finally {
          setIsGeneratingSummary(false);
        }
      } else {
        // Add next question
        const nextQuestion = session.stack.questions[result.current_index];
        if (nextQuestion) {
          let questionText = nextQuestion.text;
          
          // Replace [X] placeholder with subject answer
          const allAnswers = await fetch(`/stacks/api/answers?sessionId=${session.id}`);
          if (allAnswers.ok) {
            const answers = await allAnswers.json();
            const subjectAnswer = answers.find((a: any) => a.question_key === "subject");
            if (subjectAnswer && questionText.includes("[X]")) {
              questionText = questionText.replace(/\[X\]/g, subjectAnswer.answer_text);
            }
          }
          
          const nextQuestionMessage: Message = {
            id: `next-q-${result.current_index}`,
            role: "assistant",
            content: questionText,
            timestamp: new Date().toISOString(),
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, nextQuestionMessage]);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          
          {isGeneratingSummary && (
            <MessageBubble
              role="assistant"
              content="I'm generating your personalized summary... This may take a moment. ✨"
              timestamp={new Date().toISOString()}
              isLoading
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {session.status !== "completed" && (
        <div className="border-t border-base-300 p-4 bg-base-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response here... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 min-h-[100px] p-3 border border-base-300 rounded-lg bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                disabled={isSubmitting || isGeneratingSummary}
                maxLength={2000}
              />
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim() || isSubmitting || isGeneratingSummary}
                className="px-8 py-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
            <div className="flex justify-between text-xs text-base-content/50 mt-2">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{currentAnswer.length}/2000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}