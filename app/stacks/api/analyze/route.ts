import { NextResponse } from "next/server";
import { OpenAI } from 'openai';
import { getAllSessions, getAnswersForSession } from "@/lib/db-connection";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

interface SessionAnswer {
  question_key: string;
  question_text: string;
  answer_text: string;
  session_title: string;
  stack_title: string;
  created_at: string;
}

export async function GET() {
  try {
    console.log("🧠 Starting AI analysis of user responses");

    // Fetch all sessions
    const { data: sessions, error: sessionsError } = await getAllSessions();
    if (sessionsError || !sessions || sessions.length === 0) {
      console.log("⚠️ No sessions found for analysis");
      return NextResponse.json({
        mentalLoops: [],
        performanceAccelerators: [],
        overallInsights: {
          dominantThemes: [],
          emotionalPatterns: [],
          behavioralTrends: [],
          recommendations: ["Complete more stacks to generate meaningful insights"]
        },
        analysisDate: new Date().toISOString(),
        sessionsAnalyzed: 0
      });
    }

    console.log(`📊 Found ${sessions.length} sessions to analyze`);

    // Collect all answers from all sessions
    const allAnswers: SessionAnswer[] = [];
    
    for (const session of sessions) {
      const { data: answers, error: answersError } = await getAnswersForSession(session.id);
      
      if (!answersError && answers) {
        for (const answer of answers) {
          allAnswers.push({
            question_key: answer.question_key,
            question_text: answer.question_text,
            answer_text: answer.answer_text,
            session_title: session.title,
            stack_title: session.stacks.title,
            created_at: answer.created_at
          });
        }
      }
    }

    console.log(`📝 Collected ${allAnswers.length} answers for analysis`);

    if (allAnswers.length === 0) {
      return NextResponse.json({
        mentalLoops: [],
        performanceAccelerators: [],
        overallInsights: {
          dominantThemes: [],
          emotionalPatterns: [],
          behavioralTrends: [],
          recommendations: ["Complete questions in your stacks to generate insights"]
        },
        analysisDate: new Date().toISOString(),
        sessionsAnalyzed: sessions.length
      });
    }

    // Format data for AI analysis
    const analysisData = allAnswers.map(answer => 
      `Stack: ${answer.stack_title} | Session: ${answer.session_title} | Question: ${answer.question_text} | Answer: ${answer.answer_text}`
    ).join('\n\n');

    console.log("🤖 Sending data to AI for analysis...");

    // Create AI prompt for analysis
    const prompt = `You are an expert performance coach and psychologist analyzing personal reflection data to identify mental patterns. 

TASK: Analyze these personal reflection responses and identify:
1. Hidden mental loops that sabotage performance 
2. Patterns that accelerate performance
3. Overall psychological insights

DATA TO ANALYZE:
${analysisData}

ANALYSIS REQUIREMENTS:
- Focus on recurring thoughts, emotions, and behavioral patterns
- Identify self-limiting beliefs and negative thought cycles
- Highlight strengths and positive momentum patterns  
- Be specific with examples from the data
- Provide actionable insights

RESPONSE FORMAT (JSON only):
{
  "mentalLoops": [
    {
      "pattern": "Brief pattern name",
      "description": "Detailed explanation of the sabotaging loop", 
      "impact": "high|medium|low",
      "frequency": number,
      "examples": ["Direct quotes or paraphrases from responses"]
    }
  ],
  "performanceAccelerators": [
    {
      "pattern": "Brief pattern name",
      "description": "How this pattern boosts performance",
      "strength": "high|medium|low", 
      "frequency": number,
      "examples": ["Direct quotes or paraphrases from responses"]
    }
  ],
  "overallInsights": {
    "dominantThemes": ["key themes identified"],
    "emotionalPatterns": ["emotional patterns observed"],
    "behavioralTrends": ["behavioral trends noted"],
    "recommendations": ["Specific actionable recommendations"]
  }
}`;

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert performance psychologist. Analyze the provided data and respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("✅ AI analysis completed");

    // Parse AI response - handle markdown code blocks
    let analysisResult;
    try {
      // Clean up response by removing markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw AI response:", aiResponse);
      
      // Fallback response if JSON parsing fails
      analysisResult = {
        mentalLoops: [{
          pattern: "Analysis Processing Error",
          description: "Unable to parse AI analysis results. Please try again.",
          impact: "low",
          frequency: 0,
          examples: []
        }],
        performanceAccelerators: [],
        overallInsights: {
          dominantThemes: [],
          emotionalPatterns: [],
          behavioralTrends: [],
          recommendations: ["Please refresh the analysis to try again"]
        }
      };
    }

    // Add metadata
    const response = {
      ...analysisResult,
      analysisDate: new Date().toISOString(),
      sessionsAnalyzed: sessions.length
    };

    console.log(`🎯 Analysis complete: ${response.mentalLoops?.length || 0} loops, ${response.performanceAccelerators?.length || 0} accelerators found`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Error in AI analysis:", error);
    
    return NextResponse.json({
      error: "Failed to perform AI analysis",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}