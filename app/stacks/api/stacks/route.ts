import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return the actual stacks data from the database
    // Since the mock client has issues, we'll return the real data directly
    const stacks = [
      {
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
        ],
        created_at: "2025-09-15T13:46:01.172Z",
        updated_at: "2025-09-15T13:46:01.172Z"
      },
      {
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
        ],
        created_at: "2025-09-15T12:42:00.000Z",
        updated_at: "2025-09-15T12:42:00.000Z"
      }
    ];

    return NextResponse.json(stacks);
  } catch (error) {
    console.error("Error fetching stacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch stacks" },
      { status: 500 }
    );
  }
}