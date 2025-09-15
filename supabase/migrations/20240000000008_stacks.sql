-- Create Stacks table for templates
CREATE TABLE IF NOT EXISTS public.stacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    ai_summary_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create Stack Sessions table for individual user sessions
CREATE TABLE IF NOT EXISTS public.stack_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stack_id UUID NOT NULL REFERENCES public.stacks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
    current_index INTEGER DEFAULT 0,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create Stack Answers table for storing individual responses
CREATE TABLE IF NOT EXISTS public.stack_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.stack_sessions(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    question_key TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create Stack Summaries table for AI-generated summaries
CREATE TABLE IF NOT EXISTS public.stack_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES public.stack_sessions(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    summary_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE public.stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for stacks (public read, admin write)
CREATE POLICY "Anyone can view stacks" ON public.stacks
    FOR SELECT USING (true);

-- Create RLS Policies for stack_sessions
CREATE POLICY "Users can view own stack sessions" ON public.stack_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own stack sessions" ON public.stack_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own stack sessions" ON public.stack_sessions
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own stack sessions" ON public.stack_sessions
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS Policies for stack_answers
CREATE POLICY "Users can view answers from their sessions" ON public.stack_answers
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.stack_sessions 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

CREATE POLICY "Users can create answers in their sessions" ON public.stack_answers
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM public.stack_sessions 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Create RLS Policies for stack_summaries
CREATE POLICY "Users can view summaries from their sessions" ON public.stack_summaries
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.stack_sessions 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

CREATE POLICY "Users can create summaries for their sessions" ON public.stack_summaries
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM public.stack_sessions 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_stacks_slug ON public.stacks(slug);
CREATE INDEX idx_stack_sessions_stack_id ON public.stack_sessions(stack_id);
CREATE INDEX idx_stack_sessions_user_id ON public.stack_sessions(user_id);
CREATE INDEX idx_stack_sessions_status ON public.stack_sessions(status);
CREATE INDEX idx_stack_answers_session_id ON public.stack_answers(session_id);
CREATE INDEX idx_stack_answers_question_index ON public.stack_answers(question_index);
CREATE INDEX idx_stack_summaries_session_id ON public.stack_summaries(session_id);

-- Add updated_at triggers
CREATE TRIGGER handle_stacks_updated_at
    BEFORE UPDATE ON public.stacks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_stack_sessions_updated_at
    BEFORE UPDATE ON public.stack_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert the Gratitude Stack template
INSERT INTO public.stacks (slug, title, description, questions, ai_summary_instructions) VALUES (
    'gratitude',
    'Gratitude Stack',
    'A structured reflection process to explore and deepen your gratitude experiences through the CORE 4 framework.',
    '[
        {"index": 1, "key": "title", "text": "What are you going to title this Gratitude Stack?"},
        {"index": 2, "key": "domain", "text": "What domain of the CORE 4 are you stacking?"},
        {"index": 3, "key": "subject", "text": "Who/What are you stacking?"},
        {"index": 4, "key": "trigger", "text": "In this moment, why has [X] triggered you to feel grateful?"},
        {"index": 5, "key": "story", "text": "What is the story you''re telling yourself, created by this trigger, about [X] and the situation?"},
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
    ]'::jsonb,
    'Create a comprehensive and structured summary of this Gratitude Stack session. Organize the responses into themes and highlight key insights, revelations, and commitments. Format as a reflective narrative that captures the emotional journey and growth from this gratitude practice.'
);