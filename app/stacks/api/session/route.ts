import { NextRequest, NextResponse } from "next/server";

// Mock data to match the stacks API
const getStackData = (slug: string) => {
  const stacks = {
    gratitude: {
      id: "9066b828-f395-4b47-bb23-3ec96bfe9ae3",
      slug: "gratitude",
      title: "Gratitude Stack",
      description: "A structured reflection process to explore and deepen your gratitude experiences through the CORE 4 framework.",
      questions: [
        {"index": 1, "key": "title", "text": "What are you going to title this Gratitude Stack?"},
        {"index": 2, "key": "domain", "text": "What domain of the CORE 4 are you stacking?"},
        {"index": 3, "key": "subject", "text": "Who/What are you stacking?"},
        {"index": 4, "key": "trigger", "text": "In this moment, why has [X] triggered you to feel grateful?"},
        {"index": 5, "key": "story", "text": "What is the story you're telling yourself, created by this trigger, about [X] and the situation?"},
        {"index": 6, "key": "feelings", "text": "Describe the single word feelings that arise for you when you tell yourself that story."},
        {"index": 7, "key": "thoughts_actions", "text": "Describe the specific thoughts and actions that arise for you when you tell yourself this story."},
        {"index": 8, "key": "facts", "text": "What are the non-emotional FACTS about the situation with [X] that triggered you to feel grateful?"},
        {"index": 9, "key": "want_for_self", "text": "Empowered by your gratitude trigger with [X] and the original story, what do you truly want for you in and beyond this situation?"},
        {"index": 10, "key": "want_for_other", "text": "What do you want for [X] in and beyond this situation?"},
        {"index": 11, "key": "want_for_both", "text": "What do you want for [X] and YOU in and beyond this situation?"},
        {"index": 12, "key": "positive_impact", "text": "Stepping back from what you have created so far, why has this gratitude trigger been extremely positive?"},
        {"index": 13, "key": "life_lesson", "text": "Looking at how positive this gratitude trigger has been, what is the singular lesson on life you are taking from this Stack?"},
        {"index": 14, "key": "revelation", "text": "What is the most significant revelation or insight you are leaving this Gratitude Stack with, and why do you feel that way?"},
        {"index": 15, "key": "actions", "text": "What immediate actions are you committed to taking leaving this Stack?"}
      ]
    },
    morning: {
      id: "5056edaa-27ba-417e-aeac-48727547788c",
      slug: "morning",
      title: "Morning Stack", 
      description: "Start your day with intention through structured reflection and manifesto review.",
      questions: [
        {"index": 0, "key": "manifesto_check", "text": "Welcome to your Morning Stack! Let me check if you have completed your Morning Manifesto. This is your foundational WHY, identity, and beliefs that anchor everything you do.", "type": "system", "section": "system"},
        {"index": 1, "key": "why", "text": "Let's begin with your WHY. What is your fundamental purpose? What drives you to get up every morning and make a difference in the world? Take your time to think deeply about this.", "type": "manifesto_setup", "section": "manifesto"},
        {"index": 2, "key": "who_identity", "text": "WHO are you at your core? Describe your fundamental identity - your values, beliefs, and the story of what you do. Include who you can't fail to be and what environment you're creating.", "type": "manifesto_setup", "section": "manifesto"},
        {"index": 3, "key": "future_goals", "text": "What are 3 goals that your future self has accomplished? Think big - what legacy will you create? What transformation will you bring to the world?", "type": "manifesto_setup", "section": "manifesto"},
        {"index": 4, "key": "goal_achiever_identity", "text": "WHO is the person that achieves those goals? What qualities, characteristics, and ways of being does that future version of you embody?", "type": "manifesto_setup", "section": "manifesto"},
        {"index": 5, "key": "feelings_truth", "text": "WHAT are the feelings you feel that make this story true? Describe the emotional states, energy, and presence that align with your highest self.", "type": "manifesto_setup", "section": "manifesto"},
        {"index": 6, "key": "past_wins_proof", "text": "What's the proof you have of your past wins? List specific examples that show you're already becoming this person and have the track record to achieve your goals.", "type": "manifesto_setup", "section": "manifesto"},
        {"index": 7, "key": "sleep_time", "text": "What time did you go to sleep last night? (Format: 11:30 PM or 23:30)", "type": "daily", "section": "daily"},
        {"index": 8, "key": "wakeup_time", "text": "What time did you wake up this morning? (Format: 6:30 AM or 06:30)", "type": "daily", "section": "daily"},
        {"index": 9, "key": "sleep_quality", "text": "How would you rate the quality of your sleep last night?", "type": "choice", "options": ["Bad", "Okay", "Good", "Great"], "section": "daily"},
        {"index": 10, "key": "motivation_level", "text": "On a scale of 1-10, what's your motivation level right now?", "type": "scale", "min": 1, "max": 10, "section": "daily"},
        {"index": 11, "key": "gratitude_three", "text": "List 3 things you're grateful for right now:", "type": "daily", "section": "daily"},
        {"index": 12, "key": "make_today_great", "text": "What would make today great? What's the one thing that, if accomplished, would make you feel amazing about today?", "type": "daily", "section": "daily"},
        {"index": 13, "key": "not_to_do_list", "text": "What's on your \"Not-to-Do\" list today? What will you consciously avoid or say no to in order to protect your energy and focus?", "type": "daily", "section": "daily"}
      ]
    },
    evening: {
      id: "a1b2c3d4-e5f6-4789-abc1-234567890def",
      slug: "evening",
      title: "Evening Truth Pulse",
      description: "Daily evening reflection designed to integrate truth, recognize patterns, and set strategic momentum for tomorrow.",
      questions: [
        {"index": 1, "key": "truth_question_selection", "text": "Today's Truth Question: Select the one that resonates most with you today", "type": "choice", "options": ["Where did I prove instead of express today?", "What unfinished idea created shame today?", "What would my future self have done differently?", "Where could I have used voice over hands?", "What truth would realign my team moving forward?"], "section": "truth"},
        {"index": 2, "key": "truth_response", "text": "My Truth Response: Write 2-3 sentences capturing your authentic response to the question you selected", "type": "daily", "section": "truth"},
        {"index": 3, "key": "shadow_patterns", "text": "Shadow Patterns Detected: Check any that showed up today", "type": "multi_choice", "options": ["Gladiator - Forcing outcomes, aggressive pushing", "Atlas - Over-controlling, carrying too much", "Hollow Performer - Proving worth through achievement", "Mirror Judge - Perfectionism paralysis"], "section": "shadow_genius"},
        {"index": 4, "key": "shadow_response", "text": "Shadow Response: How did this pattern serve/limit me today?", "type": "daily", "section": "shadow_genius"},
        {"index": 5, "key": "genius_activations", "text": "Genius Activations: Check any that were present today", "type": "multi_choice", "options": ["Mythic Pattern Smithing - Seeing deeper patterns and connections", "Fractal Systems Architect - Building scalable, elegant systems", "Energetic Resonance - Authentic influence and magnetism", "Archetypal Content - Creating content that hits primal truths"], "section": "shadow_genius"},
        {"index": 6, "key": "genius_response", "text": "Genius Response: When did I feel most in my power today?", "type": "daily", "section": "shadow_genius"},
        {"index": 7, "key": "resistance_patterns", "text": "What resistance showed up today?", "type": "multi_choice", "options": ["Launch avoidance", "Conflict delay", "Perfectionism loop", "Control spiral"], "section": "momentum"},
        {"index": 8, "key": "energy_level", "text": "Energy Level: Rate your overall energy today", "type": "scale", "min": 1, "max": 10, "section": "momentum"},
        {"index": 9, "key": "energy_insight", "text": "Energy Insight: What gave me energy vs. drained it today?", "type": "daily", "section": "momentum"},
        {"index": 10, "key": "what_wants_completion", "text": "What Wants to Complete: What's been sitting unfinished that's creating background tension?", "type": "daily", "section": "action_bridge"},
        {"index": 11, "key": "tomorrow_truth_move", "text": "Tomorrow's Truth Move: One specific action I can take tomorrow that aligns with my truth (not my proving)", "type": "daily", "section": "action_bridge"},
        {"index": 12, "key": "breakthrough_action", "text": "72-Hour Breakthrough Action: What bold move could I make in the next 3 days that would shift my trajectory?", "type": "daily", "section": "action_bridge"},
        {"index": 13, "key": "mrr_community_focus", "text": "MRR/Community Focus: How did today's actions serve my goals?", "type": "daily", "section": "strategic"},
        {"index": 14, "key": "email_marketing_momentum", "text": "Email Marketing Momentum: What did I learn about my audience/message that I can apply tomorrow?", "type": "daily", "section": "strategic"},
        {"index": 15, "key": "daily_gratitude", "text": "Daily Gratitude + Recognition: List 3 things you're genuinely grateful for + 1 thing you did well today", "type": "daily", "section": "synthesis"},
        {"index": 16, "key": "tomorrow_intention", "text": "Tomorrow's Intention: If you could approach tomorrow from your highest self, what energy would you bring?", "type": "daily", "section": "synthesis"}
      ]
    }
  };
  
  return stacks[slug as keyof typeof stacks] || null;
};

// Simple in-memory session storage for demo purposes
const sessions = new Map();

export async function POST(request: NextRequest) {
  try {
    const { stackSlug, title } = await request.json();

    if (!stackSlug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the stack by slug
    const stack = getStackData(stackSlug);
    if (!stack) {
      console.error("Stack not found for slug:", stackSlug);
      return NextResponse.json(
        { error: "Stack not found" },
        { status: 404 }
      );
    }

    // Create new session with unique ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      stack_id: stack.id,
      user_id: null, // Support anonymous sessions
      title,
      status: 'in_progress',
      current_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: [],
      stack: {
        slug: stack.slug,
        title: stack.title,
        questions: stack.questions
      }
    };

    // Store session in memory
    sessions.set(sessionId, session);

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Get specific session from memory
      const session = sessions.get(sessionId);
      
      if (!session) {
        console.error("Session not found:", sessionId);
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(session);
    }

    // Get all sessions (for demo purposes, return all stored sessions)
    const allSessions = Array.from(sessions.values());
    
    return NextResponse.json(allSessions);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}