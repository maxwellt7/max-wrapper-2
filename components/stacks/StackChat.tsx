"use client";

import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "@/components/stacks/MessageBubble";
import { QuestionInput } from "@/components/stacks/QuestionInput";
import { ManifestoDisplay } from "@/components/stacks/ManifestoDisplay";

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
  const [manifestoData, setManifestoData] = useState<any>(null);
  const [showManifesto, setShowManifesto] = useState(false);
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
        
        // Special handling for Morning Stack
        if (session.stack.slug === 'morning') {
          // Check if user has manifesto data
          const manifestoResponse = await fetch('/stacks/api/manifesto', {
            headers: { 'session-id': session.id }
          });
          
          if (manifestoResponse.ok) {
            const manifestoResult = await manifestoResponse.json();
            setManifestoData(manifestoResult.manifesto);
            
            if (manifestoResult.manifesto) {
              // User has manifesto - show it and jump to daily questions
              messageHistory.push({
                id: "welcome",
                role: "assistant",
                content: `Good morning! Welcome to your Morning Stack. Let me start by showing you your Morning Manifesto - your foundational beliefs and identity.`,
                timestamp: new Date().toISOString(),
              });
              
              setShowManifesto(true);
              
              // Skip manifesto questions if already completed
              const dailyQuestionIndex = session.stack.questions.findIndex(q => q.section === 'daily');
              if (dailyQuestionIndex > session.current_index) {
                // Update session to start at daily questions
                onSessionUpdate({ ...session, current_index: dailyQuestionIndex });
              }
            } else {
              // First time - start with manifesto setup
              messageHistory.push({
                id: "welcome",
                role: "assistant",
                content: `Welcome to your Morning Stack! This is your first time, so let's begin by creating your Morning Manifesto - your foundational WHY, identity, and beliefs that will anchor every morning reflection.`,
                timestamp: new Date().toISOString(),
              });
            }
          }
        } else {
          // Standard welcome for other stacks
          messageHistory.push({
            id: "welcome",
            role: "assistant",
            content: `Welcome to your ${session.stack.title}! I'm here to guide you through this structured reflection. Let's begin with your first question.`,
            timestamp: new Date().toISOString(),
          });
        }

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
      const currentQuestion = session.stack.questions[session.current_index];
      
      // Submit the answer
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
      
      // Handle manifesto completion for Morning Stack
      if (session.stack.slug === 'morning' && currentQuestion.section === 'manifesto') {
        // Check if we've completed all manifesto questions
        const manifestoQuestions = session.stack.questions.filter(q => q.section === 'manifesto');
        const isLastManifestoQuestion = session.current_index === manifestoQuestions[manifestoQuestions.length - 1].index;
        
        if (isLastManifestoQuestion) {
          // Gather all manifesto answers
          const allAnswersResponse = await fetch(`/stacks/api/answers?sessionId=${session.id}`);
          if (allAnswersResponse.ok) {
            const answers = await allAnswersResponse.json();
            const manifestoAnswers = answers.filter((a: any) => 
              manifestoQuestions.some(q => q.key === a.question_key)
            );
            
            // Build manifesto data object
            const manifestoData: any = {};
            manifestoAnswers.forEach((answer: any) => {
              manifestoData[answer.question_key] = answer.answer_text;
            });
            
            // Save manifesto data
            await fetch('/stacks/api/manifesto', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'session-id': session.id
              },
              body: JSON.stringify({ manifestoData })
            });
            
            setManifestoData(manifestoData);
            setShowManifesto(true);
          }
        }
      }
      
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
    <div className="flex-1 flex flex-col min-h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 modern-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          
          {/* Show Manifesto for Morning Stack */}
          {session.stack.slug === 'morning' && showManifesto && manifestoData && (
            <div className="my-8">
              <ManifestoDisplay data={manifestoData} />
            </div>
          )}

          {isGeneratingSummary && (
            <div className="flex justify-center">
              <div className="glass rounded-2xl p-6 border max-w-md" style={{borderColor: 'rgb(var(--primary) / 0.3)'}}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgb(var(--primary) / 0.15)'}}>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: 'rgb(var(--primary))', borderTopColor: 'transparent'}}></div>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{color: 'rgb(var(--fg))'}}>Generating summary...</div>
                    <div className="text-xs" style={{color: 'rgb(var(--muted))'}}>This may take a moment ✨</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {session.status !== "completed" && session.current_index < session.stack.questions.length && (
        <div className="border-t glass-subtle backdrop-blur-sm" style={{borderColor: 'rgb(var(--border) / 0.5)'}}>
          <div className="max-w-4xl mx-auto p-6">
            <QuestionInput
              question={session.stack.questions[session.current_index]}
              currentAnswer={currentAnswer}
              onAnswerChange={setCurrentAnswer}
              onSubmit={submitAnswer}
              isSubmitting={isSubmitting || isGeneratingSummary}
            />
          </div>
        </div>
      )}
    </div>
  );
}